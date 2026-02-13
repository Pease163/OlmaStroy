from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.user import User
from app.schemas.user import UserSchema
from app.decorators import admin_required
from app.services.audit_service import log_action, get_entity_changes
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import paginated_list, get_or_404_json

user_schema = UserSchema()
users_schema = UserSchema(many=True)

UPDATABLE_FIELDS = ['username', 'email', 'is_admin', 'role_id', 'avatar_url', 'is_active']

SEARCH_FIELDS = ['username', 'email']


@admin_api_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    return paginated_list(User, users_schema, search_fields=SEARCH_FIELDS)


@admin_api_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    return get_or_404_json(User, user_id, user_schema)


@admin_api_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    password = data.pop('password', None)
    if not password or len(password) < 6:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Пароль должен быть не менее 6 символов'}}), 400

    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': {'code': 'DUPLICATE', 'message': 'Пользователь с таким логином уже существует'}}), 409
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': {'code': 'DUPLICATE', 'message': 'Пользователь с таким email уже существует'}}), 409

    try:
        user = user_schema.load(data, session=db.session)
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Ошибка валидации', 'details': err.messages}}), 400

    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    log_action('create', entity_type='user', entity_id=user.id, entity_title=user.username)
    db.session.commit()

    return jsonify({'data': user_schema.dump(user)}), 201


@admin_api_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    password = data.pop('password', None)
    changes = get_entity_changes(user, data, UPDATABLE_FIELDS)

    try:
        user = user_schema.load(data, instance=user, session=db.session, partial=True)
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Ошибка валидации', 'details': err.messages}}), 400

    if password and len(password) >= 6:
        user.set_password(password)
        if changes is None:
            changes = {}
        changes['password'] = {'old': '***', 'new': '***'}

    log_action('update', entity_type='user', entity_id=user.id,
               entity_title=user.username, changes=changes)
    db.session.commit()

    return jsonify({'data': user_schema.dump(user)}), 200


@admin_api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    current_user_id = int(get_jwt_identity())
    if user_id == current_user_id:
        return jsonify({'error': {'code': 'FORBIDDEN', 'message': 'Нельзя удалить самого себя'}}), 403

    user = User.query.get_or_404(user_id)
    username = user.username
    log_action('delete', entity_type='user', entity_id=user_id, entity_title=username)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'data': {'message': 'Пользователь удалён'}}), 200

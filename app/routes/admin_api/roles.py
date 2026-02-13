from flask import request, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models.role import Role, Permission
from app.decorators import admin_required
from app.services.audit_service import log_action
from app.routes.admin_api import admin_api_bp


@admin_api_bp.route('/roles', methods=['GET'])
@admin_required
def list_roles():
    roles = Role.query.all()
    return jsonify({'data': [r.to_dict() for r in roles]}), 200


@admin_api_bp.route('/roles/<int:role_id>', methods=['GET'])
@admin_required
def get_role(role_id):
    role = Role.query.get_or_404(role_id)
    return jsonify({'data': role.to_dict()}), 200


@admin_api_bp.route('/roles', methods=['POST'])
@admin_required
def create_role():
    data = request.get_json(silent=True)
    if not data or not data.get('name'):
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Название роли обязательно'}}), 400

    if Role.query.filter_by(name=data['name']).first():
        return jsonify({'error': {'code': 'DUPLICATE', 'message': 'Роль с таким именем уже существует'}}), 409

    role = Role(name=data['name'], description=data.get('description', ''))

    # Assign permissions
    perm_codenames = data.get('permissions', [])
    if perm_codenames:
        perms = Permission.query.filter(Permission.codename.in_(perm_codenames)).all()
        role.permissions = perms

    db.session.add(role)
    db.session.flush()
    log_action('create', entity_type='role', entity_id=role.id, entity_title=role.name)
    db.session.commit()

    return jsonify({'data': role.to_dict()}), 201


@admin_api_bp.route('/roles/<int:role_id>', methods=['PUT'])
@admin_required
def update_role(role_id):
    role = Role.query.get_or_404(role_id)
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    if role.is_system:
        return jsonify({'error': {'code': 'FORBIDDEN', 'message': 'Системную роль нельзя изменить'}}), 403

    if 'name' in data:
        role.name = data['name']
    if 'description' in data:
        role.description = data['description']

    if 'permissions' in data:
        perms = Permission.query.filter(Permission.codename.in_(data['permissions'])).all()
        role.permissions = perms

    log_action('update', entity_type='role', entity_id=role.id, entity_title=role.name)
    db.session.commit()

    return jsonify({'data': role.to_dict()}), 200


@admin_api_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@admin_required
def delete_role(role_id):
    role = Role.query.get_or_404(role_id)
    if role.is_system:
        return jsonify({'error': {'code': 'FORBIDDEN', 'message': 'Системную роль нельзя удалить'}}), 403

    log_action('delete', entity_type='role', entity_id=role.id, entity_title=role.name)
    db.session.delete(role)
    db.session.commit()
    return jsonify({'data': {'message': 'Роль удалена'}}), 200


@admin_api_bp.route('/permissions', methods=['GET'])
@admin_required
def list_permissions():
    permissions = Permission.query.order_by(Permission.group, Permission.codename).all()

    grouped = {}
    for p in permissions:
        group = p.group or 'general'
        if group not in grouped:
            grouped[group] = []
        grouped[group].append(p.to_dict())

    return jsonify({'data': grouped}), 200

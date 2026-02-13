from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user_session import UserSession
from app.models.token_blocklist import TokenBlocklist
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp


@admin_api_bp.route('/users/<int:user_id>/sessions', methods=['GET'])
@admin_required
def list_user_sessions(user_id):
    sessions = UserSession.query.filter_by(
        user_id=user_id, is_active=True
    ).order_by(UserSession.last_active.desc()).all()

    return jsonify({'data': [s.to_dict() for s in sessions]}), 200


@admin_api_bp.route('/users/<int:user_id>/sessions/<int:session_id>', methods=['DELETE'])
@admin_required
def terminate_session(user_id, session_id):
    session = UserSession.query.filter_by(
        id=session_id, user_id=user_id
    ).first_or_404()

    session.is_active = False

    # Block the refresh token
    db.session.add(TokenBlocklist(jti=session.jti, type='refresh'))
    db.session.commit()

    return jsonify({'data': {'message': 'Сессия завершена'}}), 200

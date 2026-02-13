from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User


def admin_required(fn):
    """Decorator that requires the user to be an admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return jsonify({'error': {'code': 'FORBIDDEN', 'message': 'Доступ запрещён'}}), 403
        if not user.is_active:
            return jsonify({'error': {'code': 'ACCOUNT_DISABLED', 'message': 'Аккаунт деактивирован'}}), 403
        return fn(*args, **kwargs)
    return wrapper


def permission_required(codename):
    """Decorator that requires a specific permission."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'error': {'code': 'FORBIDDEN', 'message': 'Доступ запрещён'}}), 403
            if not user.has_permission(codename):
                return jsonify({'error': {'code': 'NO_PERMISSION', 'message': 'Недостаточно прав'}}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

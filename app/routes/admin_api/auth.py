from datetime import datetime

import pyotp
import qrcode
import qrcode.image.pil
import io
import base64

from flask import request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt,
    set_refresh_cookies, unset_jwt_cookies,
    decode_token,
)

from app.extensions import db, limiter
from app.models.user import User
from app.models.token_blocklist import TokenBlocklist
from app.models.user_session import UserSession
from app.services.audit_service import log_action
from app.routes.admin_api import admin_api_bp


@admin_api_bp.route('/auth/login', methods=['POST'])
@limiter.limit(lambda: current_app.config['AUTH_RATE_LIMIT'])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '')
    totp_code = data.get('totp_code', '').strip()

    if not username or not password:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Введите логин и пароль'}}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': {'code': 'INVALID_CREDENTIALS', 'message': 'Неверный логин или пароль'}}), 401

    if not user.is_admin:
        return jsonify({'error': {'code': 'FORBIDDEN', 'message': 'Доступ запрещён'}}), 403

    if not user.is_active:
        return jsonify({'error': {'code': 'ACCOUNT_DISABLED', 'message': 'Аккаунт деактивирован'}}), 403

    # 2FA check
    if user.is_2fa_enabled:
        if not totp_code:
            return jsonify({
                'error': {'code': '2FA_REQUIRED', 'message': 'Введите код 2FA'},
                'requires_2fa': True,
            }), 401
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(totp_code, valid_window=1):
            return jsonify({'error': {'code': 'INVALID_2FA', 'message': 'Неверный код 2FA'}}), 401

    # Create tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Create session record
    decoded = decode_token(refresh_token)
    session = UserSession(
        user_id=user.id,
        jti=decoded['jti'],
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent', '')[:500],
        device_info=_parse_device(request.headers.get('User-Agent', '')),
    )
    db.session.add(session)
    db.session.commit()

    log_action('login', user_id=user.id)
    db.session.commit()

    response = jsonify({
        'data': {
            'access_token': access_token,
            'user': user.to_dict(include_role=True),
        }
    })
    set_refresh_cookies(response, refresh_token)
    return response, 200


@admin_api_bp.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return jsonify({'error': {'code': 'INVALID_TOKEN', 'message': 'Невалидный токен'}}), 401

    access_token = create_access_token(identity=str(user_id))

    # Update session last_active
    jti = get_jwt()['jti']
    session = UserSession.query.filter_by(jti=jti, is_active=True).first()
    if session:
        session.last_active = datetime.utcnow()
        db.session.commit()

    return jsonify({'data': {'access_token': access_token}}), 200


@admin_api_bp.route('/auth/logout', methods=['POST'])
@jwt_required(verify_type=False)
def logout():
    jwt_data = get_jwt()
    jti = jwt_data['jti']
    token_type = jwt_data['type']

    # Block current token
    db.session.add(TokenBlocklist(jti=jti, type=token_type))

    # Deactivate session
    session = UserSession.query.filter_by(jti=jti, is_active=True).first()
    if session:
        session.is_active = False

    user_id = int(get_jwt_identity())
    log_action('logout', user_id=user_id)
    db.session.commit()

    response = jsonify({'data': {'message': 'Вы вышли из системы'}})
    unset_jwt_cookies(response)
    return response, 200


@admin_api_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Пользователь не найден'}}), 404
    return jsonify({'data': user.to_dict(include_role=True)}), 200


@admin_api_bp.route('/auth/2fa/setup', methods=['POST'])
@jwt_required()
def setup_2fa():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.is_2fa_enabled:
        return jsonify({'error': {'code': 'ALREADY_ENABLED', 'message': '2FA уже включена'}}), 400

    secret = pyotp.random_base32()
    user.totp_secret = secret
    db.session.commit()

    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name=current_app.config['TOTP_ISSUER'])

    # Generate QR code as base64
    img = qrcode.make(provisioning_uri, image_factory=qrcode.image.pil.PilImage)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    qr_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')

    return jsonify({
        'data': {
            'secret': secret,
            'qr_code': f'data:image/png;base64,{qr_base64}',
        }
    }), 200


@admin_api_bp.route('/auth/2fa/verify', methods=['POST'])
@jwt_required()
def verify_2fa():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json(silent=True) or {}
    code = data.get('code', '').strip()

    if not user.totp_secret:
        return jsonify({'error': {'code': 'NOT_SETUP', 'message': 'Сначала настройте 2FA'}}), 400

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(code, valid_window=1):
        return jsonify({'error': {'code': 'INVALID_CODE', 'message': 'Неверный код'}}), 400

    user.is_2fa_enabled = True
    db.session.commit()
    log_action('update', entity_type='user', entity_id=user.id,
               entity_title=user.username, changes={'2fa': {'old': 'disabled', 'new': 'enabled'}})
    db.session.commit()

    return jsonify({'data': {'message': '2FA успешно включена'}}), 200


@admin_api_bp.route('/auth/2fa/disable', methods=['POST'])
@jwt_required()
def disable_2fa():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json(silent=True) or {}
    password = data.get('password', '')

    if not user.check_password(password):
        return jsonify({'error': {'code': 'INVALID_PASSWORD', 'message': 'Неверный пароль'}}), 400

    user.is_2fa_enabled = False
    user.totp_secret = None
    db.session.commit()
    log_action('update', entity_type='user', entity_id=user.id,
               entity_title=user.username, changes={'2fa': {'old': 'enabled', 'new': 'disabled'}})
    db.session.commit()

    return jsonify({'data': {'message': '2FA отключена'}}), 200


def _parse_device(user_agent):
    """Simple device info extraction from User-Agent."""
    ua = user_agent.lower()
    if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
        return 'Mobile'
    if 'tablet' in ua or 'ipad' in ua:
        return 'Tablet'
    return 'Desktop'

from flask import jsonify


def init_jwt_handlers(jwt):
    """Register JWT callback handlers."""

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        from app.models.token_blocklist import TokenBlocklist
        jti = jwt_payload['jti']
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': {'code': 'TOKEN_EXPIRED', 'message': 'Токен истёк'}}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': {'code': 'INVALID_TOKEN', 'message': 'Невалидный токен'}}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': {'code': 'MISSING_TOKEN', 'message': 'Токен не предоставлен'}}), 401

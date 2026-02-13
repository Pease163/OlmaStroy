from flask import request, jsonify
from flask_jwt_extended import jwt_required

from app.models.audit_log import AuditLog
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp


@admin_api_bp.route('/audit-log', methods=['GET'])
@admin_required
def list_audit_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    action = request.args.get('action')
    entity_type = request.args.get('entity_type')
    user_id = request.args.get('user_id', type=int)

    query = AuditLog.query

    if action:
        query = query.filter_by(action=action)
    if entity_type:
        query = query.filter_by(entity_type=entity_type)
    if user_id:
        query = query.filter_by(user_id=user_id)

    query = query.order_by(AuditLog.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'data': [log.to_dict() for log in pagination.items],
        'meta': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
        }
    }), 200

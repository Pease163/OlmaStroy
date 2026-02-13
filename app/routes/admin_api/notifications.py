from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.notification import Notification
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp


@admin_api_bp.route('/notifications', methods=['GET'])
@admin_required
def list_notifications():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'

    query = Notification.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)

    query = query.order_by(Notification.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return jsonify({
        'data': [n.to_dict() for n in pagination.items],
        'meta': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'unread_count': unread_count,
        }
    }), 200


@admin_api_bp.route('/notifications/read-all', methods=['PUT'])
@admin_required
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'data': {'message': 'Все уведомления отмечены как прочитанные'}}), 200


@admin_api_bp.route('/notifications/<int:notification_id>', methods=['PUT'])
@admin_required
def mark_notification_read(notification_id):
    user_id = int(get_jwt_identity())
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first_or_404()
    notification.is_read = True
    db.session.commit()
    return jsonify({'data': notification.to_dict()}), 200


@admin_api_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@admin_required
def delete_notification(notification_id):
    user_id = int(get_jwt_identity())
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first_or_404()
    db.session.delete(notification)
    db.session.commit()
    return jsonify({'data': {'message': 'Уведомление удалено'}}), 200

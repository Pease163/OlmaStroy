import json
from flask import request, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models.site_setting import SiteSetting
from app.decorators import admin_required
from app.services.audit_service import log_action
from app.routes.admin_api import admin_api_bp


@admin_api_bp.route('/settings', methods=['GET'])
@admin_required
def get_settings():
    settings = SiteSetting.query.order_by(SiteSetting.group, SiteSetting.order).all()

    # Group by category
    grouped = {}
    for s in settings:
        group = s.group or 'general'
        if group not in grouped:
            grouped[group] = []
        grouped[group].append(s.to_dict())

    return jsonify({'data': grouped}), 200


@admin_api_bp.route('/settings', methods=['PUT'])
@admin_required
def update_settings():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    changes = {}
    for key, value in data.items():
        setting = SiteSetting.query.filter_by(key=key).first()
        if setting:
            old_value = setting.value
            if setting.value_type == 'json':
                try:
                    setting.value = json.dumps(value) if not isinstance(value, str) else value
                except (TypeError, ValueError):
                    return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': f'Невалидное JSON значение для {key}'}}), 400
            elif setting.value_type == 'boolean':
                setting.value = str(value).lower()
            else:
                setting.value = str(value) if value is not None else None

            if old_value != setting.value:
                changes[key] = {'old': old_value, 'new': setting.value}

    if changes:
        log_action('update', entity_type='settings', changes=changes)

    db.session.commit()
    return jsonify({'data': {'message': 'Настройки сохранены'}}), 200

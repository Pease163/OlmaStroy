from flask import request, jsonify

from app.extensions import db
from app.models.contact import ContactSubmission
from app.schemas.contact import ContactSubmissionSchema
from app.decorators import admin_required
from app.services.audit_service import log_action
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import (
    paginated_list, get_or_404_json, delete_item, bulk_delete,
)

contact_schema = ContactSubmissionSchema()
contacts_schema = ContactSubmissionSchema(many=True)

SEARCH_FIELDS = ['name', 'email', 'phone', 'subject']
FILTER_FIELDS = [('is_read', 'is_read', True)]


@admin_api_bp.route('/contacts', methods=['GET'])
@admin_required
def list_contacts():
    return paginated_list(ContactSubmission, contacts_schema, search_fields=SEARCH_FIELDS, filter_fields=FILTER_FIELDS)


@admin_api_bp.route('/contacts/<int:contact_id>', methods=['GET'])
@admin_required
def get_contact(contact_id):
    return get_or_404_json(ContactSubmission, contact_id, contact_schema)


@admin_api_bp.route('/contacts/<int:contact_id>/read', methods=['PUT'])
@admin_required
def mark_contact_read(contact_id):
    contact = ContactSubmission.query.get_or_404(contact_id)
    contact.is_read = True
    log_action('update', entity_type='contact', entity_id=contact.id,
               entity_title=contact.name,
               changes={'is_read': {'old': 'False', 'new': 'True'}})
    db.session.commit()
    return jsonify({'data': contact_schema.dump(contact)}), 200


@admin_api_bp.route('/contacts/bulk-read', methods=['POST'])
@admin_required
def bulk_read_contacts():
    data = request.get_json(silent=True) or {}
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Не указаны ID'}}), 400

    items = ContactSubmission.query.filter(ContactSubmission.id.in_(ids)).all()
    if len(items) != len(ids):
        found_ids = {item.id for item in items}
        missing = [i for i in ids if i not in found_ids]
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': f'Не найдены записи с ID: {missing}'}}), 404
    for item in items:
        item.is_read = True
    db.session.commit()

    return jsonify({'data': {'message': f'Отмечено прочитанными: {len(items)}'}}), 200


@admin_api_bp.route('/contacts/<int:contact_id>', methods=['DELETE'])
@admin_required
def delete_contact(contact_id):
    return delete_item(ContactSubmission, contact_id, 'contact', 'Заявка удалена')


@admin_api_bp.route('/contacts/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_contacts():
    return bulk_delete(ContactSubmission, 'contact')

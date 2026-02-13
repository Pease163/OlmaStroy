from flask import request, jsonify
from marshmallow import ValidationError

from app.extensions import db
from app.models.audit_log import AuditLog
from app.services.audit_service import log_action, get_entity_changes


def paginated_list(model, schema_many, search_fields=None, filter_fields=None, default_sort='created_at', default_order='desc'):
    """Generic paginated list with search and filtering."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    sort = request.args.get('sort', default_sort)
    order = request.args.get('order', default_order)
    search = request.args.get('search', '').strip()

    query = model.query

    if search and search_fields:
        pattern = f'%{search}%'
        conditions = [getattr(model, f).ilike(pattern) for f in search_fields if hasattr(model, f)]
        if conditions:
            query = query.filter(db.or_(*conditions))

    if filter_fields:
        for field_name, param_name, is_bool in filter_fields:
            value = request.args.get(param_name)
            if value is not None:
                if is_bool:
                    query = query.filter(getattr(model, field_name) == (value.lower() == 'true'))
                else:
                    query = query.filter(getattr(model, field_name) == value)

    sort_col = getattr(model, sort, getattr(model, default_sort))
    if order == 'desc':
        sort_col = sort_col.desc()
    query = query.order_by(sort_col)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'data': schema_many.dump(pagination.items),
        'meta': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
        }
    }), 200


def get_or_404_json(model, item_id, schema):
    """Get a single item or return 404."""
    item = model.query.get_or_404(item_id)
    return jsonify({'data': schema.dump(item)}), 200


def create_item(model, schema, entity_type, slug_field=None):
    """Create a new item with validation and audit logging."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    try:
        item = schema.load(data, session=db.session)
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Ошибка валидации', 'details': err.messages}}), 400

    if slug_field and hasattr(model, 'generate_slug') and 'title' in data:
        item.slug = model.generate_slug(data['title'])

    db.session.add(item)
    db.session.flush()

    log_action('create', entity_type=entity_type, entity_id=item.id, entity_title=getattr(item, 'title', str(item.id)))
    db.session.commit()

    return jsonify({'data': schema.dump(item)}), 201


def update_item(model, schema, item_id, entity_type, updatable_fields, slug_field=None):
    """Update an existing item with validation and audit logging."""
    item = model.query.get_or_404(item_id)
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    changes = get_entity_changes(item, data, updatable_fields)

    try:
        item = schema.load(data, instance=item, session=db.session, partial=True)
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Ошибка валидации', 'details': err.messages}}), 400

    if slug_field and hasattr(model, 'generate_slug') and 'title' in data:
        item.slug = model.generate_slug(data['title'])

    log_action('update', entity_type=entity_type, entity_id=item.id,
               entity_title=getattr(item, 'title', str(item.id)), changes=changes)
    db.session.commit()

    return jsonify({'data': schema.dump(item)}), 200


def patch_item(model, schema, item_id, entity_type, updatable_fields):
    """Patch specific fields of an item."""
    item = model.query.get_or_404(item_id)
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    changes = get_entity_changes(item, data, updatable_fields)

    for field in updatable_fields:
        if field in data:
            setattr(item, field, data[field])

    log_action('update', entity_type=entity_type, entity_id=item.id,
               entity_title=getattr(item, 'title', str(item.id)), changes=changes)
    db.session.commit()

    return jsonify({'data': schema.dump(item)}), 200


def delete_item(model, item_id, entity_type, message='Запись удалена'):
    """Delete a single item with audit logging."""
    item = model.query.get_or_404(item_id)
    title = getattr(item, 'title', getattr(item, 'name', str(item.id)))
    log_action('delete', entity_type=entity_type, entity_id=item_id, entity_title=title)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'data': {'message': message}}), 200


def bulk_delete(model, entity_type):
    """Bulk delete items with audit logging."""
    data = request.get_json(silent=True) or {}
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Не указаны ID'}}), 400

    items = model.query.filter(model.id.in_(ids)).all()
    for item in items:
        title = getattr(item, 'title', getattr(item, 'name', str(item.id)))
        log_action('delete', entity_type=entity_type, entity_id=item.id, entity_title=title)
        db.session.delete(item)
    db.session.commit()

    return jsonify({'data': {'message': f'Удалено записей: {len(items)}'}}), 200


def bulk_toggle(model, entity_type, field_name, param_name):
    """Bulk toggle a boolean field with audit logging."""
    data = request.get_json(silent=True) or {}
    ids = data.get('ids', [])
    value = data.get(param_name, True)

    items = model.query.filter(model.id.in_(ids)).all()
    for item in items:
        setattr(item, field_name, value)
        title = getattr(item, 'title', getattr(item, 'name', str(item.id)))
        log_action('update', entity_type=entity_type, entity_id=item.id,
                   entity_title=title,
                   changes={field_name: {'old': str(not value), 'new': str(value)}})
    db.session.commit()

    return jsonify({'data': {'message': f'Обновлено записей: {len(items)}'}}), 200


def entity_history(model, entity_type, item_id):
    """Get audit history for an entity."""
    model.query.get_or_404(item_id)
    logs = AuditLog.query.filter_by(
        entity_type=entity_type, entity_id=item_id
    ).order_by(AuditLog.created_at.desc()).all()
    return jsonify({'data': [log.to_dict() for log in logs]}), 200

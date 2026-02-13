from flask import request
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.audit_log import AuditLog


def log_action(action, entity_type=None, entity_id=None, entity_title=None,
               changes=None, user_id=None):
    """Record an action in the audit log."""
    if user_id is None:
        try:
            uid = get_jwt_identity()
            user_id = int(uid) if uid is not None else None
        except (RuntimeError, TypeError, ValueError):
            pass

    ip_address = request.remote_addr if request else None
    user_agent = request.headers.get('User-Agent', '')[:500] if request else None

    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_title=entity_title,
        changes=changes,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.session.add(entry)
    return entry


def get_entity_changes(instance, data, fields):
    """Compare current instance fields with new data and return changes dict."""
    changes = {}
    for field in fields:
        if field in data:
            old_value = getattr(instance, field, None)
            new_value = data[field]
            if old_value != new_value:
                # Convert to string for JSON serialization
                changes[field] = {
                    'old': str(old_value) if old_value is not None else None,
                    'new': str(new_value) if new_value is not None else None,
                }
    return changes if changes else None

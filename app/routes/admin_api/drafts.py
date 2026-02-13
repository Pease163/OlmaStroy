from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.draft import Draft
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp


@admin_api_bp.route('/drafts/<entity_type>/<int:entity_id>', methods=['GET'])
@admin_required
def get_draft(entity_type, entity_id):
    user_id = int(get_jwt_identity())
    draft = Draft.query.filter_by(
        user_id=user_id, entity_type=entity_type, entity_id=entity_id
    ).first()

    if not draft:
        return jsonify({'data': None}), 200

    return jsonify({'data': draft.to_dict()}), 200


@admin_api_bp.route('/drafts/<entity_type>/<int:entity_id>', methods=['PUT'])
@admin_required
def save_draft(entity_type, entity_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    draft = Draft.query.filter_by(
        user_id=user_id, entity_type=entity_type, entity_id=entity_id
    ).first()

    if draft:
        draft.data = data.get('data', {})
    else:
        draft = Draft(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            data=data.get('data', {}),
        )
        db.session.add(draft)

    db.session.commit()
    return jsonify({'data': draft.to_dict()}), 200


@admin_api_bp.route('/drafts/<entity_type>/<int:entity_id>', methods=['DELETE'])
@admin_required
def delete_draft(entity_type, entity_id):
    user_id = int(get_jwt_identity())
    draft = Draft.query.filter_by(
        user_id=user_id, entity_type=entity_type, entity_id=entity_id
    ).first()

    if draft:
        db.session.delete(draft)
        db.session.commit()

    return jsonify({'data': {'message': 'Черновик удалён'}}), 200

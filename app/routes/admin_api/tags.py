from flask import request, jsonify

from app.extensions import db
from app.models.tag import Tag
from app.schemas.tag import TagSchema
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp
from app.utils.slug import generate_slug

tag_schema = TagSchema()
tags_schema = TagSchema(many=True)


@admin_api_bp.route('/tags', methods=['GET'])
@admin_required
def list_tags():
    tags = Tag.query.order_by(Tag.name).all()
    return jsonify({'data': tags_schema.dump(tags)}), 200


@admin_api_bp.route('/tags', methods=['POST'])
@admin_required
def create_tag():
    data = request.get_json(silent=True)
    if not data or not data.get('name'):
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Имя тега обязательно'}}), 400

    name = data['name'].strip()
    slug = generate_slug(name)

    existing = Tag.query.filter_by(slug=slug).first()
    if existing:
        return jsonify({'data': tag_schema.dump(existing)}), 200

    tag = Tag(name=name, slug=slug)
    db.session.add(tag)
    db.session.commit()
    return jsonify({'data': tag_schema.dump(tag)}), 201


@admin_api_bp.route('/tags/<int:tag_id>', methods=['DELETE'])
@admin_required
def delete_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id)
    db.session.delete(tag)
    db.session.commit()
    return jsonify({'data': {'message': 'Тег удалён'}}), 200

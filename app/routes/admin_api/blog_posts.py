from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.blog import BlogPost
from app.models.tag import Tag
from app.models.audit_log import AuditLog
from app.schemas.blog import BlogPostSchema
from app.decorators import admin_required
from app.services.audit_service import log_action
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import (
    paginated_list, get_or_404_json, create_item, update_item,
    patch_item, delete_item, bulk_delete, bulk_toggle, entity_history,
)

blog_schema = BlogPostSchema()
blogs_schema = BlogPostSchema(many=True)

UPDATABLE_FIELDS = ['title', 'content', 'excerpt', 'image_url', 'is_published', 'publish_at', 'meta_title', 'meta_description']

SEARCH_FIELDS = ['title', 'content']
FILTER_FIELDS = [('is_published', 'is_published', True)]


@admin_api_bp.route('/blog-posts', methods=['GET'])
@admin_required
def list_blog_posts():
    return paginated_list(BlogPost, blogs_schema, search_fields=SEARCH_FIELDS, filter_fields=FILTER_FIELDS)


@admin_api_bp.route('/blog-posts/<int:post_id>', methods=['GET'])
@admin_required
def get_blog_post(post_id):
    return get_or_404_json(BlogPost, post_id, blog_schema)


@admin_api_bp.route('/blog-posts', methods=['POST'])
@admin_required
def create_blog_post():
    result = create_item(BlogPost, blog_schema, 'blog_post', slug_field='slug')
    # Handle tags after creation
    data = request.get_json(silent=True) or {}
    tag_ids = data.get('tag_ids')
    if tag_ids is not None and result[1] == 201:
        resp_data = result[0].get_json()
        post = BlogPost.query.get(resp_data['data']['id'])
        if post:
            post.tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()
            db.session.commit()
    return result


@admin_api_bp.route('/blog-posts/<int:post_id>', methods=['PUT'])
@admin_required
def update_blog_post(post_id):
    data = request.get_json(silent=True) or {}
    tag_ids = data.get('tag_ids')
    result = update_item(BlogPost, blog_schema, post_id, 'blog_post', UPDATABLE_FIELDS, slug_field='slug')
    if tag_ids is not None:
        post = BlogPost.query.get(post_id)
        if post:
            post.tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()
            db.session.commit()
    return result


@admin_api_bp.route('/blog-posts/<int:post_id>', methods=['PATCH'])
@admin_required
def patch_blog_post(post_id):
    return patch_item(BlogPost, blog_schema, post_id, 'blog_post', UPDATABLE_FIELDS)


@admin_api_bp.route('/blog-posts/<int:post_id>', methods=['DELETE'])
@admin_required
def delete_blog_post(post_id):
    return delete_item(BlogPost, post_id, 'blog_post', 'Пост удалён')


@admin_api_bp.route('/blog-posts/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_blog_posts():
    return bulk_delete(BlogPost, 'blog_post')


@admin_api_bp.route('/blog-posts/bulk-publish', methods=['POST'])
@admin_required
def bulk_publish_blog_posts():
    return bulk_toggle(BlogPost, 'blog_post', 'is_published', 'publish')


@admin_api_bp.route('/blog-posts/<int:post_id>/history', methods=['GET'])
@admin_required
def blog_post_history(post_id):
    return entity_history(BlogPost, 'blog_post', post_id)


@admin_api_bp.route('/blog-posts/<int:post_id>/rollback/<int:audit_id>', methods=['POST'])
@admin_required
def rollback_blog_post(post_id, audit_id):
    post = BlogPost.query.get_or_404(post_id)
    audit_entry = AuditLog.query.get_or_404(audit_id)

    if audit_entry.entity_type != 'blog_post' or audit_entry.entity_id != post_id:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Запись аудита не соответствует посту'}}), 400

    if not audit_entry.changes:
        return jsonify({'error': {'code': 'NO_CHANGES', 'message': 'Нет данных для отката'}}), 400

    rollback_changes = {}
    for field, vals in audit_entry.changes.items():
        if hasattr(post, field):
            rollback_changes[field] = {'old': str(getattr(post, field)), 'new': vals.get('old')}
            setattr(post, field, vals.get('old'))

    log_action('update', entity_type='blog_post', entity_id=post.id,
               entity_title=post.title, changes=rollback_changes)
    db.session.commit()

    return jsonify({'data': blog_schema.dump(post)}), 200

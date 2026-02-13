from flask import request, jsonify
from marshmallow import ValidationError

from app.extensions import db
from app.models.project import Project
from app.models.project_image import ProjectImage
from app.schemas.project_image import ProjectImageSchema
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp
from app.services.audit_service import log_action

image_schema = ProjectImageSchema()
images_schema = ProjectImageSchema(many=True)


@admin_api_bp.route('/projects/<int:project_id>/images', methods=['GET'])
@admin_required
def list_project_images(project_id):
    Project.query.get_or_404(project_id)
    images = ProjectImage.query.filter_by(project_id=project_id).order_by(ProjectImage.order).all()
    return jsonify({'data': images_schema.dump(images)}), 200


@admin_api_bp.route('/projects/<int:project_id>/images', methods=['POST'])
@admin_required
def create_project_image(project_id):
    Project.query.get_or_404(project_id)
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    data['project_id'] = project_id
    try:
        image = image_schema.load(data, session=db.session)
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': 'Ошибка валидации', 'details': err.messages}}), 400

    db.session.add(image)
    db.session.flush()
    log_action('create', entity_type='project_image', entity_id=image.id, entity_title=str(image.id))
    db.session.commit()

    return jsonify({'data': image_schema.dump(image)}), 201


@admin_api_bp.route('/projects/<int:project_id>/images/<int:image_id>', methods=['PATCH'])
@admin_required
def update_project_image(project_id, image_id):
    Project.query.get_or_404(project_id)
    image = ProjectImage.query.filter_by(id=image_id, project_id=project_id).first_or_404()
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Неверный формат данных'}}), 400

    if 'caption' in data:
        image.caption = data['caption']
    if 'order' in data:
        image.order = data['order']

    log_action('update', entity_type='project_image', entity_id=image.id, entity_title=str(image.id))
    db.session.commit()
    return jsonify({'data': image_schema.dump(image)}), 200


@admin_api_bp.route('/projects/<int:project_id>/images/reorder', methods=['POST'])
@admin_required
def reorder_project_images(project_id):
    Project.query.get_or_404(project_id)
    data = request.get_json(silent=True)
    if not data or 'ids' not in data:
        return jsonify({'error': {'code': 'BAD_REQUEST', 'message': 'Укажите ids'}}), 400

    for idx, image_id in enumerate(data['ids']):
        image = ProjectImage.query.filter_by(id=image_id, project_id=project_id).first()
        if image:
            image.order = idx

    db.session.commit()
    images = ProjectImage.query.filter_by(project_id=project_id).order_by(ProjectImage.order).all()
    return jsonify({'data': images_schema.dump(images)}), 200


@admin_api_bp.route('/projects/<int:project_id>/images/<int:image_id>', methods=['DELETE'])
@admin_required
def delete_project_image(project_id, image_id):
    Project.query.get_or_404(project_id)
    image = ProjectImage.query.filter_by(id=image_id, project_id=project_id).first_or_404()
    log_action('delete', entity_type='project_image', entity_id=image.id, entity_title=str(image.id))
    db.session.delete(image)
    db.session.commit()
    return jsonify({'data': {'message': 'Изображение удалено'}}), 200

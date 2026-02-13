import os
import uuid
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from app.decorators import admin_required
from app.utils import process_image
from app.routes.admin_api import admin_api_bp
from app.services.audit_service import log_action

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@admin_api_bp.route('/upload', methods=['POST'])
@admin_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': {'code': 'NO_FILE', 'message': 'Файл не прикреплён'}}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': {'code': 'NO_FILE', 'message': 'Файл не выбран'}}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': {'code': 'INVALID_TYPE', 'message': 'Недопустимый тип файла'}}), 400

    parts = file.filename.rsplit('.', 1)
    if len(parts) < 2:
        return jsonify({'error': {'code': 'INVALID_TYPE', 'message': 'Файл не имеет расширения'}}), 400
    ext = parts[1].lower()
    filename = f'{uuid.uuid4().hex}.{ext}'
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    result = {'url': f'/static/uploads/{filename}'}

    # Process image (resize, WebP)
    if ext in {'png', 'jpg', 'jpeg', 'gif'}:
        try:
            processed = process_image(filepath, output_dir=upload_dir)
            if 'webp' in processed:
                result['webp_url'] = f'/static/uploads/{os.path.basename(processed["webp"])}'
            if 'thumbnail' in processed:
                result['thumbnail_url'] = f'/static/uploads/{os.path.basename(processed["thumbnail"])}'
        except (IOError, ValueError, OSError) as e:
            current_app.logger.warning('Image processing failed for %s: %s', filename, e)

    return jsonify({'data': result}), 201


@admin_api_bp.route('/media', methods=['GET'])
@admin_required
def list_media():
    upload_dir = current_app.config['UPLOAD_FOLDER']
    if not os.path.isdir(upload_dir):
        return jsonify({'data': [], 'meta': {'total': 0}}), 200

    search = request.args.get('search', '').lower()
    files = []
    for name in os.listdir(upload_dir):
        filepath = os.path.join(upload_dir, name)
        if not os.path.isfile(filepath):
            continue
        if name.startswith('.'):
            continue
        if search and search not in name.lower():
            continue
        ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
        stat = os.stat(filepath)
        files.append({
            'name': name,
            'url': f'/static/uploads/{name}',
            'size': stat.st_size,
            'is_image': ext in IMAGE_EXTENSIONS,
            'modified': stat.st_mtime,
        })

    files.sort(key=lambda f: f['modified'], reverse=True)
    return jsonify({'data': files, 'meta': {'total': len(files)}}), 200


@admin_api_bp.route('/media/<path:filename>', methods=['DELETE'])
@admin_required
def delete_media(filename):
    upload_dir = current_app.config['UPLOAD_FOLDER']
    filepath = os.path.join(upload_dir, filename)

    if not os.path.isfile(filepath) or '..' in filename:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Файл не найден'}}), 404

    os.remove(filepath)
    log_action('delete', entity_type='media', entity_title=filename)
    return jsonify({'data': {'message': 'Файл удалён'}}), 200

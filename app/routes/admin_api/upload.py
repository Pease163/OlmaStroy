import os
import uuid
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename

from app.decorators import admin_required
from app.utils import process_image
from app.utils.slug import generate_slug
from app.routes.admin_api import admin_api_bp
from app.services.audit_service import log_action

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf'}
IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
PDF_EXTENSIONS = {'pdf'}
DOCUMENTS_SUBDIR = 'documents'


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def build_storage_name(filename, ext):
    stem = os.path.splitext(filename)[0]
    normalized_stem = generate_slug(stem) or secure_filename(stem) or 'file'
    return f'{normalized_stem}-{uuid.uuid4().hex[:10]}.{ext}'


def resolve_upload_dir(ext):
    base_upload_dir = current_app.config['UPLOAD_FOLDER']
    relative_dir = DOCUMENTS_SUBDIR if ext in PDF_EXTENSIONS else ''
    upload_dir = os.path.join(base_upload_dir, relative_dir) if relative_dir else base_upload_dir
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir, relative_dir


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
    filename = build_storage_name(file.filename, ext)
    upload_dir, relative_dir = resolve_upload_dir(ext)

    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    relative_path = '/'.join(part for part in [relative_dir, filename] if part)
    result = {'url': f'/static/uploads/{relative_path}'}

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
    for root, _, names in os.walk(upload_dir):
        for name in names:
            if name.startswith('.'):
                continue
            filepath = os.path.join(root, name)
            if not os.path.isfile(filepath):
                continue
            relative_name = os.path.relpath(filepath, upload_dir).replace(os.sep, '/')
            if search and search not in relative_name.lower():
                continue
            ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
            stat = os.stat(filepath)
            files.append({
                'name': relative_name,
                'url': f'/static/uploads/{relative_name}',
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
    normalized_filename = os.path.normpath(filename)
    filepath = os.path.join(upload_dir, normalized_filename)

    if normalized_filename.startswith('..') or os.path.isabs(normalized_filename) or not os.path.isfile(filepath):
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Файл не найден'}}), 404

    os.remove(filepath)
    log_action('delete', entity_type='media', entity_title=normalized_filename)
    return jsonify({'data': {'message': 'Файл удалён'}}), 200

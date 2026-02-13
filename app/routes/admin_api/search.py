from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models.blog import BlogPost
from app.models.vacancy import Vacancy
from app.models.project import Project
from app.models.contact import ContactSubmission
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp

SEARCH_CONFIG = [
    {
        'type': 'blog_post',
        'model': BlogPost,
        'fields': ['title', 'content'],
        'title_field': 'title',
        'subtitle_fn': lambda item: (item.excerpt[:100] if item.excerpt else None),
        'url_prefix': '/panel/blog',
    },
    {
        'type': 'vacancy',
        'model': Vacancy,
        'fields': ['title', 'location'],
        'title_field': 'title',
        'subtitle_fn': lambda item: item.location,
        'url_prefix': '/panel/vacancies',
    },
    {
        'type': 'project',
        'model': Project,
        'fields': ['title', 'location'],
        'title_field': 'title',
        'subtitle_fn': lambda item: item.location,
        'url_prefix': '/panel/projects',
    },
    {
        'type': 'contact',
        'model': ContactSubmission,
        'fields': ['name', 'email', 'phone'],
        'title_field': 'name',
        'subtitle_fn': lambda item: item.subject,
        'url_prefix': '/panel/contacts',
    },
]


@admin_api_bp.route('/search', methods=['GET'])
@admin_required
def global_search():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'data': {'results': []}}), 200

    pattern = f'%{q}%'
    limit = current_app.config.get('SEARCH_RESULT_LIMIT', 5)

    results = []
    for cfg in SEARCH_CONFIG:
        model = cfg['model']
        conditions = [getattr(model, f).ilike(pattern) for f in cfg['fields']]
        items = model.query.filter(db.or_(*conditions)).limit(limit).all()
        for item in items:
            results.append({
                'type': cfg['type'],
                'id': item.id,
                'title': getattr(item, cfg['title_field']),
                'subtitle': cfg['subtitle_fn'](item),
                'url': f'{cfg["url_prefix"]}/{item.id}',
            })

    return jsonify({'data': {'results': results, 'query': q}}), 200

from datetime import datetime, timedelta
from flask import jsonify, current_app
from sqlalchemy import func, extract

from app.extensions import db
from app.models.blog import BlogPost
from app.models.vacancy import Vacancy
from app.models.project import Project
from app.models.contact import ContactSubmission
from app.models.user import User
from app.models.audit_log import AuditLog
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp


@admin_api_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def dashboard_stats():
    stats = {
        'blog_posts': BlogPost.query.count(),
        'blog_posts_published': BlogPost.query.filter_by(is_published=True).count(),
        'vacancies': Vacancy.query.count(),
        'vacancies_active': Vacancy.query.filter_by(is_active=True).count(),
        'projects': Project.query.count(),
        'projects_visible': Project.query.filter_by(is_visible=True).count(),
        'contacts': ContactSubmission.query.count(),
        'contacts_unread': ContactSubmission.query.filter_by(is_read=False).count(),
        'users': User.query.count(),
    }
    return jsonify({'data': stats}), 200


@admin_api_bp.route('/dashboard/charts', methods=['GET'])
@admin_required
def dashboard_charts():
    now = datetime.utcnow()

    # Posts per month
    months = current_app.config.get('DASHBOARD_MONTHS', 12)
    posts_by_month = []
    for i in range(months - 1, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=30 * i)).replace(day=1)
        if i > 0:
            month_end = (now.replace(day=1) - timedelta(days=30 * (i - 1))).replace(day=1)
        else:
            month_end = now
        count = BlogPost.query.filter(
            BlogPost.created_at >= month_start,
            BlogPost.created_at < month_end,
        ).count()
        posts_by_month.append({
            'month': month_start.strftime('%Y-%m'),
            'label': month_start.strftime('%b %Y'),
            'count': count,
        })

    # Contacts per week (last 8 weeks)
    contacts_by_week = []
    for i in range(7, -1, -1):
        week_start = now - timedelta(weeks=i, days=now.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(weeks=1)
        count = ContactSubmission.query.filter(
            ContactSubmission.created_at >= week_start,
            ContactSubmission.created_at < week_end,
        ).count()
        contacts_by_week.append({
            'week': week_start.strftime('%Y-W%W'),
            'label': week_start.strftime('%d.%m'),
            'count': count,
        })

    # Vacancies by type
    vacancy_types = db.session.query(
        Vacancy.employment_type, func.count(Vacancy.id)
    ).group_by(Vacancy.employment_type).all()

    # Projects by category
    project_categories = db.session.query(
        Project.category, func.count(Project.id)
    ).group_by(Project.category).all()

    return jsonify({
        'data': {
            'posts_by_month': posts_by_month,
            'contacts_by_week': contacts_by_week,
            'vacancies_by_type': [{'type': t, 'count': c} for t, c in vacancy_types],
            'projects_by_category': [{'category': c or 'Без категории', 'count': cnt} for c, cnt in project_categories],
        }
    }), 200


@admin_api_bp.route('/dashboard/activity', methods=['GET'])
@admin_required
def dashboard_activity():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(20).all()
    return jsonify({'data': [log.to_dict() for log in logs]}), 200

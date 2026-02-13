from flask import Blueprint
from flask_cors import CORS

admin_api_bp = Blueprint('admin_api', __name__, url_prefix='/api/v2/admin')

# Enable CORS for the admin API blueprint
CORS(admin_api_bp, supports_credentials=True)


def register_admin_api_routes():
    """Import all route modules to register them with the blueprint."""
    from app.routes.admin_api import (
        auth,
        blog_posts,
        vacancies,
        projects,
        contacts,
        users,
        dashboard,
        upload,
        export,
        search,
        notifications,
        drafts,
        settings,
        audit,
        roles,
        sessions,
        services,
        tags,
        project_images,
        documents,
        testimonials,
        equipment,
    )


register_admin_api_routes()

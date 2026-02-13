from app.routes.main import main_bp
from app.routes.blog import blog_bp
from app.routes.vacancies import vacancies_bp
from app.routes.auth import auth_bp
from app.routes.api import api_bp
from app.routes.admin_api import admin_api_bp


def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(blog_bp)
    app.register_blueprint(vacancies_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(admin_api_bp)

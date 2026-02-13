import os
from datetime import datetime

from flask import Flask, render_template, send_from_directory

from config import Config
from app.extensions import db, login_manager, migrate, jwt, limiter, ma, mail
from app.jwt_handlers import init_jwt_handlers
from app.template_filters import init_template_filters
from app.routes import register_blueprints
from app.admin import init_admin


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload directory exists
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    ma.init_app(app)
    mail.init_app(app)

    # Login manager configuration
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Пожалуйста, войдите для доступа к этой странице.'
    login_manager.login_message_category = 'warning'

    @login_manager.user_loader
    def load_user(user_id):
        from app.models.user import User
        return User.query.get(int(user_id))

    # JWT handlers
    init_jwt_handlers(jwt)

    # Jinja2 filters
    init_template_filters(app)

    # Context processor
    @app.context_processor
    def inject_now():
        return {'now': datetime.now}

    # Register blueprints
    register_blueprints(app)

    # Initialize admin
    init_admin(app)

    # SPA catch-all route for /panel/
    @app.route('/panel/')
    @app.route('/panel/<path:path>')
    def panel_spa(path=''):
        panel_dir = os.path.join(app.static_folder, 'panel')
        # Serve static assets (js, css, images)
        if path and os.path.exists(os.path.join(panel_dir, path)):
            return send_from_directory(panel_dir, path)
        # All other routes → index.html (React Router handles them)
        index_path = os.path.join(panel_dir, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(panel_dir, 'index.html')
        return '<h1>Admin Panel</h1><p>Run <code>cd admin-panel && npm run build</code> to build the React app.</p>', 200

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('errors/500.html'), 500

    return app

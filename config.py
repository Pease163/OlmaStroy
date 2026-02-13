import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')

    SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(32).hex())
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'olmastroy.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.path.join(basedir, 'app', 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB

    FLASK_ADMIN_SWATCH = 'cosmo'

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', os.urandom(32).hex())
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_COOKIE_SECURE = ENVIRONMENT == 'production'
    JWT_COOKIE_CSRF_PROTECT = ENVIRONMENT == 'production'
    JWT_REFRESH_COOKIE_PATH = '/api/v2/admin/auth/refresh'

    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')

    # Rate Limiting
    RATELIMIT_DEFAULT = '200/hour'
    RATELIMIT_STORAGE_URI = 'memory://'

    # App-specific
    AUTH_RATE_LIMIT = '10/minute'
    SEARCH_RESULT_LIMIT = 5
    IMAGE_QUALITY = 85
    THUMBNAIL_QUALITY = 80
    DASHBOARD_MONTHS = 12
    TOTP_ISSUER = 'ОлмаСТРОЙ Админ'

    # Mail
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.yandex.ru')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 465))
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@olmastroy.ru')
    MAIL_RECIPIENT = os.environ.get('MAIL_RECIPIENT', 'info@olmastroy.ru')

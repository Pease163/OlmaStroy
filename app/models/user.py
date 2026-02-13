from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # New fields for admin panel v2
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=True)
    totp_secret = db.Column(db.String(32), nullable=True)
    is_2fa_enabled = db.Column(db.Boolean, default=False)
    avatar_url = db.Column(db.String(500), nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    role = db.relationship('Role', backref=db.backref('users', lazy='dynamic'))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def has_permission(self, codename):
        if self.is_admin:
            return True
        if self.role:
            return self.role.has_permission(codename)
        return False

    def to_dict(self, include_role=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'role_id': self.role_id,
            'is_2fa_enabled': self.is_2fa_enabled,
            'avatar_url': self.avatar_url,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_role and self.role:
            data['role'] = self.role.to_dict()
        return data

    def __repr__(self):
        return '<User {}>'.format(self.username)

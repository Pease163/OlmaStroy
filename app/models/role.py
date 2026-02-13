from datetime import datetime
from app.extensions import db


role_permissions = db.Table(
    'role_permissions',
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permissions.id'), primary_key=True),
)


class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))
    is_system = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    permissions = db.relationship('Permission', secondary=role_permissions, backref='roles', lazy='joined')

    def has_permission(self, codename):
        return any(p.codename == codename for p in self.permissions)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_system': self.is_system,
            'permissions': [p.codename for p in self.permissions],
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return '<Role {}>'.format(self.name)


class Permission(db.Model):
    __tablename__ = 'permissions'

    id = db.Column(db.Integer, primary_key=True)
    codename = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    group = db.Column(db.String(100))

    def to_dict(self):
        return {
            'id': self.id,
            'codename': self.codename,
            'name': self.name,
            'group': self.group,
        }

    def __repr__(self):
        return '<Permission {}>'.format(self.codename)

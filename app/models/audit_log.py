from datetime import datetime
from app.extensions import db


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(50), nullable=False)  # create, update, delete, login, logout
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.Integer)
    entity_title = db.Column(db.String(200))
    changes = db.Column(db.JSON)  # {field: {old: ..., new: ...}}
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('audit_logs', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': self.user.username if self.user else None,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'entity_title': self.entity_title,
            'changes': self.changes,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return '<AuditLog {} {} {}>'.format(self.action, self.entity_type, self.entity_id)

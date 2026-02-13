import json

from app.extensions import db


class SiteSetting(db.Model):
    __tablename__ = 'site_settings'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    value = db.Column(db.Text)
    value_type = db.Column(db.String(20), default='string')  # string, text, boolean, number, json
    group = db.Column(db.String(50))
    label = db.Column(db.String(200))
    description = db.Column(db.String(500))
    order = db.Column(db.Integer, default=0)

    def get_typed_value(self):
        if self.value is None:
            return None
        if self.value_type == 'boolean':
            return self.value.lower() in ('true', '1', 'yes')
        if self.value_type == 'number':
            try:
                return int(self.value)
            except ValueError:
                return float(self.value)
        if self.value_type == 'json':
            return json.loads(self.value)
        return self.value

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.get_typed_value(),
            'value_type': self.value_type,
            'group': self.group,
            'label': self.label,
            'description': self.description,
            'order': self.order,
        }

    def __repr__(self):
        return '<SiteSetting {}>'.format(self.key)

from datetime import datetime
from app.extensions import db


class Vacancy(db.Model):
    __tablename__ = 'vacancies'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    salary = db.Column(db.String(100))
    requirements = db.Column(db.Text)
    employment_type = db.Column(db.String(50), default='Полная занятость')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Vacancy {}>'.format(self.title)

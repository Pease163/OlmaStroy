from datetime import datetime
from app.extensions import db


DOCUMENT_CATEGORIES = (
    'Системы менеджмента',
    'Лицензии',
    'СРО и реестры',
    'Квалификация специалистов',
    'Заключения Газпром газнадзора',
)


class Document(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_url = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(100))
    order = db.Column(db.Integer, default=0)
    is_visible = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Document {}>'.format(self.title)

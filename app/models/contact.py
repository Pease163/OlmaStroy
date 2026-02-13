from datetime import datetime
from app.extensions import db


class ContactSubmission(db.Model):
    __tablename__ = 'contact_submissions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(30))
    email = db.Column(db.String(120))
    message = db.Column(db.Text)
    subject = db.Column(db.String(200))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<ContactSubmission from {}>'.format(self.name)

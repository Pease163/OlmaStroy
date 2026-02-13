from datetime import datetime
from app.extensions import db


class Testimonial(db.Model):
    __tablename__ = 'testimonials'

    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200))
    text = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500))
    rating = db.Column(db.Integer, default=5)
    order = db.Column(db.Integer, default=0)
    is_visible = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Testimonial {}>'.format(self.company_name)

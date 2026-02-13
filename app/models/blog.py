from datetime import datetime
from app.extensions import db
from app.utils.slug import generate_slug as _generate_slug


class BlogPost(db.Model):
    __tablename__ = 'blog_posts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500))
    image_url = db.Column(db.String(500))
    is_published = db.Column(db.Boolean, default=False)
    publish_at = db.Column(db.DateTime, nullable=True)
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tags = db.relationship('Tag', secondary='post_tags', back_populates='posts')

    @staticmethod
    def generate_slug(title):
        return _generate_slug(title)

    def __repr__(self):
        return '<BlogPost {}>'.format(self.title)

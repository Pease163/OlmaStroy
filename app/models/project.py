from app.extensions import db
from app.utils.slug import generate_slug as _generate_slug


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, index=True)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    content = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    category = db.Column(db.String(100))
    year = db.Column(db.Integer)
    order = db.Column(db.Integer, default=0)
    is_visible = db.Column(db.Boolean, default=True)
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.String(500))

    @staticmethod
    def generate_slug(title):
        return _generate_slug(title)

    def __repr__(self):
        return '<Project {}>'.format(self.title)

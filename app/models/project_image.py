from app.extensions import db


class ProjectImage(db.Model):
    __tablename__ = 'project_images'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(300))
    order = db.Column(db.Integer, default=0)

    project = db.relationship('Project', backref=db.backref('images', lazy='dynamic', order_by='ProjectImage.order'))

    def __repr__(self):
        return '<ProjectImage {}>'.format(self.id)

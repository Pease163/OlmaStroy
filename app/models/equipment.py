from app.extensions import db


class Equipment(db.Model):
    __tablename__ = 'equipment'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    category = db.Column(db.String(100))
    specs = db.Column(db.Text)  # JSON string of specifications
    is_available = db.Column(db.Boolean, default=True)
    order = db.Column(db.Integer, default=0)

    def __repr__(self):
        return '<Equipment {}>'.format(self.name)

from marshmallow import fields
from app.extensions import ma
from app.models.tag import Tag


class TagSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Tag
        load_instance = True

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    slug = fields.String(dump_only=True)

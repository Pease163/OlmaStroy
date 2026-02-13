from marshmallow import fields, validate
from app.extensions import ma
from app.models.project import Project


class ProjectSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Project
        load_instance = True

    id = fields.Integer(dump_only=True)
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    slug = fields.String(dump_only=True)
    location = fields.String(validate=validate.Length(max=200))
    description = fields.String()
    content = fields.String()
    image_url = fields.String(allow_none=True)
    category = fields.String(validate=validate.Length(max=100))
    year = fields.Integer()
    order = fields.Integer()
    is_visible = fields.Boolean()
    meta_title = fields.String(allow_none=True, validate=validate.Length(max=200))
    meta_description = fields.String(allow_none=True, validate=validate.Length(max=500))

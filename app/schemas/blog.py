from marshmallow import fields, validate
from app.extensions import ma
from app.models.blog import BlogPost


class BlogPostTagSchema(ma.Schema):
    id = fields.Integer()
    name = fields.String()
    slug = fields.String()


class BlogPostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = BlogPost
        load_instance = True

    id = fields.Integer(dump_only=True)
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    slug = fields.String(dump_only=True)
    content = fields.String(required=True)
    excerpt = fields.String(validate=validate.Length(max=500))
    image_url = fields.String(allow_none=True)
    is_published = fields.Boolean()
    publish_at = fields.DateTime(allow_none=True)
    meta_title = fields.String(allow_none=True, validate=validate.Length(max=200))
    meta_description = fields.String(allow_none=True, validate=validate.Length(max=500))
    tags = fields.Nested(BlogPostTagSchema, many=True, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

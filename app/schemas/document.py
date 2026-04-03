from marshmallow import fields, validate, pre_load

from app.extensions import ma
from app.models.document import Document, DOCUMENT_CATEGORIES


def _normalize_category(value):
    if value is None:
        return None
    if isinstance(value, str):
        cleaned = value.strip()
        return cleaned or None
    return value


class DocumentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Document
        load_instance = True
        include_fk = True

    id = fields.Integer(dump_only=True)
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    description = fields.String(allow_none=True)
    file_url = fields.String(required=True, validate=validate.Length(min=1, max=500))
    category = fields.String(
        allow_none=True,
        validate=validate.OneOf(DOCUMENT_CATEGORIES),
    )
    order = fields.Integer()
    is_visible = fields.Boolean()
    is_featured = fields.Boolean()
    created_at = fields.DateTime(dump_only=True)

    @pre_load
    def normalize_input(self, data, **kwargs):
        if 'category' in data:
            data['category'] = _normalize_category(data.get('category'))
        return data

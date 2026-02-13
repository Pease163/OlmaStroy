from marshmallow import fields
from app.extensions import ma
from app.models.contact import ContactSubmission


class ContactSubmissionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ContactSubmission
        load_instance = True

    id = fields.Integer(dump_only=True)
    name = fields.String(dump_only=True)
    phone = fields.String(dump_only=True)
    email = fields.String(dump_only=True)
    message = fields.String(dump_only=True)
    subject = fields.String(dump_only=True)
    is_read = fields.Boolean()
    created_at = fields.DateTime(dump_only=True)

from marshmallow import fields, validate
from app.extensions import ma
from app.models.user import User


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ('password_hash', 'totp_secret')

    id = fields.Integer(dump_only=True)
    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    is_admin = fields.Boolean()
    role_id = fields.Integer(allow_none=True)
    is_2fa_enabled = fields.Boolean(dump_only=True)
    avatar_url = fields.String(allow_none=True)
    is_active = fields.Boolean()
    last_login = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    password = fields.String(load_only=True, validate=validate.Length(min=6))
    role = fields.Nested('RoleSchema', dump_only=True, only=('id', 'name'))


class RoleSchema(ma.Schema):
    id = fields.Integer()
    name = fields.String()
    description = fields.String()
    permissions = fields.List(fields.String())

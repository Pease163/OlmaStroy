from marshmallow import fields, validate
from app.extensions import ma
from app.models.vacancy import Vacancy


class VacancySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Vacancy
        load_instance = True

    id = fields.Integer(dump_only=True)
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    location = fields.String(required=True, validate=validate.Length(min=1, max=200))
    description = fields.String(required=True)
    salary = fields.String(validate=validate.Length(max=100))
    requirements = fields.String()
    employment_type = fields.String(validate=validate.OneOf([
        'Полная занятость', 'Частичная занятость', 'Вахта', 'Стажировка'
    ]))
    is_active = fields.Boolean()
    created_at = fields.DateTime(dump_only=True)

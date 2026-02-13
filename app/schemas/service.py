from app.extensions import ma
from app.models.service import Service


class ServiceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Service
        load_instance = True
        include_fk = True

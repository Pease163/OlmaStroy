from app.extensions import ma
from app.models.equipment import Equipment


class EquipmentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Equipment
        load_instance = True
        include_fk = True

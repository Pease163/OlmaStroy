from app.models.equipment import Equipment
from app.schemas.equipment import EquipmentSchema
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import (
    paginated_list, get_or_404_json, create_item, update_item,
    delete_item, bulk_delete,
)

equipment_schema = EquipmentSchema()
equipment_list_schema = EquipmentSchema(many=True)

UPDATABLE_FIELDS = ['name', 'description', 'image_url', 'category', 'specs', 'is_available', 'order']
SEARCH_FIELDS = ['name', 'description', 'category']
FILTER_FIELDS = [
    ('is_available', 'is_available', True),
    ('category', 'category', False),
]


@admin_api_bp.route('/equipment', methods=['GET'])
@admin_required
def list_equipment():
    return paginated_list(Equipment, equipment_list_schema, search_fields=SEARCH_FIELDS,
                          filter_fields=FILTER_FIELDS, default_sort='order', default_order='asc')


@admin_api_bp.route('/equipment/<int:equipment_id>', methods=['GET'])
@admin_required
def get_equipment(equipment_id):
    return get_or_404_json(Equipment, equipment_id, equipment_schema)


@admin_api_bp.route('/equipment', methods=['POST'])
@admin_required
def create_equipment():
    return create_item(Equipment, equipment_schema, 'equipment')


@admin_api_bp.route('/equipment/<int:equipment_id>', methods=['PUT'])
@admin_required
def update_equipment(equipment_id):
    return update_item(Equipment, equipment_schema, equipment_id, 'equipment', UPDATABLE_FIELDS)


@admin_api_bp.route('/equipment/<int:equipment_id>', methods=['DELETE'])
@admin_required
def delete_equipment(equipment_id):
    return delete_item(Equipment, equipment_id, 'equipment', 'Оборудование удалено')


@admin_api_bp.route('/equipment/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_equipment():
    return bulk_delete(Equipment, 'equipment')

from app.models.service import Service
from app.schemas.service import ServiceSchema
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import (
    paginated_list, get_or_404_json, create_item, update_item,
    delete_item, bulk_delete,
)

service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)

UPDATABLE_FIELDS = ['title', 'description', 'icon', 'order', 'is_active']
SEARCH_FIELDS = ['title', 'description']
FILTER_FIELDS = [('is_active', 'is_active', True)]


@admin_api_bp.route('/services', methods=['GET'])
@admin_required
def list_services():
    return paginated_list(Service, services_schema, search_fields=SEARCH_FIELDS,
                          filter_fields=FILTER_FIELDS, default_sort='order', default_order='asc')


@admin_api_bp.route('/services/<int:service_id>', methods=['GET'])
@admin_required
def get_service(service_id):
    return get_or_404_json(Service, service_id, service_schema)


@admin_api_bp.route('/services', methods=['POST'])
@admin_required
def create_service():
    return create_item(Service, service_schema, 'service')


@admin_api_bp.route('/services/<int:service_id>', methods=['PUT'])
@admin_required
def update_service(service_id):
    return update_item(Service, service_schema, service_id, 'service', UPDATABLE_FIELDS)


@admin_api_bp.route('/services/<int:service_id>', methods=['DELETE'])
@admin_required
def delete_service(service_id):
    return delete_item(Service, service_id, 'service', 'Услуга удалена')


@admin_api_bp.route('/services/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_services():
    return bulk_delete(Service, 'service')

from app.models.project import Project
from app.schemas.project import ProjectSchema
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import (
    paginated_list, get_or_404_json, create_item, update_item,
    patch_item, delete_item, bulk_delete, bulk_toggle, entity_history,
)

project_schema = ProjectSchema()
projects_schema = ProjectSchema(many=True)

UPDATABLE_FIELDS = ['title', 'location', 'description', 'content', 'image_url', 'category', 'year', 'order', 'is_visible', 'meta_title', 'meta_description']

SEARCH_FIELDS = ['title', 'location']
FILTER_FIELDS = [
    ('category', 'category', False),
    ('is_visible', 'is_visible', True),
]


@admin_api_bp.route('/projects', methods=['GET'])
@admin_required
def list_projects():
    return paginated_list(Project, projects_schema, search_fields=SEARCH_FIELDS,
                          filter_fields=FILTER_FIELDS, default_sort='order', default_order='asc')


@admin_api_bp.route('/projects/<int:project_id>', methods=['GET'])
@admin_required
def get_project(project_id):
    return get_or_404_json(Project, project_id, project_schema)


@admin_api_bp.route('/projects', methods=['POST'])
@admin_required
def create_project():
    return create_item(Project, project_schema, 'project', slug_field='slug')


@admin_api_bp.route('/projects/<int:project_id>', methods=['PUT'])
@admin_required
def update_project(project_id):
    return update_item(Project, project_schema, project_id, 'project', UPDATABLE_FIELDS, slug_field='slug')


@admin_api_bp.route('/projects/<int:project_id>', methods=['PATCH'])
@admin_required
def patch_project(project_id):
    return patch_item(Project, project_schema, project_id, 'project', UPDATABLE_FIELDS)


@admin_api_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@admin_required
def delete_project(project_id):
    return delete_item(Project, project_id, 'project', 'Проект удалён')


@admin_api_bp.route('/projects/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_projects():
    return bulk_delete(Project, 'project')


@admin_api_bp.route('/projects/bulk-toggle', methods=['POST'])
@admin_required
def bulk_toggle_projects():
    return bulk_toggle(Project, 'project', 'is_visible', 'is_visible')


@admin_api_bp.route('/projects/<int:project_id>/history', methods=['GET'])
@admin_required
def project_history(project_id):
    return entity_history(Project, 'project', project_id)

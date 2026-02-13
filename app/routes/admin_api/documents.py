from app.models.document import Document
from app.schemas.document import DocumentSchema
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import (
    paginated_list, get_or_404_json, create_item, update_item,
    delete_item, bulk_delete,
)

document_schema = DocumentSchema()
documents_schema = DocumentSchema(many=True)

UPDATABLE_FIELDS = ['title', 'description', 'file_url', 'category', 'order', 'is_visible']
SEARCH_FIELDS = ['title', 'description']
FILTER_FIELDS = [
    ('is_visible', 'is_visible', True),
    ('category', 'category', False),
]


@admin_api_bp.route('/documents', methods=['GET'])
@admin_required
def list_documents():
    return paginated_list(Document, documents_schema, search_fields=SEARCH_FIELDS,
                          filter_fields=FILTER_FIELDS, default_sort='order', default_order='asc')


@admin_api_bp.route('/documents/<int:document_id>', methods=['GET'])
@admin_required
def get_document(document_id):
    return get_or_404_json(Document, document_id, document_schema)


@admin_api_bp.route('/documents', methods=['POST'])
@admin_required
def create_document():
    return create_item(Document, document_schema, 'document')


@admin_api_bp.route('/documents/<int:document_id>', methods=['PUT'])
@admin_required
def update_document(document_id):
    return update_item(Document, document_schema, document_id, 'document', UPDATABLE_FIELDS)


@admin_api_bp.route('/documents/<int:document_id>', methods=['DELETE'])
@admin_required
def delete_document(document_id):
    return delete_item(Document, document_id, 'document', 'Документ удалён')


@admin_api_bp.route('/documents/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_documents():
    return bulk_delete(Document, 'document')

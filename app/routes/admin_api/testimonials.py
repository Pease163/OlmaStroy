from app.models.testimonial import Testimonial
from app.schemas.testimonial import TestimonialSchema
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import (
    paginated_list, get_or_404_json, create_item, update_item,
    delete_item, bulk_delete,
)

testimonial_schema = TestimonialSchema()
testimonials_schema = TestimonialSchema(many=True)

UPDATABLE_FIELDS = ['company_name', 'author', 'text', 'image_url', 'rating', 'order', 'is_visible']
SEARCH_FIELDS = ['company_name', 'author', 'text']
FILTER_FIELDS = [('is_visible', 'is_visible', True)]


@admin_api_bp.route('/testimonials', methods=['GET'])
@admin_required
def list_testimonials():
    return paginated_list(Testimonial, testimonials_schema, search_fields=SEARCH_FIELDS,
                          filter_fields=FILTER_FIELDS, default_sort='order', default_order='asc')


@admin_api_bp.route('/testimonials/<int:testimonial_id>', methods=['GET'])
@admin_required
def get_testimonial(testimonial_id):
    return get_or_404_json(Testimonial, testimonial_id, testimonial_schema)


@admin_api_bp.route('/testimonials', methods=['POST'])
@admin_required
def create_testimonial():
    return create_item(Testimonial, testimonial_schema, 'testimonial')


@admin_api_bp.route('/testimonials/<int:testimonial_id>', methods=['PUT'])
@admin_required
def update_testimonial(testimonial_id):
    return update_item(Testimonial, testimonial_schema, testimonial_id, 'testimonial', UPDATABLE_FIELDS)


@admin_api_bp.route('/testimonials/<int:testimonial_id>', methods=['DELETE'])
@admin_required
def delete_testimonial(testimonial_id):
    return delete_item(Testimonial, testimonial_id, 'testimonial', 'Отзыв удалён')


@admin_api_bp.route('/testimonials/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_testimonials():
    return bulk_delete(Testimonial, 'testimonial')

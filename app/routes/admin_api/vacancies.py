from app.models.vacancy import Vacancy
from app.schemas.vacancy import VacancySchema
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp
from app.routes.admin_api.crud_helpers import (
    paginated_list, get_or_404_json, create_item, update_item,
    patch_item, delete_item, bulk_delete, bulk_toggle, entity_history,
)

vacancy_schema = VacancySchema()
vacancies_schema = VacancySchema(many=True)

UPDATABLE_FIELDS = ['title', 'location', 'description', 'salary', 'requirements', 'employment_type', 'is_active']

SEARCH_FIELDS = ['title', 'location']
FILTER_FIELDS = [
    ('is_active', 'is_active', True),
    ('employment_type', 'employment_type', False),
]


@admin_api_bp.route('/vacancies', methods=['GET'])
@admin_required
def list_vacancies():
    return paginated_list(Vacancy, vacancies_schema, search_fields=SEARCH_FIELDS, filter_fields=FILTER_FIELDS)


@admin_api_bp.route('/vacancies/<int:vacancy_id>', methods=['GET'])
@admin_required
def get_vacancy(vacancy_id):
    return get_or_404_json(Vacancy, vacancy_id, vacancy_schema)


@admin_api_bp.route('/vacancies', methods=['POST'])
@admin_required
def create_vacancy():
    return create_item(Vacancy, vacancy_schema, 'vacancy')


@admin_api_bp.route('/vacancies/<int:vacancy_id>', methods=['PUT'])
@admin_required
def update_vacancy(vacancy_id):
    return update_item(Vacancy, vacancy_schema, vacancy_id, 'vacancy', UPDATABLE_FIELDS)


@admin_api_bp.route('/vacancies/<int:vacancy_id>', methods=['PATCH'])
@admin_required
def patch_vacancy(vacancy_id):
    return patch_item(Vacancy, vacancy_schema, vacancy_id, 'vacancy', UPDATABLE_FIELDS)


@admin_api_bp.route('/vacancies/<int:vacancy_id>', methods=['DELETE'])
@admin_required
def delete_vacancy(vacancy_id):
    return delete_item(Vacancy, vacancy_id, 'vacancy', 'Вакансия удалена')


@admin_api_bp.route('/vacancies/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_vacancies():
    return bulk_delete(Vacancy, 'vacancy')


@admin_api_bp.route('/vacancies/bulk-toggle', methods=['POST'])
@admin_required
def bulk_toggle_vacancies():
    return bulk_toggle(Vacancy, 'vacancy', 'is_active', 'is_active')


@admin_api_bp.route('/vacancies/<int:vacancy_id>/history', methods=['GET'])
@admin_required
def vacancy_history(vacancy_id):
    return entity_history(Vacancy, 'vacancy', vacancy_id)

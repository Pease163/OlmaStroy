from flask import Blueprint, render_template, abort, request

from app.models.vacancy import Vacancy

vacancies_bp = Blueprint('vacancies', __name__, url_prefix='/vacancies')


@vacancies_bp.route('/')
def vacancies_list():
    location_filter = request.args.get('location', '').strip()

    query = Vacancy.query.filter_by(is_active=True)
    if location_filter:
        query = query.filter_by(location=location_filter)

    vacancies = query.order_by(Vacancy.created_at.desc()).all()

    locations = [row[0] for row in
                 Vacancy.query.filter_by(is_active=True)
                 .with_entities(Vacancy.location)
                 .distinct()
                 .order_by(Vacancy.location)
                 .all()]

    return render_template(
        'vacancies/list.html',
        vacancies=vacancies,
        locations=locations,
        current_location=location_filter,
    )


@vacancies_bp.route('/<int:vacancy_id>')
def vacancy_detail(vacancy_id):
    vacancy = Vacancy.query.get(vacancy_id)
    if vacancy is None or not vacancy.is_active:
        abort(404)
    return render_template('vacancies/detail.html', vacancy=vacancy)

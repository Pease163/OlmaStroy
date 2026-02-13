from flask import Blueprint, render_template, abort, request, Response
from app.extensions import db
from app.models.project import Project
from app.models.project_image import ProjectImage
from app.models.blog import BlogPost
from app.models.vacancy import Vacancy
from app.models.service import Service
from app.models.document import Document
from app.models.equipment import Equipment
from app.models.testimonial import Testimonial

main_bp = Blueprint('main', __name__, url_prefix='')

SERVICES = [
    {
        'title': 'Строительство автодорог',
        'description': 'Проектирование и строительство автомобильных дорог, подъездных путей и внутриплощадочных проездов для объектов нефтегазовой инфраструктуры.',
    },
    {
        'title': 'Строительство зданий и сооружений',
        'description': 'Возведение промышленных, административно-бытовых зданий и инженерных сооружений на объектах нефтегазового комплекса.',
    },
    {
        'title': 'Благоустройство и озеленение',
        'description': 'Комплексное благоустройство территорий строительных площадок, объектов инфраструктуры: планировка, озеленение, устройство малых архитектурных форм.',
    },
    {
        'title': 'Инженерная защита',
        'description': 'Проектирование и строительство объектов инженерной защиты территорий: берегоукрепление, дренажные системы, противооползневые сооружения.',
    },
    {
        'title': 'Рекультивация земель',
        'description': 'Восстановление нарушенных земель после завершения строительных работ. Техническая и биологическая рекультивация, мониторинг экологического состояния.',
    },
    {
        'title': 'Общестроительные работы (линейная часть газопроводов)',
        'description': 'Полный комплекс общестроительных работ на линейной части магистральных и промысловых газопроводов: земляные работы, прокладка, балластировка, испытания.',
    },
    {
        'title': 'СМР и монтаж технологических трубопроводов',
        'description': 'Строительно-монтажные работы и монтаж технологических трубопроводов на компрессорных станциях, ГРС и других объектах газотранспортной системы.',
    },
    {
        'title': 'Ремонтные работы',
        'description': 'Капитальный и текущий ремонт объектов нефтегазовой инфраструктуры: трубопроводы, здания, сооружения, технологическое оборудование.',
    },
    {
        'title': 'Сдача в аренду строительной техники',
        'description': 'Предоставление в аренду собственного парка строительной и специальной техники: экскаваторы, бульдозеры, краны, трубоукладчики.',
    },
    {
        'title': 'Реализация ГСМ',
        'description': 'Обеспечение строительных площадок горюче-смазочными материалами. Поставка дизельного топлива, бензина и смазочных материалов.',
    },
    {
        'title': 'Грузоперевозки',
        'description': 'Транспортировка строительных материалов, оборудования и техники собственным автопарком. Негабаритные и тяжеловесные грузы.',
    },
]


@main_bp.route('/')
def index():
    projects = Project.query.filter_by(is_visible=True).order_by(Project.order).all()
    latest_posts = BlogPost.query.filter_by(is_published=True) \
        .order_by(BlogPost.created_at.desc()).limit(3).all()
    # Read services from DB, fallback to hardcoded SERVICES if DB is empty
    db_services = Service.query.filter_by(is_active=True).order_by(Service.order).all()
    if db_services:
        services = [{'title': s.title, 'description': s.description or ''} for s in db_services]
    else:
        services = SERVICES
    testimonials = Testimonial.query.filter_by(is_visible=True).order_by(Testimonial.order).all()
    ribbon_images = ProjectImage.query.join(Project).filter(
        Project.is_visible == True
    ).order_by(ProjectImage.order).limit(14).all()
    return render_template('index.html', projects=projects, services=services,
                           latest_posts=latest_posts, testimonials=testimonials,
                           ribbon_images=ribbon_images)


@main_bp.route('/about/')
def about():
    return render_template('about.html')


@main_bp.route('/projects/')
def projects_list():
    category = request.args.get('category')
    query = Project.query.filter_by(is_visible=True)
    if category:
        query = query.filter_by(category=category)
    projects = query.order_by(Project.order).all()

    # Get unique categories for filter
    categories = db.session.query(Project.category).filter(
        Project.is_visible == True,
        Project.category.isnot(None),
        Project.category != ''
    ).distinct().all()
    categories = [c[0] for c in categories]

    return render_template('projects/list.html', projects=projects, categories=categories)


@main_bp.route('/projects/<slug>')
def project_detail(slug):
    project = Project.query.filter_by(slug=slug, is_visible=True).first()
    if project is None:
        abort(404)
    images = ProjectImage.query.filter_by(project_id=project.id).order_by(ProjectImage.order).all()
    return render_template('projects/detail.html', project=project, images=images)


@main_bp.route('/documents/')
def documents():
    category = request.args.get('category')
    query = Document.query.filter_by(is_visible=True)
    if category:
        query = query.filter_by(category=category)
    documents = query.order_by(Document.order).all()
    categories = db.session.query(Document.category).filter(
        Document.is_visible == True,
        Document.category.isnot(None),
        Document.category != ''
    ).distinct().all()
    categories = [c[0] for c in categories]
    return render_template('documents.html', documents=documents, categories=categories, active_category=category)


@main_bp.route('/equipment/')
def equipment_list():
    category = request.args.get('category')
    query = Equipment.query.filter_by(is_available=True)
    if category:
        query = query.filter_by(category=category)
    equipment = query.order_by(Equipment.order).all()
    categories = db.session.query(Equipment.category).filter(
        Equipment.category.isnot(None),
        Equipment.category != ''
    ).distinct().all()
    categories = [c[0] for c in categories]
    return render_template('equipment/list.html', equipment=equipment, categories=categories, active_category=category)


@main_bp.route('/robots.txt')
def robots_txt():
    content = """User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth/
Disallow: /api/

Sitemap: {}sitemap.xml
""".format(request.host_url)
    return Response(content, mimetype='text/plain')


@main_bp.route('/sitemap.xml')
def sitemap():
    posts = BlogPost.query.filter_by(is_published=True).all()
    vacancies = Vacancy.query.filter_by(is_active=True).all()
    projects = Project.query.filter_by(is_visible=True).all()
    base_url = request.host_url

    xml = render_template('sitemap.xml', posts=posts, vacancies=vacancies,
                          projects=projects, base_url=base_url)
    return Response(xml, mimetype='application/xml')

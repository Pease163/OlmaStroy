from flask_admin import Admin
from app.extensions import db
from app.models import User, BlogPost, Vacancy, Project, ContactSubmission
from app.admin.views import (
    SecureAdminIndexView,
    UserView,
    BlogPostView,
    VacancyView,
    ProjectView,
    ContactView,
)


def init_admin(app):
    admin = Admin(
        app,
        name='ОлмаСтрой',
        template_mode='bootstrap4',
        index_view=SecureAdminIndexView(name='Главная', url='/admin'),
    )
    admin.add_view(BlogPostView(BlogPost, db.session, name='Блог', endpoint='blogpost'))
    admin.add_view(VacancyView(Vacancy, db.session, name='Вакансии', endpoint='vacancy'))
    admin.add_view(ProjectView(Project, db.session, name='Проекты', endpoint='project'))
    admin.add_view(ContactView(ContactSubmission, db.session, name='Заявки', endpoint='contact'))
    admin.add_view(UserView(User, db.session, name='Пользователи', endpoint='user'))

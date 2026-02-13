from flask import redirect, url_for, flash
from flask_admin import AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_admin.actions import action
from flask_login import current_user
from app.extensions import db
from app.models.blog import BlogPost
from app.models.project import Project


class AuthMixin(object):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.is_admin

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('auth.login'))


class SecureAdminIndexView(AuthMixin, AdminIndexView):
    @expose('/')
    def index(self):
        if not self.is_accessible():
            return redirect(url_for('auth.login'))

        from app.models import BlogPost, Vacancy, Project, ContactSubmission
        stats = {
            'posts_count': BlogPost.query.count(),
            'vacancies_count': Vacancy.query.count(),
            'projects_count': Project.query.count(),
            'unread_contacts': ContactSubmission.query.filter_by(is_read=False).count(),
        }
        return self.render('admin/index.html', stats=stats)


class UserView(AuthMixin, ModelView):
    column_list = ['id', 'username', 'email', 'is_admin', 'created_at']
    column_labels = {
        'id': 'ID',
        'username': 'Логин',
        'email': 'Email',
        'is_admin': 'Администратор',
        'created_at': 'Дата создания',
        'password_hash': 'Хеш пароля',
    }
    form_excluded_columns = ['password_hash']
    column_exclude_list = ['password_hash']
    column_searchable_list = ['username', 'email']


class BlogPostView(AuthMixin, ModelView):
    column_list = ['id', 'title', 'slug', 'is_published', 'created_at', 'updated_at']
    column_labels = {
        'id': 'ID',
        'title': 'Заголовок',
        'slug': 'URL-адрес',
        'content': 'Контент',
        'excerpt': 'Краткое описание',
        'image_url': 'URL изображения',
        'is_published': 'Опубликовано',
        'created_at': 'Дата создания',
        'updated_at': 'Дата обновления',
    }
    form_widget_args = {
        'content': {'rows': 20},
    }
    create_template = 'admin/blog_create.html'
    edit_template = 'admin/blog_edit.html'
    column_searchable_list = ['title', 'content']
    column_filters = ['is_published', 'created_at']
    column_default_sort = ('created_at', True)

    def on_model_change(self, form, model, is_created):
        if is_created or not model.slug:
            model.slug = BlogPost.generate_slug(model.title)


class VacancyView(AuthMixin, ModelView):
    column_list = ['id', 'title', 'location', 'employment_type', 'salary', 'is_active', 'created_at']
    column_labels = {
        'id': 'ID',
        'title': 'Должность',
        'location': 'Местоположение',
        'description': 'Описание',
        'salary': 'Зарплата',
        'requirements': 'Требования',
        'employment_type': 'Тип занятости',
        'is_active': 'Активна',
        'created_at': 'Дата создания',
    }
    form_choices = {
        'employment_type': [
            ('Полная занятость', 'Полная занятость'),
            ('Частичная занятость', 'Частичная занятость'),
            ('Вахта', 'Вахта'),
            ('Стажировка', 'Стажировка'),
        ]
    }
    create_template = 'admin/vacancy_create.html'
    edit_template = 'admin/vacancy_edit.html'
    column_searchable_list = ['title', 'location']
    column_filters = ['is_active', 'employment_type', 'location']


class ProjectView(AuthMixin, ModelView):
    column_list = ['id', 'title', 'slug', 'location', 'category', 'year', 'order', 'is_visible']
    column_labels = {
        'id': 'ID',
        'title': 'Название',
        'slug': 'URL-адрес',
        'location': 'Местоположение',
        'description': 'Описание',
        'content': 'Контент',
        'image_url': 'URL изображения',
        'category': 'Категория',
        'year': 'Год',
        'order': 'Порядок',
        'is_visible': 'Видимый',
    }
    form_widget_args = {
        'content': {'rows': 20},
    }
    column_sortable_list = ['title', 'year', 'order', 'is_visible']
    column_default_sort = 'order'
    column_searchable_list = ['title', 'location', 'category']
    column_filters = ['category', 'year', 'is_visible']

    def on_model_change(self, form, model, is_created):
        if is_created or not model.slug:
            model.slug = Project.generate_slug(model.title)


class ContactView(AuthMixin, ModelView):
    can_create = False
    can_edit = False
    can_delete = False
    column_list = ['id', 'name', 'phone', 'email', 'subject', 'is_read', 'created_at']
    column_labels = {
        'id': 'ID',
        'name': 'Имя',
        'phone': 'Телефон',
        'email': 'Email',
        'message': 'Сообщение',
        'subject': 'Тема',
        'is_read': 'Прочитано',
        'created_at': 'Дата',
    }
    column_default_sort = ('created_at', True)
    column_filters = ['is_read', 'created_at']
    can_view_details = True

    @action('mark_read', 'Отметить как прочитанные', 'Отметить выбранные заявки как прочитанные?')
    def action_mark_read(self, ids):
        from app.models.contact import ContactSubmission
        count = 0
        for _id in ids:
            submission = ContactSubmission.query.get(int(_id))
            if submission and not submission.is_read:
                submission.is_read = True
                count += 1
        db.session.commit()
        flash('Отмечено как прочитанные: {}'.format(count), 'success')

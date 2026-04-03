import os
import sys

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.blog import BlogPost
from app.models.vacancy import Vacancy
from app.models.project import Project
from app.models.role import Role, Permission
from app.models.site_setting import SiteSetting


def seed():
    app = create_app()

    with app.app_context():
        # Create all tables
        db.create_all()

        # Ensure uploads directory exists
        os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)

        # --- Permissions ---
        if Permission.query.count() == 0:
            permissions = [
                # Blog
                Permission(codename='blog.view', name='Просмотр блога', group='Блог'),
                Permission(codename='blog.create', name='Создание постов', group='Блог'),
                Permission(codename='blog.edit', name='Редактирование постов', group='Блог'),
                Permission(codename='blog.delete', name='Удаление постов', group='Блог'),
                Permission(codename='blog.publish', name='Публикация постов', group='Блог'),
                # Vacancies
                Permission(codename='vacancies.view', name='Просмотр вакансий', group='Вакансии'),
                Permission(codename='vacancies.create', name='Создание вакансий', group='Вакансии'),
                Permission(codename='vacancies.edit', name='Редактирование вакансий', group='Вакансии'),
                Permission(codename='vacancies.delete', name='Удаление вакансий', group='Вакансии'),
                # Projects
                Permission(codename='projects.view', name='Просмотр проектов', group='Проекты'),
                Permission(codename='projects.create', name='Создание проектов', group='Проекты'),
                Permission(codename='projects.edit', name='Редактирование проектов', group='Проекты'),
                Permission(codename='projects.delete', name='Удаление проектов', group='Проекты'),
                # Contacts
                Permission(codename='contacts.view', name='Просмотр заявок', group='Заявки'),
                Permission(codename='contacts.delete', name='Удаление заявок', group='Заявки'),
                # Users
                Permission(codename='users.view', name='Просмотр пользователей', group='Пользователи'),
                Permission(codename='users.create', name='Создание пользователей', group='Пользователи'),
                Permission(codename='users.edit', name='Редактирование пользователей', group='Пользователи'),
                Permission(codename='users.delete', name='Удаление пользователей', group='Пользователи'),
                # Settings
                Permission(codename='settings.view', name='Просмотр настроек', group='Настройки'),
                Permission(codename='settings.edit', name='Редактирование настроек', group='Настройки'),
                # Audit
                Permission(codename='audit.view', name='Просмотр аудит-лога', group='Аудит'),
                # Roles
                Permission(codename='roles.view', name='Просмотр ролей', group='Роли'),
                Permission(codename='roles.manage', name='Управление ролями', group='Роли'),
                # Export
                Permission(codename='export.data', name='Экспорт данных', group='Экспорт'),
            ]
            db.session.add_all(permissions)
            db.session.flush()
            print('Permissions created.')
        else:
            print('Permissions already exist, skipping.')

        # --- Roles ---
        if Role.query.count() == 0:
            all_perms = Permission.query.all()

            admin_role = Role(
                name='Администратор',
                description='Полный доступ ко всем функциям',
                is_system=True,
            )
            admin_role.permissions = all_perms

            editor_perms = Permission.query.filter(
                Permission.codename.in_([
                    'blog.view', 'blog.create', 'blog.edit', 'blog.publish',
                    'vacancies.view', 'vacancies.create', 'vacancies.edit',
                    'projects.view', 'projects.create', 'projects.edit',
                    'contacts.view',
                ])
            ).all()
            editor_role = Role(
                name='Редактор',
                description='Создание и редактирование контента',
                is_system=True,
            )
            editor_role.permissions = editor_perms

            viewer_perms = Permission.query.filter(
                Permission.codename.in_([
                    'blog.view', 'vacancies.view', 'projects.view', 'contacts.view',
                ])
            ).all()
            viewer_role = Role(
                name='Наблюдатель',
                description='Только просмотр данных',
                is_system=True,
            )
            viewer_role.permissions = viewer_perms

            db.session.add_all([admin_role, editor_role, viewer_role])
            db.session.flush()
            print('Roles created.')
        else:
            print('Roles already exist, skipping.')

        # --- Admin user ---
        if not User.query.filter_by(username='admin').first():
            admin_role = Role.query.filter_by(name='Администратор').first()
            admin = User(
                username='admin',
                email='admin@olmastroy.ru',
                is_admin=True,
                is_active=True,
                role_id=admin_role.id if admin_role else None,
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print('Admin user created.')
        else:
            # Update existing admin
            admin = User.query.filter_by(username='admin').first()
            if admin.is_active is None:
                admin.is_active = True
            admin_role = Role.query.filter_by(name='Администратор').first()
            if admin_role and not admin.role_id:
                admin.role_id = admin_role.id
            print('Admin user updated.')

        # --- Site Settings ---
        if SiteSetting.query.count() == 0:
            settings = [
                SiteSetting(key='site_name', value='ОлмаСТРОЙ', value_type='string',
                           group='general', label='Название сайта', order=1),
                SiteSetting(key='site_description', value='Строительная компания ОлмаСТРОЙ',
                           value_type='text', group='general', label='Описание сайта', order=2),
                SiteSetting(key='contact_email', value='info@olmastroy.ru', value_type='string',
                           group='contacts', label='Email для связи', order=1),
                SiteSetting(key='contact_phone', value='+7 (4012) 311-668', value_type='string',
                           group='contacts', label='Телефон', order=2),
                SiteSetting(key='contact_address', value='г. Калининград, ул. Горького, 81А, ОЦ «Агат», оф. 405-412', value_type='string',
                           group='contacts', label='Адрес', order=3),
                SiteSetting(key='blog_posts_per_page', value='9', value_type='number',
                           group='blog', label='Постов на странице', order=1),
                SiteSetting(key='maintenance_mode', value='false', value_type='boolean',
                           group='general', label='Режим обслуживания',
                           description='Включить режим обслуживания сайта', order=10),
            ]
            db.session.add_all(settings)
            print('Site settings created.')
        else:
            print('Site settings already exist, skipping.')

        # --- Blog posts ---
        if BlogPost.query.count() == 0:
            posts = [
                BlogPost(
                    title='Завершение строительства КС Байдарацкая',
                    slug=BlogPost.generate_slug('Завершение строительства КС Байдарацкая'),
                    content=(
                        '<p>Компания ОлмаСтрой успешно завершила строительство компрессорной '
                        'станции «Байдарацкая» в Ямало-Ненецком автономном округе. Объект был '
                        'сдан в эксплуатацию в установленные сроки с соблюдением всех требований '
                        'промышленной безопасности.</p>'
                        '<p>Компрессорная станция является ключевым элементом газотранспортной '
                        'системы региона и обеспечивает бесперебойную транспортировку газа по '
                        'магистральному газопроводу.</p>'
                    ),
                    excerpt='Компания ОлмаСтрой успешно завершила строительство КС «Байдарацкая» в ЯНАО.',
                    is_published=True,
                ),
                BlogPost(
                    title='Новые технологии в нефтегазовом строительстве',
                    slug=BlogPost.generate_slug('Новые технологии в нефтегазовом строительстве'),
                    content=(
                        '<p>ОлмаСтрой активно внедряет инновационные технологии в практику '
                        'нефтегазового строительства. BIM-технологии и IoT-мониторинг.</p>'
                    ),
                    excerpt='Компания внедряет BIM-технологии и IoT-мониторинг на строительных площадках.',
                    is_published=True,
                ),
                BlogPost(
                    title='ОлмаСтрой расширяет географию присутствия',
                    slug=BlogPost.generate_slug('ОлмаСтрой расширяет географию присутствия'),
                    content=(
                        '<p>В 2024 году компания ОлмаСтрой значительно расширила географию '
                        'своего присутствия, выйдя на новые регионы России.</p>'
                    ),
                    excerpt='Компания вышла на новые регионы: Иркутская область и Республика Саха.',
                    is_published=True,
                ),
            ]
            db.session.add_all(posts)
            print('Blog posts created.')
        else:
            print('Blog posts already exist, skipping.')

        # --- Vacancies ---
        if Vacancy.query.count() == 0:
            vacancies = [
                Vacancy(title='Машинист экскаватора', location='Иркутская обл. (г. Киренск)',
                        description=(
                            '<p>Приглашаем машиниста экскаватора для работы на объектах газотранспортной системы.</p>'
                            '<h3>Условия</h3>'
                            '<ul><li>Вахтовый метод: 90/30</li>'
                            '<li>Проживание и питание за счёт компании</li>'
                            '<li>Официальное трудоустройство по ТК РФ</li></ul>'
                        ),
                        salary='180 000 ₽/мес', employment_type='Вахта 90/30', is_active=True),
                Vacancy(title='Подсобный разнорабочий', location='Калининградская обл. (пос. Александровка, ГРС Светлогорск)',
                        description=(
                            '<p>Требуется подсобный разнорабочий на строительный объект ГРС Светлогорск.</p>'
                            '<h3>Условия</h3>'
                            '<ul><li>График: 6/1</li>'
                            '<li>Оплата: 350 руб/час</li>'
                            '<li>Официальное трудоустройство по ТК РФ</li></ul>'
                        ),
                        salary='от 90 000 ₽/мес', employment_type='6/1', is_active=True),
                Vacancy(title='Инженер-геодезист', location='Калининградская обл. (пос. Александровка, ГРС Светлогорск)',
                        description=(
                            '<p>Приглашаем инженера-геодезиста для работы на строительном объекте ГРС Светлогорск.</p>'
                            '<h3>Условия</h3>'
                            '<ul><li>График: Пн-Пт, 8:00-17:00</li>'
                            '<li>Официальное трудоустройство по ТК РФ</li></ul>'
                        ),
                        salary='от 120 000 ₽/мес', employment_type='Пн-Пт', is_active=True),
            ]
            db.session.add_all(vacancies)
            print('Vacancies created.')
        else:
            print('Vacancies already exist, skipping.')

        # --- Projects ---
        if Project.query.count() == 0:
            projects = [
                Project(title='КС «Байдарацкая»', location='ЯНАО',
                        description='Строительство компрессорной станции мощностью 32 МВт.',
                        image_url='/static/uploads/ks-baydaratskaya/baydaratskaya.jpg',
                        category='Компрессорные станции', year=2020, order=1, is_visible=True),
                Project(title='Сила Сибири', location='Иркутская область',
                        description='Участие в строительстве магистрального газопровода.',
                        image_url='/static/uploads/sila-sibiri/sila-sibiri.jpg',
                        category='Магистральные газопроводы', year=2022, order=2, is_visible=True),
                Project(title='Подземное хранилище газа', location='Калининградская область',
                        description='Строительство наземной инфраструктуры ПХГ.',
                        image_url='/static/uploads/kaliningradskoe-upkhg/kaliningradskoe-upkhg.jpg',
                        category='Хранилища газа', year=2023, order=3, is_visible=True),
            ]
            db.session.add_all(projects)
            print('Projects created.')
        else:
            print('Projects already exist, skipping.')

        db.session.commit()
        print('Database seeded successfully!')


if __name__ == '__main__':
    seed()

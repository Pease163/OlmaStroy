"""
Одноразовый скрипт импорта фотографий объектов.
Импортирует фото КС Русская (29 шт) и ОП Благовещенск (13 шт).

Использование:
    source .venv/bin/activate
    python import_photos.py
"""

import os
import glob
import shutil

from app import create_app
from app.extensions import db
from app.models.project import Project
from app.models.project_image import ProjectImage
from app.utils.image import process_image

# Пути к исходным фотографиям
SOURCE_DIR = os.path.expanduser('~/Desktop/ОЛМАстрой/Фотографии объектов/2019')

PROJECTS = [
    {
        'title': 'КС «Русская»',
        'slug': 'ks-russkaya',
        'location': 'Краснодарский край',
        'description': 'Строительство компрессорной станции «Русская» — конечной точки газопровода «Турецкий поток». Полный комплекс общестроительных работ.',
        'category': 'Компрессорные станции',
        'year': 2019,
        'source_folder': 'КС Русская',
        'upload_folder': 'ks-russkaya',
    },
    {
        'title': 'ОП «Благовещенск»',
        'slug': 'op-blagoveshchensk',
        'location': 'Амурская область',
        'description': 'Обустройство промышленной площадки в г. Благовещенск. Строительно-монтажные работы и благоустройство территории.',
        'category': 'Обустройство площадок',
        'year': 2019,
        'source_folder': 'ОП Благовещенск',
        'upload_folder': 'op-blagoveshchensk',
    },
]


def import_photos():
    app = create_app()

    with app.app_context():
        uploads_base = os.path.join(app.static_folder, 'uploads')

        for proj_data in PROJECTS:
            # Проверяем, не импортирован ли уже
            existing = Project.query.filter_by(slug=proj_data['slug']).first()
            if existing:
                print(f'Проект «{proj_data["title"]}» уже существует (id={existing.id}), пропускаю.')
                continue

            # Создаём проект
            project = Project(
                title=proj_data['title'],
                slug=proj_data['slug'],
                location=proj_data['location'],
                description=proj_data['description'],
                category=proj_data['category'],
                year=proj_data['year'],
                is_visible=True,
                order=0,
            )
            db.session.add(project)
            db.session.flush()  # Получаем id

            # Папка для обработанных фото
            output_dir = os.path.join(uploads_base, proj_data['upload_folder'])
            os.makedirs(output_dir, exist_ok=True)

            # Находим исходные фото
            source_folder = os.path.join(SOURCE_DIR, proj_data['source_folder'])
            if not os.path.isdir(source_folder):
                print(f'ОШИБКА: папка не найдена: {source_folder}')
                continue

            photos = sorted(glob.glob(os.path.join(source_folder, '*.jpg')) +
                            glob.glob(os.path.join(source_folder, '*.JPG')) +
                            glob.glob(os.path.join(source_folder, '*.jpeg')) +
                            glob.glob(os.path.join(source_folder, '*.png')))

            if not photos:
                print(f'ОШИБКА: фото не найдены в {source_folder}')
                continue

            print(f'\n--- {proj_data["title"]} ({len(photos)} фото) ---')

            for i, photo_path in enumerate(photos):
                basename = os.path.basename(photo_path)
                print(f'  [{i+1}/{len(photos)}] {basename}...', end=' ')

                # Копируем исходник во временную папку для обработки
                tmp_path = os.path.join(output_dir, basename)
                shutil.copy2(photo_path, tmp_path)

                # Обрабатываем: ресайз, JPEG, WebP, thumbnail
                result = process_image(
                    tmp_path,
                    output_dir=output_dir,
                    max_width=1920,
                    quality=85,
                    create_webp=True,
                    create_thumbnail=True,
                    thumb_size=(400, 300),
                )

                # Удаляем временную копию исходника если она отличается от обработанного jpg
                if os.path.exists(tmp_path) and tmp_path != result['jpg']:
                    os.remove(tmp_path)

                # Формируем URL относительно static/
                rel_jpg = os.path.relpath(result['jpg'], app.static_folder)
                image_url = '/static/' + rel_jpg.replace('\\', '/')

                # Создаём запись ProjectImage
                img_record = ProjectImage(
                    project_id=project.id,
                    image_url=image_url,
                    order=i,
                )
                db.session.add(img_record)

                # Первое фото — обложка проекта
                if i == 0:
                    project.image_url = image_url

                print('OK')

            print(f'  Импортировано: {len(photos)} фото для «{proj_data["title"]}»')

        db.session.commit()
        print('\nИмпорт завершён!')

        # Итоги
        for proj_data in PROJECTS:
            p = Project.query.filter_by(slug=proj_data['slug']).first()
            if p:
                count = ProjectImage.query.filter_by(project_id=p.id).count()
                print(f'  {p.title}: {count} изображений, обложка: {p.image_url}')


if __name__ == '__main__':
    import_photos()

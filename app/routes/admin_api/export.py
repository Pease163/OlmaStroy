import csv
import io
from flask import request, jsonify, send_file
from flask_jwt_extended import jwt_required

from app.models.blog import BlogPost
from app.models.vacancy import Vacancy
from app.models.project import Project
from app.models.contact import ContactSubmission
from app.models.user import User
from app.decorators import admin_required
from app.routes.admin_api import admin_api_bp

ENTITY_MAP = {
    'blog-posts': {
        'model': BlogPost,
        'fields': ['id', 'title', 'slug', 'excerpt', 'is_published', 'created_at', 'updated_at'],
        'labels': ['ID', 'Заголовок', 'URL', 'Описание', 'Опубликовано', 'Создано', 'Обновлено'],
    },
    'vacancies': {
        'model': Vacancy,
        'fields': ['id', 'title', 'location', 'salary', 'employment_type', 'is_active', 'created_at'],
        'labels': ['ID', 'Должность', 'Локация', 'Зарплата', 'Тип', 'Активна', 'Создано'],
    },
    'projects': {
        'model': Project,
        'fields': ['id', 'title', 'location', 'category', 'year', 'order', 'is_visible'],
        'labels': ['ID', 'Название', 'Локация', 'Категория', 'Год', 'Порядок', 'Видимый'],
    },
    'contacts': {
        'model': ContactSubmission,
        'fields': ['id', 'name', 'phone', 'email', 'subject', 'is_read', 'created_at'],
        'labels': ['ID', 'Имя', 'Телефон', 'Email', 'Тема', 'Прочитано', 'Дата'],
    },
    'users': {
        'model': User,
        'fields': ['id', 'username', 'email', 'is_admin', 'is_active', 'created_at'],
        'labels': ['ID', 'Логин', 'Email', 'Админ', 'Активен', 'Создано'],
    },
}


@admin_api_bp.route('/export/<entity>', methods=['GET'])
@admin_required
def export_data(entity):
    if entity not in ENTITY_MAP:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Неизвестная сущность'}}), 404

    fmt = request.args.get('format', 'csv')
    config = ENTITY_MAP[entity]
    items = config['model'].query.all()

    rows = []
    for item in items:
        row = []
        for field in config['fields']:
            val = getattr(item, field, '')
            if hasattr(val, 'isoformat'):
                val = val.strftime('%d.%m.%Y %H:%M')
            if isinstance(val, bool):
                val = 'Да' if val else 'Нет'
            row.append(str(val) if val is not None else '')
        rows.append(row)

    if fmt == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(config['labels'])
        writer.writerows(rows)
        output.seek(0)

        buf = io.BytesIO(output.getvalue().encode('utf-8-sig'))
        return send_file(buf, mimetype='text/csv',
                         as_attachment=True,
                         download_name=f'{entity}.csv')

    elif fmt == 'xlsx':
        try:
            from openpyxl import Workbook
            wb = Workbook()
            ws = wb.active
            ws.title = entity
            ws.append(config['labels'])
            for row in rows:
                ws.append(row)

            # Style header
            from openpyxl.styles import Font
            for cell in ws[1]:
                cell.font = Font(bold=True)

            buf = io.BytesIO()
            wb.save(buf)
            buf.seek(0)

            return send_file(buf, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                             as_attachment=True,
                             download_name=f'{entity}.xlsx')
        except ImportError:
            return jsonify({'error': {'code': 'NOT_AVAILABLE', 'message': 'openpyxl не установлен'}}), 500

    elif fmt == 'pdf':
        try:
            from reportlab.lib.pagesizes import A4, landscape
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
            from reportlab.pdfbase import pdfmetrics
            from reportlab.pdfbase.ttfonts import TTFont

            buf = io.BytesIO()
            doc = SimpleDocTemplate(buf, pagesize=landscape(A4))
            table_data = [config['labels']] + rows
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            doc.build([table])
            buf.seek(0)

            return send_file(buf, mimetype='application/pdf',
                             as_attachment=True,
                             download_name=f'{entity}.pdf')
        except ImportError:
            return jsonify({'error': {'code': 'NOT_AVAILABLE', 'message': 'reportlab не установлен'}}), 500

    return jsonify({'error': {'code': 'BAD_FORMAT', 'message': 'Формат: csv, xlsx или pdf'}}), 400

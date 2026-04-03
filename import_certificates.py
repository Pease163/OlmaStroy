"""
Импорт PDF-сертификатов из папки на рабочем столе в таблицу documents.

Использование:
    source .venv/bin/activate
    python import_certificates.py
"""

import argparse
from pathlib import Path

from app import create_app
from app.services.document_import_service import import_certificate_documents, DEFAULT_SOURCE_DIR


def main():
    parser = argparse.ArgumentParser(description='Импорт сертификатов и допусков в базу данных')
    parser.add_argument(
        '--source-dir',
        default=str(DEFAULT_SOURCE_DIR),
        help='Путь к папке с исходными PDF',
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Не записывать изменения в БД и не копировать файлы',
    )
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        report = import_certificate_documents(source_dir=Path(args.source_dir), dry_run=args.dry_run)

    print(f"Обработано файлов: {report['total']}")
    print(f"Создано записей: {report['created']}")
    print(f"Обновлено записей: {report['updated']}")
    print(f"Скопировано файлов: {report['copied']}")

    for item in report['items']:
        status = 'created' if item['created'] else 'updated' if item['updated'] else 'kept'
        print(f"- {item['title']}: {status}")


if __name__ == '__main__':
    main()

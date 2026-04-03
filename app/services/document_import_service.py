from dataclasses import dataclass
from pathlib import Path
import shutil
from typing import Optional, Union

from flask import current_app
from sqlalchemy import or_

from app.extensions import db
from app.models.document import Document, DOCUMENT_CATEGORIES
from app.utils.slug import generate_slug


DEFAULT_SOURCE_DIR = Path.home() / 'Desktop' / 'Сертификаты Олмастрой'
DOCUMENTS_UPLOAD_SUBDIR = 'documents'


@dataclass(frozen=True)
class DocumentImportSpec:
    source_path: str
    title: str
    description: str
    category: str
    order: int
    is_featured: bool = False


DOCUMENT_IMPORT_SPECS = [
    DocumentImportSpec(
        source_path='СМК.pdf',
        title='СМК',
        description='Сертификат соответствия системы менеджмента качества ООО «ОЛМАСТРОЙ» требованиям ISO 9001:2015 / ГОСТ Р ИСО 9001-2015, регистрационный номер РОСС RU.ИХ06.0040, действует до 30.09.2027.',
        category='Системы менеджмента',
        order=1,
        is_featured=True,
    ),
    DocumentImportSpec(
        source_path='СЭМ.pdf',
        title='СЭМ',
        description='Сертификат соответствия системы экологического менеджмента ООО «ОЛМАСТРОЙ» требованиям ISO 14001:2015 / ГОСТ Р ИСО 14001-2016, регистрационный номер РОСС RU.ИХ06.0039, действует до 30.09.2027.',
        category='Системы менеджмента',
        order=2,
        is_featured=True,
    ),
    DocumentImportSpec(
        source_path='Лицензия пассажирские перевозки.pdf',
        title='Лицензия пассажирские перевозки',
        description='Лицензия № АК-39-000316 от 17.06.2019 на деятельность по перевозкам пассажиров автобусами, оснащёнными для перевозок более восьми человек.',
        category='Лицензии',
        order=3,
        is_featured=True,
    ),
    DocumentImportSpec(
        source_path='Уведомление о приеме в СРО.pdf',
        title='Уведомление о приеме в СРО',
        description='Уведомление о приёме ООО «ОЛМАСТРОЙ» в члены АНП «СРО «ССКО» от 14.07.2017.',
        category='СРО и реестры',
        order=4,
        is_featured=True,
    ),
    DocumentImportSpec(
        source_path='Нострой Майер.pdf',
        title='Нострой Майер',
        description='Уведомление о включении Майера Александра Эдуардовича в Национальный реестр специалистов в области строительства, номер 0030471.',
        category='СРО и реестры',
        order=5,
    ),
    DocumentImportSpec(
        source_path='Нострой Минакова.pdf',
        title='Нострой Минакова',
        description='Уведомление о включении Минаковой Марины Владимировны в Национальный реестр специалистов в области строительства, номер 0030472.',
        category='СРО и реестры',
        order=6,
    ),
    DocumentImportSpec(
        source_path='Св-во о квалификации Майер Александр Эдуардович (1).pdf',
        title='Свидетельство о квалификации Майер Александр Эдуардович',
        description='Свидетельство о квалификации Майера Александра Эдуардовича, уровень квалификации 7, специалист по организации строительства / главный инженер проекта, действует до 18.09.2028.',
        category='Квалификация специалистов',
        order=7,
    ),
    DocumentImportSpec(
        source_path='Св-во о квалификации Минакова Марина Владимировна (1).pdf',
        title='Свидетельство о квалификации Минакова Марина Владимировна',
        description='Свидетельство о квалификации Минаковой Марины Владимировны, уровень квалификации 7, специалист по организации строительства / главный инженер проекта, действует до 18.09.2028.',
        category='Квалификация специалистов',
        order=8,
    ),
    DocumentImportSpec(
        source_path='Заключения ОТГ Газпром газнадзор/Заключение ОТГ № 3117-2024 (4862)-ДТОиР.pdf',
        title='Заключение ОТГ № 3117-2024 (4862) — ДТОиР',
        description='Заключение ОТГ Газпром газнадзор № 3117-2024 (4862) для подразделения ДТОиР.',
        category='Заключения Газпром газнадзора',
        order=9,
    ),
    DocumentImportSpec(
        source_path='Заключения ОТГ Газпром газнадзор/Заключение ОТГ № 3117-2024 (4862)-КСиР.pdf',
        title='Заключение ОТГ № 3117-2024 (4862) — КСиР',
        description='Заключение ОТГ Газпром газнадзор № 3117-2024 (4862) для подразделения КСиР.',
        category='Заключения Газпром газнадзора',
        order=10,
    ),
    DocumentImportSpec(
        source_path='Заключения ОТГ Газпром газнадзор/Заключение ОТГ № 3368-2025 (5110)-ДТОиР.pdf',
        title='Заключение ОТГ № 3368-2025 (5110) — ДТОиР',
        description='Заключение ОТГ Газпром газнадзор № 3368-2025 (5110) для подразделения ДТОиР.',
        category='Заключения Газпром газнадзора',
        order=11,
    ),
    DocumentImportSpec(
        source_path='Заключения ОТГ Газпром газнадзор/Заключение ОТГ № 3368-2025 (5110)-КСиР.pdf',
        title='Заключение ОТГ № 3368-2025 (5110) — КСиР',
        description='Заключение ОТГ Газпром газнадзор № 3368-2025 (5110) для подразделения КСиР.',
        category='Заключения Газпром газнадзора',
        order=12,
    ),
]


def _resolve_source_file(source_dir: Path, spec: DocumentImportSpec) -> Path:
    direct_path = source_dir / spec.source_path
    if direct_path.exists():
        return direct_path

    basename = Path(spec.source_path).name
    matches = list(source_dir.rglob(basename))
    if matches:
        return matches[0]

    raise FileNotFoundError(f'Не найден исходный PDF: {spec.source_path}')


def _build_destination_path(upload_dir: Path, spec: DocumentImportSpec) -> Path:
    filename = f'{generate_slug(spec.title)}.pdf'
    return upload_dir / filename


def import_certificate_documents(source_dir: Optional[Union[Path, str]] = None, dry_run: bool = False):
    source_dir = Path(source_dir or DEFAULT_SOURCE_DIR)
    if not source_dir.exists():
        raise FileNotFoundError(f'Папка с сертификатами не найдена: {source_dir}')

    upload_dir = Path(current_app.config['UPLOAD_FOLDER']) / DOCUMENTS_UPLOAD_SUBDIR
    upload_dir.mkdir(parents=True, exist_ok=True)

    report = {
        'created': 0,
        'updated': 0,
        'copied': 0,
        'total': len(DOCUMENT_IMPORT_SPECS),
        'items': [],
    }

    for spec in DOCUMENT_IMPORT_SPECS:
        if spec.category not in DOCUMENT_CATEGORIES:
            raise ValueError(f'Недопустимая категория документа: {spec.category}')

        source_path = _resolve_source_file(source_dir, spec)
        destination_path = _build_destination_path(upload_dir, spec)
        public_url = f'/static/uploads/{DOCUMENTS_UPLOAD_SUBDIR}/{destination_path.name}'

        document = Document.query.filter(
            or_(Document.title == spec.title, Document.file_url == public_url)
        ).first()

        created = False
        changed = False

        if document is None:
            document = Document()
            created = True

        if document.title != spec.title:
            document.title = spec.title
            changed = True
        if document.description != spec.description:
            document.description = spec.description
            changed = True
        if document.file_url != public_url:
            document.file_url = public_url
            changed = True
        if document.category != spec.category:
            document.category = spec.category
            changed = True
        if document.order != spec.order:
            document.order = spec.order
            changed = True
        if document.is_visible is not True:
            document.is_visible = True
            changed = True
        if document.is_featured != spec.is_featured:
            document.is_featured = spec.is_featured
            changed = True

        if created:
            db.session.add(document)
            report['created'] += 1
        elif changed:
            report['updated'] += 1

        need_copy = (
            not destination_path.exists()
            or destination_path.stat().st_size != source_path.stat().st_size
            or source_path.stat().st_mtime > destination_path.stat().st_mtime
        )
        if need_copy and not dry_run:
            shutil.copy2(source_path, destination_path)
            report['copied'] += 1

        report['items'].append({
            'title': spec.title,
            'source': str(source_path),
            'destination': str(destination_path),
            'url': public_url,
            'created': created,
            'updated': changed and not created,
        })

    if not dry_run:
        db.session.commit()

    return report

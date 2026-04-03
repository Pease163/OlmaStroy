# Документация Проекта

Этот каталог описывает актуальную систему, а не только публичный сайт. Для проекта важно различать три контура:

- публичный сайт на Flask + Jinja2;
- основную админку `/panel` на React;
- backend для админки `/api/v2/admin`.

`/admin` на Flask-Admin считается legacy-контуром и документируется отдельно только для совместимости.

## Как Читать Документацию

| Если вам нужно | Откройте |
|----------------|----------|
| Понять общую схему проекта | [architecture.md](architecture.md) |
| Разобраться с моделями и БД | [database.md](database.md) |
| Посмотреть API | [api.md](api.md) |
| Разрабатывать публичный сайт | [frontend.md](frontend.md) |
| Разрабатывать React SPA | [admin-panel.md](admin-panel.md) |
| Работать в админке как оператор | [admin.md](admin.md) |
| Поднять проект локально или на сервере | [deploy.md](deploy.md) |
| Добавить новую фичу | [developer-guide.md](developer-guide.md) |
| Проверить функциональные возможности | [features.md](features.md) |
| Посмотреть реальные ограничения | [todo.md](todo.md) |

## Карта Документов

| Документ | Для кого | Что покрывает |
|----------|----------|---------------|
| [architecture.md](architecture.md) | Разработчики | App factory, blueprints, SPA handoff, auth flows, cross-cutting concerns |
| [database.md](database.md) | Разработчики, поддержка | Все модели, связи, сидирование, миграции |
| [api.md](api.md) | Разработчики | Индекс API, общие соглашения и ссылки на разделы |
| [api-public.md](api-public.md) | Разработчики, интеграторы | `POST /api/contact`, валидация, ошибки, mail side effects |
| [api-admin.md](api-admin.md) | Разработчики frontend/backend | JWT auth, common response shape, route groups `/api/v2/admin` |
| [frontend.md](frontend.md) | Разработчики публичного сайта | Шаблоны, компоненты, CSS, JS, SEO и источники данных |
| [admin-panel.md](admin-panel.md) | Разработчики SPA | Route tree, providers, API client, CRUD-паттерн, build pipeline |
| [admin.md](admin.md) | Поддержка, редакторы | Основные сценарии работы в `/panel` |
| [deploy.md](deploy.md) | DevOps, разработчики | Локальный запуск, build, env vars, production notes |
| [developer-guide.md](developer-guide.md) | Разработчики | Добавление моделей, маршрутов, admin API, страниц SPA |
| [features.md](features.md) | Команда продукта, поддержка | Актуальные пользовательские и административные возможности |
| [todo.md](todo.md) | Разработчики, лиды | Техдолг, ограничения, ближайшие улучшения |

## Быстрый Reference

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py
python run.py
```

### SPA

```bash
cd admin-panel
npm install
npm run dev
npm run build
```

## Главные Допущения В Документации

- Основной административный интерфейс проекта: `/panel`.
- Основной backend для админки: `/api/v2/admin`.
- `/admin` нужен только для совместимости и ручной поддержки старого контура.
- Документация ориентирована прежде всего на разработчиков и команду поддержки.

# ОлмаСТРОЙ

Корпоративный сайт строительной компании с двумя административными контурами:

- публичный сайт на Flask + Jinja2;
- основная админка на React SPA `/panel` + Flask admin API `/api/v2/admin`;
- legacy-интерфейс Flask-Admin `/admin` для совместимости.

## Что В Репозитории

| Подсистема | Стек | Назначение |
|-----------|------|------------|
| Публичный сайт | Flask, Jinja2, SQLAlchemy, Vanilla JS | Главная, блог, проекты, вакансии, документы, техника, контактная форма |
| Admin API | Flask, Flask-JWT-Extended, Marshmallow | Авторизация, CRUD контента, настройки, аудит, медиа, роли, сессии |
| Админка `/panel` | React 19, TypeScript, Vite, React Query, Tailwind | Основной интерфейс редакторов и администраторов |
| Legacy `/admin` | Flask-Admin | Базовый CRUD для совместимости и ручных операций |

## Быстрый Старт

### 1. Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py
python run.py
```

Backend стартует на `http://localhost:5001`.

### 2. Admin Panel

```bash
cd admin-panel
npm install
npm run dev
```

Vite dev-сервер стартует на `http://localhost:5173/panel/` и проксирует `/api` на Flask.

### 3. Продакшн-Сборка SPA

```bash
cd admin-panel
npm run build
```

Сборка попадает в `app/static/panel/` и затем раздаётся Flask по `/panel/`.

## Основные URL

| URL | Назначение |
|-----|------------|
| `/` | Публичный сайт |
| `/blog/` | Блог |
| `/projects/` | Каталог проектов |
| `/vacancies/` | Каталог вакансий |
| `/documents/` | Документы |
| `/equipment/` | Техника |
| `/api/contact` | Публичный JSON API контактной формы |
| `/panel/` | Основная административная SPA |
| `/api/v2/admin/` | Backend для SPA-админки |
| `/admin/` | Legacy Flask-Admin |

## Seed-Данные

После `python seed.py` доступны:

- логин: `admin`
- пароль: `admin123`

Seed также создаёт базовые роли и permissions, стартовые настройки сайта, примеры записей блога, вакансий и проектов.

## Документация

Полный комплект лежит в [`docs/README.md`](docs/README.md).

Ключевые разделы:

- [`docs/architecture.md`](docs/architecture.md) — актуальная архитектура и потоки;
- [`docs/database.md`](docs/database.md) — модели, связи и сидирование;
- [`docs/api.md`](docs/api.md) — индекс API-документации;
- [`docs/admin-panel.md`](docs/admin-panel.md) — разработка React SPA;
- [`docs/admin.md`](docs/admin.md) — работа в админке `/panel`;
- [`docs/deploy.md`](docs/deploy.md) — запуск и production-заметки;
- [`docs/developer-guide.md`](docs/developer-guide.md) — guide для разработки новых фич.

## Команды Разработки

### Flask

```bash
python run.py
python seed.py
flask --app run.py db upgrade
flask --app run.py db migrate -m "message"
```

### React admin-panel

```bash
cd admin-panel
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

## Проверка После Подъёма

```bash
python -c "from app import create_app; app = create_app(); print('OK')"
```

Затем вручную проверьте:

- публичный сайт на `http://localhost:5001/`;
- логин в `/panel/login`;
- наличие данных после seed;
- загрузку уже собранной SPA по `/panel/` после `npm run build`.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Язык

Общение на русском языке.

## Проект

**ОлмаСТРОЙ** — корпоративный сайт строительной компании (нефтегазовая инфраструктура). Два основных модуля: Flask-бэкенд + React админ-панель.

## Команды для разработки

### Бэкенд (Flask)
```bash
# Запуск dev-сервера (порт 5001)
cd /Users/pease/PycharmProjects/ОлмаСТРОЙ
source .venv/bin/activate
python run.py

# Миграции БД
flask db migrate -m "описание"
flask db upgrade

# Сидирование данных
python seed.py

# Импорт фотографий объектов (одноразовый)
python import_photos.py
```

### Фронтенд (Admin Panel)
```bash
cd /Users/pease/PycharmProjects/ОлмаСТРОЙ/admin-panel

# Dev-сервер с hot reload
npm run dev

# Продакшн-сборка (выход в app/static/panel/)
npm run build
# или
npx vite build
```

### Линтинг
```bash
cd admin-panel
npx tsc --noEmit          # TypeScript проверка
npx eslint src/            # ESLint
```

### Верификация
```bash
# Проверка что приложение запускается
python -c "from app import create_app; app = create_app(); print('OK')"
```

**Тесты**: в проекте нет pytest/Jest — верификация через запуск приложения и ручное тестирование.

## Архитектура

### Бэкенд
- **Flask app factory** в `app/__init__.py` → `create_app()`
- **Расширения** в `app/extensions.py`: SQLAlchemy, JWT, Flask-Migrate, Marshmallow, Flask-Login
- **Модели** в `app/models/` — User, Role, Permission, BlogPost, Vacancy, Project, ContactSubmission, AuditLog, Notification, SiteSetting, Draft, UserSession, TokenBlocklist
- **Маршруты**: публичные blueprint'ы (`main_bp`, `blog_bp`, `vacancies_bp`) + admin API (`/api/v2/admin/`) с 25 модулями маршрутов в `app/routes/admin_api/`
- **Безопасность**: JWT (access 15 мин + refresh 7 дней), RBAC, 2FA (TOTP), аудит-логирование, rate limiting
- **Декораторы** в `app/decorators.py`: `@admin_required`, `@permission_required`
- **Сервисы** в `app/services/`: audit_service.py (`log_action()`)
- **Схемы** в `app/schemas/`: Marshmallow для сериализации
- **Утилиты** в `app/utils/`: `image.py` (`process_image()` — ресайз, WebP, thumbnail'ы), `slug.py` (генерация слагов)
- **CRUD-хелперы** в `app/routes/admin_api/crud_helpers.py` — общие функции для CRUD-маршрутов
- **Flask-Admin** на `/admin` (legacy-интерфейс), настройка в `app/admin/` (пакет: `__init__.py` + `views.py`)
- **JWT-обработчики** в `app/jwt_handlers.py`, **Jinja2-фильтры** в `app/template_filters.py`
- **SPA catch-all**: `/panel/` и `/panel/<path>` — отдаёт статику из `app/static/panel/`, fallback на `index.html` для React Router
- **БД**: SQLite по умолчанию (`olmastroy.db`), PostgreSQL через `DATABASE_URL`

### Фронтенд (admin-panel)
- **React 19** + TypeScript + Vite, маршрутизация через React Router v6
- **Path alias**: `@` → `./src` (в tsconfig.app.json и vite.config.ts)
- **Стейт**: React Context (Auth, Theme, Sidebar) + TanStack React Query (`staleTime: 30s`, `retry: 1`, `refetchOnWindowFocus: false`)
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS + CVA
- **Иконки**: Lucide React
- **Уведомления**: Sonner (`<Toaster position="top-right" richColors />`)
- **Формы**: React Hook Form + Zod валидация
- **Таблицы**: TanStack React Table
- **Редактор**: TipTap (Prosemirror)
- **Графики**: Recharts
- **HTTP**: Axios с авто-рефрешем токенов в `src/api/client.ts`
- **Сборка**: билдится в `app/static/panel/`, Flask отдаёт на `/panel/`

### Публичный сайт
- **Шаблоны**: Jinja2, `app/templates/base.html` + компоненты в `app/templates/components/`
- **CSS-переменные** (`app/static/css/style.css`):
  - Цвета: `--c-blue: #086EB5`, `--c-lime: #CBFE0A`, `--c-dark: #111418`, `--c-gray: #F3F5F7`, `--c-white: #FFFFFF`
  - Шрифты: `--font-main: 'Manrope'`, `--font-head: 'Oswald'`
- **JS** (`app/static/js/main.js`): scroll reveal (IntersectionObserver), счётчики (data-count), smooth scroll, навбар при скролле, маска телефона (+7), валидация формы, аккордеон услуг, cookie-баннер, scroll-to-top
- **JS** (`app/static/js/mobile-nav.js`): гамбургер-меню, закрытие по overlay/Escape/клику по ссылке, aria-атрибуты

### Ключевые паттерны
- API-модули в `admin-panel/src/api/` — по файлу на фичу (auth.ts, blog-posts.ts, users.ts...)
- Страницы lazy-loaded через React.lazy + Suspense в App.tsx
- Каждый CRUD: list-page → form-page, данные через React Query
- Кастомные хуки: `useCrudList` (список + удаление + пагинация), `useCrudForm` (создание/редактирование с React Hook Form)
- Цветовая палитра задаётся CSS-переменными в `admin-panel/src/styles/globals.css` (light/dark theme)
- Tailwind-цвета маппятся на переменные в `admin-panel/tailwind.config.js`
- Загруженные изображения хранятся в `app/static/uploads/` (обработка через `process_image()`: ресайз, WebP, thumbnails)

## Конфигурация

### Переменные окружения (.env)
- `SECRET_KEY` — секрет Flask-сессий
- `DATABASE_URL` — строка подключения к БД (по умолчанию SQLite)
- `JWT_SECRET_KEY` — секрет JWT-токенов
- `CORS_ORIGINS` — разрешённые origins для CORS

### config.py
- JWT access token: 15 минут, refresh token: 7 дней
- Максимальный размер загрузки: 16 MB
- Rate limit: 200 запросов/час (storage: memory)

## URL-структура

| URL | Что обслуживает |
|-----|----------------|
| `localhost:5001/` | Публичный сайт (Jinja2 шаблоны) |
| `localhost:5001/admin` | Flask-Admin (legacy) |
| `localhost:5001/panel/` | Админ-панель (собранный React SPA) |
| `localhost:5001/api/v2/admin/` | Admin REST API |
| `localhost:5173/panel/` | Vite dev-сервер (проксирует API на 5001) |

## Учётные данные для разработки

- Задаются через `seed.py` (см. скрипт для значений по умолчанию)

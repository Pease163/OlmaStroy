# Деплой И Инфраструктура

Документ описывает текущий рабочий способ запуска проекта. Он опирается на реальную конфигурацию `config.py`, а не на устаревшие настройки.

## Локальный Запуск

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py
python run.py
```

Backend будет доступен на `http://localhost:5001`.

### React SPA

```bash
cd admin-panel
npm install
npm run dev
```

SPA dev-режим будет доступен на `http://localhost:5173/panel/`.

Vite проксирует `/api` на `http://127.0.0.1:5001`, поэтому backend должен быть запущен параллельно.

## Production-Сборка SPA

```bash
cd admin-panel
npm run build
```

Сборка попадает в:

```text
app/static/panel/
```

После этого Flask начинает обслуживать `/panel/` и вложенные маршруты напрямую из собранного bundle.

## Переменные Окружения

`config.py` поддерживает следующие ключевые переменные:

| Переменная | По умолчанию | Назначение |
|-----------|--------------|------------|
| `ENVIRONMENT` | `development` | Управляет secure cookie и production-ветками |
| `SECRET_KEY` | случайный `os.urandom(32).hex()` | Flask sessions |
| `DATABASE_URL` | `sqlite:///.../olmastroy.db` | Подключение к БД |
| `JWT_SECRET_KEY` | случайный `os.urandom(32).hex()` | Подпись JWT |
| `CORS_ORIGINS` | `http://localhost:5173` | Разрешённые origins для admin API |
| `MAIL_SERVER` | `smtp.yandex.ru` | SMTP host |
| `MAIL_PORT` | `465` | SMTP port |
| `MAIL_USE_SSL` | `true` | SSL для почты |
| `MAIL_USERNAME` | пусто | SMTP login |
| `MAIL_PASSWORD` | пусто | SMTP password |
| `MAIL_DEFAULT_SENDER` | `noreply@olmastroy.ru` | Sender address |
| `MAIL_RECIPIENT` | `info@olmastroy.ru` | Получатель заявок с сайта |

### App-Specific Defaults

Дополнительно заданы:

- `MAX_CONTENT_LENGTH=16MB`;
- `AUTH_RATE_LIMIT=10/minute`;
- `RATELIMIT_DEFAULT=200/hour`;
- `JWT_ACCESS_TOKEN_EXPIRES=15 minutes`;
- `JWT_REFRESH_TOKEN_EXPIRES=7 days`;
- `JWT_TOKEN_LOCATION=['headers', 'cookies']`;
- `UPLOAD_FOLDER=app/static/uploads`;
- `SEARCH_RESULT_LIMIT=5`;
- `DASHBOARD_MONTHS=12`;
- `TOTP_ISSUER=ОлмаСТРОЙ Админ`.

## Файл `.env`

Минимальный пример:

```env
ENVIRONMENT=development
SECRET_KEY=change-me
JWT_SECRET_KEY=change-me-too
DATABASE_URL=sqlite:///olmastroy.db
CORS_ORIGINS=http://localhost:5173
MAIL_SERVER=smtp.yandex.ru
MAIL_PORT=465
MAIL_USE_SSL=true
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_DEFAULT_SENDER=noreply@olmastroy.ru
MAIL_RECIPIENT=info@olmastroy.ru
```

## Топология Запуска

### Development

- Flask backend на `5001`;
- Vite dev-server на `5173`;
- SQLite локально;
- uploads в `app/static/uploads`;
- React SPA в памяти Vite;
- legacy `/admin` обслуживается тем же Flask-процессом.

### Production

Рекомендуемая схема:

- Gunicorn или другой WSGI-сервер для Flask;
- Nginx как reverse proxy;
- PostgreSQL вместо SQLite;
- заранее собранный `admin-panel`;
- постоянное хранилище для `app/static/uploads`.

## Production-Рекомендации

### Flask / WSGI

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 "run:app"
```

### Nginx

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/ОлмаСТРОЙ/app/static/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

### База Данных

Для production желательно перейти на PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/olmastroy
```

### JWT И Cookies

При `ENVIRONMENT=production` backend автоматически включает:

- `JWT_COOKIE_SECURE=True`;
- `JWT_COOKIE_CSRF_PROTECT=True`.

Это важно учитывать при настройке HTTPS и reverse proxy.

## Uploads И Статические Файлы

Backend ожидает, что каталог `UPLOAD_FOLDER` существует или может быть создан на старте.

Что хранится в `app/static/uploads/`:

- загруженные медиа из SPA;
- оригиналы изображений;
- WebP-версии;
- thumbnails.

Если сервер разворачивается в ephemeral environment, этот каталог нужно вынести на persistent volume или внешний storage.

## Почта

`POST /api/contact` пытается отправлять email-уведомление только если:

- задан `MAIL_USERNAME`;
- задан получатель `MAIL_RECIPIENT`.

Если почта не настроена, заявки всё равно сохраняются в БД.

## Бэкапы

### SQLite

```bash
cp olmastroy.db olmastroy_backup_$(date +%Y%m%d).db
```

### PostgreSQL

```bash
pg_dump olmastroy > backup_$(date +%Y%m%d).sql
```

### Uploads

Не забывайте бэкапить:

```text
app/static/uploads/
```

## Smoke Check После Деплоя

Проверить вручную:

- `GET /` возвращает публичную главную;
- `GET /panel/` отдаёт React SPA;
- логин через `/api/v2/admin/auth/login` работает;
- `POST /api/contact` сохраняет заявку;
- `GET /api/v2/admin/dashboard/stats` отвечает для авторизованного пользователя;
- загрузка файла через `/api/v2/admin/upload` сохраняет файл в uploads;
- legacy `/admin/` по-прежнему открывается для `is_admin` пользователя.

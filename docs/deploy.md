# Деплой и инфраструктура

## Локальное развёртывание

### Пошаговая инструкция

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd ОлмаСТРОЙ

# 2. Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate    # macOS/Linux
# venv\Scripts\activate     # Windows

# 3. Установить зависимости
pip install -r requirements.txt

# 4. Создать файл .env (или использовать существующий)
cat > .env << 'EOF'
SECRET_KEY=dev-secret-key-olmastroy-2024
DATABASE_URL=sqlite:///olmastroy.db
FLASK_APP=run.py
FLASK_DEBUG=1
EOF

# 5. Заполнить базу данных начальными данными
python seed.py

# 6. Запустить dev-сервер
python run.py
```

Сайт будет доступен: **http://localhost:5001**

Админ-панель: **http://localhost:5001/admin** (admin / admin123)

## Переменные окружения

Файл `.env` в корне проекта. Загружается через `python-dotenv`.

| Переменная | Значение по умолчанию | Описание |
|-----------|----------------------|----------|
| `SECRET_KEY` | `fallback-secret-key` | Секретный ключ Flask (сессии, CSRF) |
| `DATABASE_URL` | `sqlite:///olmastroy.db` | URI базы данных |
| `FLASK_APP` | — | Точка входа Flask (`run.py`) |
| `FLASK_DEBUG` | — | Режим отладки (`1` = включён) |

> **Важно:** В production обязательно установите уникальный `SECRET_KEY` (минимум 32 символа).

## Конфигурация приложения

Файл `config.py`:

| Параметр | Значение | Описание |
|---------|---------|----------|
| `UPLOAD_FOLDER` | `app/static/uploads` | Папка для загруженных файлов |
| `MAX_CONTENT_LENGTH` | 16 MB | Максимальный размер загрузки |
| `CKEDITOR_SERVE_LOCAL` | `True` | Использовать локальные ресурсы CKEditor |
| `CKEDITOR_HEIGHT` | 400 | Высота редактора в пикселях |
| `CKEDITOR_LANGUAGE` | `ru` | Язык интерфейса CKEditor |
| `FLASK_ADMIN_SWATCH` | `cosmo` | Тема Bootstrap для Flask-Admin |

## Порт

Dev-сервер запускается на порту **5001** (задан в `run.py`).

```python
app.run(debug=True, port=5001)
```

## Production-рекомендации

### WSGI-сервер

Заменить dev-сервер Werkzeug на Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app()"
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name olmastroy.ru;

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
        add_header Cache-Control "public, immutable";
    }
}
```

### База данных

Перейти с SQLite на PostgreSQL:

```bash
pip install psycopg2-binary
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/olmastroy
```

### SSL

Использовать Let's Encrypt + Certbot:

```bash
sudo certbot --nginx -d olmastroy.ru
```

### Переменные окружения для production

```env
SECRET_KEY=<сгенерированный-32+-символов>
DATABASE_URL=postgresql://user:password@localhost:5432/olmastroy
FLASK_DEBUG=0
```

## Бэкапы

### SQLite

```bash
# Копирование файла базы данных
cp olmastroy.db olmastroy_backup_$(date +%Y%m%d).db
```

### PostgreSQL (если перешли)

```bash
pg_dump olmastroy > backup_$(date +%Y%m%d).sql
```

## Зависимости

Файл `requirements.txt` (11 пакетов):

```
Flask==2.3.3
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.3
Flask-Admin==1.6.1
Flask-CKEditor==0.5.1
Flask-Migrate==4.0.5
Flask-WTF==1.2.1
python-dotenv==1.0.0
Werkzeug==2.3.7
email-validator==2.1.0
Pillow==10.2.0
```

Установка:

```bash
pip install -r requirements.txt
```

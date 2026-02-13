# Руководство разработчика

## Локальная установка

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd ОлмаСТРОЙ

# 2. Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# 3. Установить зависимости
pip install -r requirements.txt

# 4. Заполнить базу
python seed.py

# 5. Запустить
python run.py
# → http://localhost:5001
```

## Структура проекта (краткая)

```
app/
├── __init__.py          # create_app() — Application Factory
├── extensions.py        # db, login_manager, migrate, ckeditor
├── utils.py             # process_image()
├── models/              # SQLAlchemy-модели (5 моделей)
├── routes/              # Blueprints (5 модулей)
├── admin/               # Flask-Admin views
├── templates/           # Jinja2-шаблоны
└── static/              # CSS, JS, изображения
```

## Как добавить новый Blueprint

### 1. Создать файл маршрутов

```python
# app/routes/partners.py
from flask import Blueprint, render_template

partners_bp = Blueprint('partners', __name__, url_prefix='/partners')

@partners_bp.route('/')
def partners_list():
    return render_template('partners/list.html')
```

### 2. Зарегистрировать в `app/routes/__init__.py`

```python
from app.routes.partners import partners_bp

def register_blueprints(app):
    # ... существующие blueprints
    app.register_blueprint(partners_bp)
```

### 3. Создать шаблон

```
app/templates/partners/list.html
```

```html
{% extends 'base.html' %}

{% block title %}Партнёры{% endblock %}

{% block content %}
<section class="container" style="padding-top: 120px;">
    <h1 class="section-title">Партнёры</h1>
    <!-- контент -->
</section>
{% endblock %}
```

## Как добавить новую модель

### 1. Создать файл модели

```python
# app/models/partner.py
from app.extensions import db

class Partner(db.Model):
    __tablename__ = 'partners'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    logo_url = db.Column(db.String(500))
    website = db.Column(db.String(500))
    is_visible = db.Column(db.Boolean, default=True)
```

### 2. Зарегистрировать в `app/models/__init__.py`

```python
from app.models.partner import Partner

__all__ = ['User', 'BlogPost', 'Vacancy', 'Project', 'ContactSubmission', 'Partner']
```

### 3. Создать миграцию

```bash
flask db migrate -m "add partners table"
flask db upgrade
```

### 4. (Опционально) Добавить admin view

```python
# В app/admin/__init__.py
from app.models.partner import Partner
from app.admin.views import PartnerView  # создать view

admin.add_view(PartnerView(Partner, db.session, name='Партнёры', endpoint='partner'))
```

## Как добавить новый шаблон

Все страницы наследуют `base.html`. Минимальный шаблон:

```html
{% extends 'base.html' %}

{% block title %}Название страницы{% endblock %}
{% block meta_description %}SEO-описание{% endblock %}

{% block content %}
<!-- Основной контент страницы -->
{% endblock %}
```

### Доступные блоки

| Блок | Обязательный | Описание |
|------|:---:|----------|
| `title` | да | Заголовок вкладки |
| `meta_description` | рекомендуется | SEO-описание |
| `content` | да | Контент страницы |
| `og_title` | нет | Open Graph заголовок |
| `og_description` | нет | Open Graph описание |
| `og_image` | нет | Open Graph изображение |
| `og_type` | нет | Тип страницы (default: `website`) |
| `json_ld_extra` | нет | Дополнительная JSON-LD разметка |
| `extra_css` | нет | Дополнительные CSS-стили |
| `extra_js` | нет | Дополнительные скрипты |

### Использование компонентов

```html
{# Хлебные крошки #}
{% from 'components/_breadcrumbs.html' import breadcrumbs %}
{{ breadcrumbs([
    {'title': 'Партнёры', 'url': url_for('partners.list')},
    {'title': partner.name}
]) }}

{# Пагинация #}
{% from 'components/_pagination.html' import render_pagination %}
{{ render_pagination(pagination) }}

{# WebP-картинка #}
{% from 'components/_picture.html' import picture %}
{{ picture('img/photo.jpg', 'Описание') }}
```

### Использование фильтров

```html
{# Дата на русском #}
{{ post.created_at|ru_date }}
{# → "15 января 2025" #}

{# Время чтения #}
{{ post.content|reading_time }}
{# → "3 мин." #}
```

## Как добавить CSS-стили

Основной файл: `app/static/css/style.css`.

### Переменные

Используйте CSS-переменные из `:root`:
```css
.my-element {
    color: var(--c-blue);
    font-family: var(--font-main);
    transition: all 0.3s var(--ease);
}
```

### Контейнер

```css
.container {
    max-width: var(--container);  /* 1400px */
    margin: 0 auto;
    padding: 0 var(--gap);       /* 0 20px */
}
```

### Адаптивность

Добавляйте медиа-запросы в секцию `RESPONSIVE` (строки 1315+):

```css
@media (max-width: 768px) {
    .my-element { /* мобильные стили */ }
}
```

## Как добавить JavaScript

Основной файл: `app/static/js/main.js`.

Проект использует **Vanilla JS (ES6+)**, без фреймворков. Для анимаций при скролле используйте `IntersectionObserver`:

```javascript
// Добавить класс .reveal к элементу в HTML
// JS автоматически добавит .revealed при появлении в viewport
```

Для отдельных скриптов страницы используйте блок `extra_js`:

```html
{% block extra_js %}
<script src="{{ url_for('static', filename='js/my-script.js') }}"></script>
{% endblock %}
```

## Code Style

### Python
- **PEP 8** — стандартное форматирование
- Строки в одинарных кавычках (`'text'`)
- Docstrings — тройные двойные кавычки (`"""text"""`)
- Импорты: stdlib → third-party → local (разделены пустой строкой)

### CSS
- BEM-подобная нотация для компонентов (`.block__element`, `.block--modifier`)
- CSS-переменные для цветов, шрифтов, размеров
- Каждая секция отделена комментарием

### JavaScript
- ES6+ синтаксис (`const`, `let`, arrow functions)
- Vanilla JS — без jQuery и фреймворков
- `addEventListener` с `{ passive: true }` для скролл-событий

### HTML/Jinja2
- Семантический HTML5 (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`)
- ARIA-атрибуты для доступности
- Макросы (компоненты) — файлы с префиксом `_` в `components/`

## Git

На данный момент Git-flow не настроен. Рекомендуется:

1. `main` — стабильная ветка (production)
2. `develop` — ветка разработки
3. Feature branches: `feature/<name>`
4. Hotfix branches: `hotfix/<name>`

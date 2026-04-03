# Публичный Фронтенд

Этот документ описывает только публичный сайт на Flask + Jinja2. React SPA `/panel` вынесена в отдельный документ: [admin-panel.md](admin-panel.md).

## Карта Страниц

| URL | Шаблон | Источник данных |
|-----|--------|-----------------|
| `/` | `index.html` | `Project`, `BlogPost`, `Service`, `Testimonial`, `ProjectImage` |
| `/about/` | `about.html` | Статический контент + статические активы |
| `/projects/` | `projects/list.html` | `Project` |
| `/projects/<slug>` | `projects/detail.html` | `Project`, `ProjectImage` |
| `/documents/` | `documents.html` | `Document` |
| `/equipment/` | `equipment/list.html` | `Equipment` |
| `/blog/` | `blog/list.html` | `BlogPost`, `Tag` |
| `/blog/<slug>` | `blog/detail.html` | `BlogPost` |
| `/vacancies/` | `vacancies/list.html` | `Vacancy` |
| `/vacancies/<id>` | `vacancies/detail.html` | `Vacancy` |
| `/robots.txt` | генерируется route'ом | `request.host_url` |
| `/sitemap.xml` | `sitemap.xml` | `BlogPost`, `Vacancy`, `Project` |
| `404`, `500` | `errors/*.html` | Ошибки Flask |

## Источники Данных По Страницам

### Главная

`main.index()` собирает:

- видимые проекты;
- последние опубликованные статьи;
- услуги из БД с fallback на встроенный `SERVICES`;
- видимые отзывы;
- до 14 изображений проектов для фотоленты.

### Блог

`blog.blog_list()`:

- показывает только опубликованные посты;
- уважает отложенную публикацию через `publish_at`;
- фильтрует по тегу `tag=<slug>`;
- использует пагинацию по 9 записей.

### Проекты

`main.projects_list()`:

- показывает только `Project.is_visible=True`;
- поддерживает фильтр `?category=...`;
- строит набор категорий динамически из данных.

### Вакансии

`vacancies.vacancies_list()`:

- показывает только `Vacancy.is_active=True`;
- поддерживает фильтр `?location=...`;
- строит список доступных location из активных вакансий.

## Template Architecture

Все публичные страницы наследуют `base.html`.

Основные include/import точки:

- `components/_header.html`
- `components/_footer.html`
- `components/_ticker.html`
- `components/_breadcrumbs.html`
- `components/_pagination.html`
- `components/_blog_card.html`
- `components/_vacancy_card.html`
- `components/_project_card.html`
- `components/_photo_ribbon.html`
- `components/_picture.html`

## Блоки `base.html`

| Блок | Назначение |
|------|------------|
| `title` | `<title>` страницы |
| `meta_description` | SEO description |
| `og_title`, `og_description`, `og_image`, `og_type` | Open Graph |
| `twitter_title`, `twitter_description` | Twitter metadata |
| `json_ld_extra` | Дополнительная schema.org разметка |
| `extra_css` | Страничные стили |
| `content` | Основной HTML |
| `extra_js` | Страничные скрипты |

## Повторно Используемые Компоненты

| Компонент | Что делает |
|-----------|------------|
| `_header.html` | Шапка сайта, desktop и mobile navigation |
| `_footer.html` | Подвал с контактами и реквизитами |
| `_ticker.html` | Бегущая строка/маркиз |
| `_breadcrumbs.html` | BreadcrumbList с schema.org |
| `_pagination.html` | Пагинация для Flask `Pagination` |
| `_blog_card.html` | Карточка статьи |
| `_vacancy_card.html` | Карточка вакансии |
| `_project_card.html` | Карточка проекта |
| `_photo_ribbon.html` | Фотолента из project images |
| `_picture.html` | `<picture>` с WebP fallback |

## CSS И Визуальная Система

Основной файл:

```text
app/static/css/style.css
```

Ключевые CSS-переменные:

- `--c-blue`
- `--c-lime`
- `--c-dark`
- `--c-gray`
- `--c-white`
- `--font-main`
- `--font-head`
- `--container`
- `--gap`
- `--ease`

Что в нём зашито:

- reset и layout utilities;
- header и hero;
- grids для проектов, услуг, блога и каталогов;
- карточки вакансий, статей и проектов;
- timeline и geography sections;
- cookie banner и scroll-to-top;
- responsive rules.

## JavaScript

Публичный сайт использует обычный браузерный JS без сборки.

### `app/static/js/main.js`

Отвечает за:

- reveal animation через `IntersectionObserver`;
- timeline progress;
- smooth scroll по якорям;
- sticky/scrolled header;
- progress bar скролла;
- кнопку scroll-to-top;
- animated counters;
- phone input mask;
- базовую form validation;
- service accordion;
- cookie banner.

### `app/static/js/mobile-nav.js`

Отвечает за:

- гамбургер-меню;
- блокировку скролла при открытом меню;
- закрытие по overlay, ссылке и `Escape`.

### `app/static/js/contact-form.js`

Отправляет contact form как JSON в `POST /api/contact` и показывает inline success/error response.

### `app/static/js/yandex-map.js`

Строит карту географии работ через Yandex Maps и добавляет placemarks по офису и регионам работ.

## SEO И Meta

Публичный фронтенд уже содержит:

- canonical URL;
- Open Graph теги;
- Twitter Card теги;
- JSON-LD для `Organization`, `Article`, `JobPosting`, `BreadcrumbList`;
- динамический `robots.txt`;
- динамический `sitemap.xml`.

SEO-поля контента хранятся в:

- `BlogPost.meta_title`
- `BlogPost.meta_description`
- `Project.meta_title`
- `Project.meta_description`

## Внешние Зависимости Публичного Фронтенда

Публичный контур зависит от CDN в `base.html`:

- Google Fonts;
- Tailwind CDN script.

Это важно учитывать при офлайн-окружениях и production hardening.

## Что Проверять После Изменений В Публичном Фронтенде

- корректность маршрутов и breadcrumb;
- фильтры `category`, `location`, `tag`;
- валидацию и отправку contact form;
- мобильное меню и responsive layout;
- OG/meta tags на детальных страницах;
- генерацию `robots.txt` и `sitemap.xml`.

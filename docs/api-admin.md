# Admin API v2

`/api/v2/admin` обслуживает React SPA `/panel` и является основным административным API проекта.

## Общие правила

- Все запросы идут к базовому URL `/api/v2/admin`.
- SPA-клиент использует `Authorization: Bearer <access_token>` и `withCredentials: true` для refresh cookie.
- Refresh token хранится в cookie и используется только для `/auth/refresh`.
- Login endpoint ограничен rate limit из конфигурации `AUTH_RATE_LIMIT` (`10/minute` по умолчанию).
- Refresh cookie path зафиксирован как `/api/v2/admin/auth/refresh`.
- Для production включаются secure cookies и CSRF-защита refresh cookie.
- Успешные ответы обычно возвращают `{"data": ...}`.
- Списки возвращают `{"data": [...], "meta": {...}}`.
- Ошибки возвращают `{"error": {"code": "...", "message": "..."}}`.
- Для ошибок валидации могут добавляться `details`.

## Auth flow

### `POST /auth/login`

Вход по `username` и `password`. Если у пользователя включена 2FA, сервер может вернуть `requires_2fa: true`.

**Тело запроса**

```json
{
  "username": "admin",
  "password": "secret",
  "totp_code": "123456"
}
```

**Успех**

```json
{
  "data": {
    "access_token": "...",
    "user": {}
  }
}
```

### `POST /auth/refresh`

Возвращает новый access token по refresh cookie.

### `POST /auth/logout`

Блокирует текущий JWT через `TokenBlocklist` и деактивирует пользовательскую сессию.

### `GET /auth/me`

Возвращает текущего пользователя.

### `POST /auth/2fa/setup`

Создаёт TOTP secret и QR-код в `data:image/png;base64,...`.

### `POST /auth/2fa/verify`

Подтверждает TOTP-код и включает 2FA.

### `POST /auth/2fa/disable`

Отключает 2FA по паролю пользователя.

## Пагинация и поиск

List-endpoints используют общие query params:

- `page`
- `per_page`
- `sort`
- `order`
- `search`

По умолчанию:

- `per_page = 20`
- `order = desc`

Для некоторых сущностей доступны фильтры по конкретным полям, например `is_published`, `is_active`, `is_visible`, `is_read`.

## Bulk-операции

Список массовых действий:

- `bulk-delete`
- `bulk-toggle`
- `bulk-publish`
- `bulk-read`

Формат payload обычно такой:

```json
{
  "ids": [1, 2, 3]
}
```

Для переключателей может добавляться второе поле, например `is_active` или `is_visible`.

## Эндпоинты по модулям

### Dashboard

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/dashboard/stats` | Сводные счётчики |
| GET | `/dashboard/charts` | Данные для графиков |
| GET | `/dashboard/activity` | Последние действия из audit log |

### Blog posts

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/blog-posts` | Список постов |
| GET | `/blog-posts/<post_id>` | Один пост |
| POST | `/blog-posts` | Создание |
| PUT | `/blog-posts/<post_id>` | Полное обновление |
| PATCH | `/blog-posts/<post_id>` | Частичное обновление |
| DELETE | `/blog-posts/<post_id>` | Удаление |
| POST | `/blog-posts/bulk-delete` | Массовое удаление |
| POST | `/blog-posts/bulk-publish` | Массовая публикация |
| GET | `/blog-posts/<post_id>/history` | История изменений |
| POST | `/blog-posts/<post_id>/rollback/<audit_id>` | Откат к версии |

Поля сущности: `title`, `slug`, `content`, `excerpt`, `image_url`, `is_published`, `publish_at`, `meta_title`, `meta_description`.

### Vacancies

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/vacancies` | Список вакансий |
| GET | `/vacancies/<vacancy_id>` | Одна вакансия |
| POST | `/vacancies` | Создание |
| PUT | `/vacancies/<vacancy_id>` | Полное обновление |
| PATCH | `/vacancies/<vacancy_id>` | Частичное обновление |
| DELETE | `/vacancies/<vacancy_id>` | Удаление |
| POST | `/vacancies/bulk-delete` | Массовое удаление |
| POST | `/vacancies/bulk-toggle` | Массовое включение/выключение |
| GET | `/vacancies/<vacancy_id>/history` | История изменений |

### Projects

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/projects` | Список проектов |
| GET | `/projects/<project_id>` | Один проект |
| POST | `/projects` | Создание |
| PUT | `/projects/<project_id>` | Полное обновление |
| PATCH | `/projects/<project_id>` | Частичное обновление |
| DELETE | `/projects/<project_id>` | Удаление |
| POST | `/projects/bulk-delete` | Массовое удаление |
| POST | `/projects/bulk-toggle` | Массовое переключение видимости |
| GET | `/projects/<project_id>/history` | История изменений |

### Contacts

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/contacts` | Список заявок |
| GET | `/contacts/<contact_id>` | Одна заявка |
| PUT | `/contacts/<contact_id>/read` | Отметить прочитанной |
| POST | `/contacts/bulk-read` | Массово отметить прочитанными |
| DELETE | `/contacts/<contact_id>` | Удаление |
| POST | `/contacts/bulk-delete` | Массовое удаление |

### Users and sessions

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/users` | Список пользователей |
| GET | `/users/<user_id>` | Один пользователь |
| POST | `/users` | Создание |
| PUT | `/users/<user_id>` | Обновление |
| DELETE | `/users/<user_id>` | Удаление |
| GET | `/users/<user_id>/sessions` | Активные сессии |
| DELETE | `/users/<user_id>/sessions/<session_id>` | Завершение сессии |

### Roles and permissions

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/roles` | Список ролей |
| GET | `/roles/<role_id>` | Одна роль |
| POST | `/roles` | Создание роли |
| PUT | `/roles/<role_id>` | Обновление роли |
| DELETE | `/roles/<role_id>` | Удаление роли |
| GET | `/permissions` | Список прав |

### Services, tags, images, documents, testimonials, equipment

| Модуль | Endpoint-ы |
|---|---|
| `/services` | `GET`, `POST`, `PUT`, `DELETE`, `POST /bulk-delete`, `GET /<service_id>` |
| `/tags` | `GET`, `POST`, `DELETE /<tag_id>` |
| `/projects/<project_id>/images` | `GET`, `POST`, `PATCH /<image_id>`, `POST /reorder`, `DELETE /<image_id>` |
| `/documents` | `GET`, `POST`, `PUT /<document_id>`, `DELETE /<document_id>`, `GET /<document_id>`, `POST /bulk-delete` |
| `/testimonials` | `GET`, `POST`, `PUT /<testimonial_id>`, `DELETE /<testimonial_id>`, `GET /<testimonial_id>`, `POST /bulk-delete` |
| `/equipment` | `GET`, `POST`, `PUT /<equipment_id>`, `DELETE /<equipment_id>`, `GET /<equipment_id>`, `POST /bulk-delete` |

### Settings, audit, drafts, notifications, search, export, upload

| Метод | Endpoint | Назначение |
|---|---|---|
| GET | `/settings` | Получить сгруппированные настройки |
| PUT | `/settings` | Сохранить настройки |
| GET | `/audit-log` | Аудит-лог |
| GET | `/drafts/<entity_type>/<entity_id>` | Прочитать черновик |
| PUT | `/drafts/<entity_type>/<entity_id>` | Сохранить черновик |
| DELETE | `/drafts/<entity_type>/<entity_id>` | Удалить черновик |
| GET | `/notifications` | Список уведомлений |
| PUT | `/notifications/read-all` | Отметить все прочитанными |
| PUT | `/notifications/<notification_id>` | Отметить одно уведомление прочитанным |
| DELETE | `/notifications/<notification_id>` | Удалить уведомление |
| GET | `/search` | Глобальный поиск |
| GET | `/export/<entity>` | Экспорт `csv`, `xlsx`, `pdf` |
| POST | `/upload` | Загрузка файла |
| GET | `/media` | Список медиафайлов |
| DELETE | `/media/<filename>` | Удаление медиафайла |

## Схемы ошибок

### Валидация

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации",
    "details": {
      "field": ["message"]
    }
  }
}
```

### Авторизация

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Неверный логин или пароль"
  }
}
```

```json
{
  "error": {
    "code": "2FA_REQUIRED",
    "message": "Введите код 2FA"
  },
  "requires_2fa": true
}
```

## Замечания по реализации

- `admin_required` проверяет только `is_admin` и `is_active`.
- В коде есть `Role` и `Permission`, но часть текущих маршрутов использует только `admin_required`, без гранулярной проверки по `codename`.
- Global search ограничивает количество результатов через `SEARCH_RESULT_LIMIT`.
- Upload сохраняет файлы в `UPLOAD_FOLDER` и для изображений дополнительно пытается создать WebP и thumbnail.

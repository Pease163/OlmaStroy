# API-документация

Эта группа документов описывает публичный API сайта и admin API, который обслуживает React SPA `/panel`.

## Разделы

- [Публичный API](api-public.md) - `POST /api/contact`
- [Admin API v2](api-admin.md) - `/api/v2/admin/*`

## Общие соглашения

- Успешные ответы обычно возвращают объект `data`.
- Списки возвращают `data` и `meta` с пагинацией.
- Ошибки возвращают `error` с полями `code` и `message`; для ошибок валидации может добавляться `details`.
- Большинство admin-эндпоинтов защищены JWT и ориентированы на `/panel` как основной интерфейс управления.
- Legacy Flask-Admin на `/admin` существует отдельно и не входит в этот API-контракт.

## Форматы ответов

### Успешный ответ

```json
{
  "data": {}
}
```

### Список с пагинацией

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 0,
    "total_pages": 0
  }
}
```

### Ошибка

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации",
    "details": {}
  }
}
```

## Основные коды ошибок

- `BAD_REQUEST`
- `VALIDATION_ERROR`
- `INVALID_CREDENTIALS`
- `FORBIDDEN`
- `ACCOUNT_DISABLED`
- `INVALID_TOKEN`
- `NOT_FOUND`
- `NO_PERMISSION`
- `2FA_REQUIRED`


# Публичный API

Публичный API сайта минимален. На текущий момент здесь есть один основной endpoint для контактной формы.

## `POST /api/contact`

Принимает заявку с сайта, создаёт запись `ContactSubmission` и, если настроена почта, отправляет уведомление на `MAIL_RECIPIENT`.

**Content-Type:** `application/json`

### Тело запроса

| Поле | Тип | Обязательное | Описание |
|---|---|:---:|---|
| `name` | string | да | Имя отправителя |
| `phone` | string | нет | Телефон |
| `email` | string | нет | Email |
| `message` | string | нет | Текст сообщения |
| `subject` | string | нет | Тема заявки |

Правила валидации:

- `name` обязателен.
- Нужно указать хотя бы одно контактное поле: `phone` или `email`.
- Пустое или не-JSON тело запроса возвращает ошибку формата данных.

### Успех

`201 Created`

```json
{
  "success": true,
  "message": "Заявка успешно отправлена!"
}
```

### Ошибки

`400 Bad Request`

```json
{
  "success": false,
  "error": "Поле \"Имя\" обязательно."
}
```

```json
{
  "success": false,
  "error": "Укажите телефон или email."
}
```

```json
{
  "success": false,
  "error": "Неверный формат данных."
}
```

### Пример

```bash
curl -X POST http://localhost:5001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Петров",
    "phone": "+7 (999) 123-45-67",
    "email": "ivan@example.com",
    "message": "Интересует сотрудничество",
    "subject": "Партнёрство"
  }'
```

## Поведение на backend

- Заявка сохраняется в таблицу `contact_submissions`.
- Если `MAIL_USERNAME` и `MAIL_RECIPIENT` не настроены, email-уведомление пропускается.
- Ошибки отправки письма не ломают основную операцию сохранения заявки.


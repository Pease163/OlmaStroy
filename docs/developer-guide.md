# Руководство Разработчика

Документ описывает текущий способ развития проекта. Основной путь для новых административных функций: модель/схема/`/api/v2/admin`/React SPA `/panel`. Flask-Admin не должен быть основной точкой расширения новых возможностей.

## Локальная Среда

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
```

### Проверка Что Backend Собирается

```bash
python -c "from app import create_app; app = create_app(); print('OK')"
```

## Структура Проекта

```text
app/
  models/        SQLAlchemy-модели
  schemas/       Marshmallow-схемы
  routes/        публичные routes и admin API
  services/      переиспользуемая бизнес-логика
  templates/     публичные и legacy admin шаблоны
  static/        css/js/img/uploads/panel

admin-panel/
  src/api/       axios layer по сущностям
  src/pages/     list/form/detail pages
  src/components/shared hooks
  src/contexts/  auth/theme/sidebar
```

## Как Добавлять Публичную Страницу

### 1. Добавить или расширить route

Обычно это делается в одном из существующих blueprint-файлов:

- `app/routes/main.py`
- `app/routes/blog.py`
- `app/routes/vacancies.py`

Если появляется новая функциональная область, можно создать отдельный blueprint и зарегистрировать его в `app/routes/__init__.py`.

### 2. Создать Jinja-шаблон

Новый шаблон должен наследовать `base.html` и использовать существующие компоненты из `app/templates/components/`, если они подходят.

### 3. Подтянуть данные через модели

Публичные routes читают данные прямо из SQLAlchemy-моделей. При добавлении новой сущности стоит сразу проверить:

- нужна ли публикация через флаг видимости;
- нужна ли ручная сортировка через `order`;
- нужны ли SEO-поля;
- нужны ли дополнительные изображения.

### 4. Обновить документацию

Как минимум:

- `docs/frontend.md`
- `docs/features.md`
- при новой модели ещё и `docs/database.md`

## Как Добавлять Новую Сущность В Admin API

Рекомендуемая цепочка:

1. Создать или обновить SQLAlchemy-модель в `app/models/`.
2. Зарегистрировать модель в `app/models/__init__.py`.
3. Создать Marshmallow-схему в `app/schemas/`.
4. Добавить route-модуль в `app/routes/admin_api/`.
5. Подключить модуль в `app/routes/admin_api/__init__.py`.
6. Добавить клиентский API-файл в `admin-panel/src/api/`.
7. Добавить страницы list/form/detail в `admin-panel/src/pages/`.
8. При необходимости включить пункт в navigation.
9. Обновить документацию.

### Когда Можно Использовать `crud_helpers.py`

Generic helpers подходят, если ресурс поддерживает стандартный набор:

- список с пагинацией;
- одиночное чтение;
- create;
- update;
- delete;
- bulk delete или bulk toggle;
- историю изменений.

Если логика нестандартная, создавайте явные route handlers как в `auth.py`, `settings.py`, `upload.py`, `notifications.py`, `project_images.py`.

## Как Добавлять Страницу В React SPA

### 1. API-слой

Создайте или обновите модуль в `admin-panel/src/api/`.

Принципы:

- все запросы идут через `src/api/client.ts`;
- baseURL уже задан как `/api/v2/admin`;
- access token подставляется interceptor'ом;
- refresh выполняется автоматически при `TOKEN_EXPIRED`.

### 2. Страницы

Для CRUD-потока обычно нужны:

- `*-list.tsx`
- `*-form.tsx`

Если нужен отдельный просмотр, добавляется `*-detail.tsx`.

### 3. Роутинг

Добавьте lazy import и маршруты в `admin-panel/src/App.tsx`.

### 4. Навигация

Если раздел должен быть доступен из sidebar, обновите `admin-panel/src/lib/constants.ts`.

### 5. Переиспользуемые паттерны

Предпочтительный путь:

- `useCrudList` для списков;
- `useCrudForm` для форм;
- `DataTable` для таблиц;
- `React Query` для загрузки/инвалидации данных.

## Как Добавлять Новую Модель

Минимальный checklist:

1. Создать модель.
2. Продумать индексы и уникальные поля.
3. Добавить `to_dict()` только если модель реально возвращается без схемы.
4. При необходимости добавить `generate_slug()` или typed getters.
5. Создать миграцию.
6. Проверить `seed.py`, если сущность нужна в dev-данных.

## RBAC, Пользователи И Безопасность

На сегодня есть две параллельные модели доступа:

- legacy admin uses `Flask-Login`;
- SPA uses JWT access + refresh + optional TOTP.

Если вы расширяете admin API:

- минимумом является `@admin_required`;
- для настоящего RBAC лучше постепенно вводить `@permission_required`, но это потребует согласованного обновления frontend и ролей.

Нельзя забывать о сценариях:

- пользователь неактивен;
- 2FA включена;
- refresh token отозван;
- пользователь пытается удалить самого себя.

## Audit Log

Новые административные действия желательно логировать через `log_action()`.

Что логировать:

- create/update/delete;
- state changes;
- важные security-события;
- массовые операции.

Если есть редактируемые поля, собирайте `changes` через `get_entity_changes()` или совместимую структуру.

## Работа С Файлами И Изображениями

Для загрузок используется `POST /api/v2/admin/upload`.

Особенности:

- файл сохраняется в `app/static/uploads`;
- изображения могут получить WebP и thumbnail;
- публичные URL возвращаются сразу из API.

Если добавляется новая сущность с изображениями, желательно использовать уже существующий upload pipeline, а не отдельную схему хранения.

## Миграции

Команды:

```bash
flask --app run.py db migrate -m "описание"
flask --app run.py db upgrade
flask --app run.py db downgrade
```

Перед миграцией полезно убедиться, что:

- обновлены модель и схема;
- не сломаны public routes;
- не сломана сериализация в admin API;
- seed остаётся валидным для локальной разработки.

## Документация Как Часть Done

Если вы меняете поведение проекта, обновляйте минимум:

- `docs/database.md` при изменении модели;
- `docs/api-admin.md` или `docs/api-public.md` при изменении контрактов;
- `docs/frontend.md` при изменении публичных шаблонов;
- `docs/admin-panel.md` и `docs/admin.md` при изменении SPA или операторских сценариев;
- `docs/features.md`, если изменилась доступная функциональность.

## Тестирование И Верификация

Автотестов в репозитории пока нет, поэтому базовая верификация после изменения фичи обычно такая:

```bash
python -c "from app import create_app; app = create_app(); print('OK')"
cd admin-panel && npx tsc --noEmit
cd admin-panel && npm run lint
```

После этого желательно вручную пройти затронутый сценарий в браузере.

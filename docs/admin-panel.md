# Admin Panel

Документ описывает React SPA админки, которая работает на `/panel` и использует `/api/v2/admin` как основной backend-контракт.

## Назначение

SPA покрывает основную операционную работу с контентом и сервисными сущностями:

- блог
- вакансии
- проекты и галерею фото
- услуги
- документы
- отзывы
- технику
- заявки
- пользователи, роли и настройки
- аудит, уведомления, черновики, экспорт, поиск и медиа

Legacy Flask-Admin на `/admin` существует отдельно и не является основным UI.

## Стек и сборка

Ключевые технологии находятся в [`admin-panel/package.json`](../admin-panel/package.json) и [`admin-panel/vite.config.ts`](../admin-panel/vite.config.ts):

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- React Hook Form + Zod
- Axios
- shadcn/ui на базе Radix
- TipTap
- Recharts
- Sonner

Сборка:

```bash
cd admin-panel
npm run build
```

Выходной каталог настроен в `../app/static/panel`, а `base` у Vite равен `/panel/`.

## Входные точки SPA

Корень приложения находится в [`admin-panel/src/App.tsx`](../admin-panel/src/App.tsx). Там собираются:

- `QueryClientProvider`
- `ThemeProvider`
- `AuthProvider`
- `BrowserRouter`
- lazy-loaded страницы
- `AppLayout` как защищённая оболочка

### Карта маршрутов

| URL | Экран |
|---|---|
| `/panel/login` | Вход |
| `/panel` | Dashboard |
| `/panel/blog` | Список постов |
| `/panel/blog/new` | Создание поста |
| `/panel/blog/:id` | Редактирование поста |
| `/panel/vacancies` | Список вакансий |
| `/panel/projects` | Список проектов |
| `/panel/services` | Список услуг |
| `/panel/contacts` | Заявки |
| `/panel/users` | Пользователи |
| `/panel/roles` | Роли |
| `/panel/settings` | Настройки |
| `/panel/audit` | Аудит-лог |
| `/panel/notifications` | Уведомления |
| `/panel/documents` | Документы |
| `/panel/testimonials` | Отзывы |
| `/panel/equipment` | Техника |
| `/panel/media` | Медиа-библиотека |
| `/panel/profile` | Профиль |

`AppLayout` защищает все маршруты панели: пока сессия не восстановлена или пользователь не авторизован, SPA показывает skeleton или редиректит на `/panel/login`.

## Аутентификация

Логика auth живет в [`admin-panel/src/contexts/auth-context.tsx`](../admin-panel/src/contexts/auth-context.tsx) и [`admin-panel/src/api/auth.ts`](../admin-panel/src/api/auth.ts).

### Поведение

- при старте SPA выполняется `refresh()` и попытка восстановить сессию
- access token хранится в памяти, а refresh token приходит cookie
- при `TOKEN_EXPIRED` клиент автоматически делает refresh и повторяет запрос
- вход поддерживает 2FA; если backend отвечает `requires_2fa`, форма просит TOTP-код
- logout очищает токен и локальное состояние пользователя

### Контракт auth API

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/2fa/setup`
- `POST /auth/2fa/verify`
- `POST /auth/2fa/disable`

## API client

Базовый клиент в [`admin-panel/src/api/client.ts`](../admin-panel/src/api/client.ts):

- `baseURL` = `/api/v2/admin`
- `withCredentials: true`
- добавляет `Authorization: Bearer <token>` если token есть в памяти
- при ошибке `401 + TOKEN_EXPIRED` делает одноразовый refresh и очередит параллельные запросы
- при неуспешном refresh отправляет пользователя на `/panel/login`

Это важно для документации и поддержки, потому что SPA зависит сразу от двух механизмов:

- bearer access token для текущих запросов
- refresh cookie для восстановления сессии

## CRUD-паттерн

Типовой workflow строится вокруг списков и форм.

### Список

[`admin-panel/src/hooks/use-crud-list.ts`](../admin-panel/src/hooks/use-crud-list.ts) управляет:

- пагинацией
- поиском с debounce
- удалением записи
- инвалидцией кэша React Query
- toast-уведомлениями об успехе и ошибке

### Форма

Формы в проекте используют общий паттерн:

- React Hook Form
- Zod-схемы
- сохранение через API-модуль
- возврат к списку после успешной операции

### Таблицы и UX

В списках активно используются:

- `DataTable`
- skeleton-состояния
- confirm-dialog для удаления
- toast-уведомления
- search bar с debounce

## Основные разделы панели

- Blog: статьи, теги, SEO-поля, публикация
- Vacancies: список, форма, toggle/удаление
- Projects: карточки, галерея изображений, порядок
- Services: услуги сайта
- Documents: документы для публичной страницы
- Testimonials: отзывы
- Equipment: каталог техники
- Contacts: заявки, детализация, массовые операции
- Users/Roles: пользователи, роли, permissions
- Settings: typed site settings
- Audit: журнал действий
- Notifications: уведомления пользователя
- Drafts: автосохранение черновиков по сущности
- Media: загрузка, просмотр, поиск, удаление файлов
- Profile: текущий пользователь и 2FA

## Build and deploy

Файл [`admin-panel/vite.config.ts`](../admin-panel/vite.config.ts) задаёт:

- `base: /panel/`
- `outDir: ../app/static/panel`
- proxy `/api -> http://127.0.0.1:5001`

Практический порядок локальной проверки:

1. Запустить Flask backend на `5001`
2. Запустить `npm run dev` в `admin-panel/`
3. Проверить `/panel/login`
4. Проверить refresh flow и доступ к `/panel`
5. Собрать `npm run build` и убедиться, что `app/static/panel/index.html` существует

## Замечания по поддержке

- Документировать новые страницы лучше рядом с их route entry в `App.tsx`.
- Новые API-модули должны сразу попадать в `docs/api.md` или в соответствующий отдельный API-документ, если он появится позже.
- Если добавляется новая сущность в CRUD, обычно требуется одновременно обновить:
  - `admin-panel/src/api/*`
  - `admin-panel/src/pages/*`
  - `admin-panel/src/lib/constants.ts`
  - соответствующий backend route module

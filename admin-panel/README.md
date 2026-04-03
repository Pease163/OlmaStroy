# Admin Panel

React SPA админки проекта ОлмаСТРОЙ. Это приложение собирается в `../app/static/panel` и открывается во Flask по адресу `/panel`.

## Назначение

Панель используется для:

- управления блогом, вакансиями и проектами
- редактирования услуг, документов, отзывов и техники
- работы с заявками, уведомлениями, аудитом и черновиками
- настройки пользователей, ролей и параметров сайта
- загрузки и просмотра медиафайлов

## Стек

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- React Hook Form
- Zod
- Axios
- shadcn/ui
- TipTap
- Recharts
- Sonner

## Команды

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Среда разработки

### Dev server

- `npm run dev` запускает Vite на `http://localhost:5173`
- запросы к `/api` проксируются на `http://127.0.0.1:5001`
- авторизация и API работают через backend Flask

### Production build

- `npm run build` запускает TypeScript build и Vite bundle
- результат пишется в `../app/static/panel`
- Flask отдает SPA через catch-all маршруты `/panel/` и `/panel/<path>`

## Архитектура приложения

Ключевые точки кода:

- [`src/App.tsx`](src/App.tsx) - router tree, providers, lazy pages
- [`src/contexts/auth-context.tsx`](src/contexts/auth-context.tsx) - восстановление сессии, login/logout, 2FA
- [`src/api/client.ts`](src/api/client.ts) - axios client, bearer token, refresh flow
- [`src/lib/constants.ts`](src/lib/constants.ts) - API base, nav items, labels
- [`src/hooks/use-crud-list.ts`](src/hooks/use-crud-list.ts) - списки и удаление
- [`src/components/layout/app-layout.tsx`](src/components/layout/app-layout.tsx) - защищенная оболочка панели
- [`src/components/layout/sidebar.tsx`](src/components/layout/sidebar.tsx) - навигация и переходы между разделами

## Работа с backend

Клиент всегда использует `API_BASE = /api/v2/admin`. Важные особенности:

- access token хранится в памяти
- refresh token приходит cookie
- при `TOKEN_EXPIRED` запросы повторяются автоматически после refresh
- при неудачном refresh пользователь переходит на `/panel/login`

## Сборка и встраивание

Vite настроен на:

- `base: /panel/`
- `outDir: ../app/static/panel`
- proxy `/api -> 127.0.0.1:5001`

Это означает, что перед проверкой `/panel` нужно:

1. поднять Flask backend
2. собрать SPA
3. убедиться, что `app/static/panel/index.html` и asset-файлы созданы

## Где смотреть документацию

- Общая архитектура: [`../docs/architecture.md`](../docs/architecture.md)
- SPA-админка: [`../docs/admin-panel.md`](../docs/admin-panel.md)
- API и auth: [`../docs/api.md`](../docs/api.md)
- Деплой: [`../docs/deploy.md`](../docs/deploy.md)

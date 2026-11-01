# Lab Inventory — Routing & Architecture (Next.js)

Task 5. Учёт оборудования лаборатории (из task 4), переписанный на **Next.js App Router**:
маршруты, вложенные layout'ы, динамические URL, `useSearchParams`, `React.lazy` + `Suspense`.

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Соответствие заданию (React Router → Next.js)

В Next.js роутер встроен: **структура папок в `app/` и есть список маршрутов**, поэтому
`react-router` отдельно не ставится.

| В задании                      | Здесь                                                        |
| ------------------------------ | ------------------------------------------------------------ |
| `createBrowserRouter` / Routes | папки `app/**/page.tsx`                                      |
| `RootLayout` + `<Outlet />`    | `app/layout.tsx` — `children` это и есть Outlet              |
| вложенные маршруты             | `app/items/layout.tsx` (хлебные крошки для всех `/items/*`)  |
| `NavBar`, `NavLink`            | `components/NavBar.tsx`, `next/link` + `usePathname`         |
| `/items/:id`                   | `app/items/[id]/page.tsx` + `useParams`                      |
| `*` (404)                      | `app/not-found.tsx`, плюс `notFound()` для плохих id         |
| `useSearchParams` (RR)         | `useSearchParams` из `next/navigation` (`hooks/useItemsQuery.ts`) |

## Маршруты

| URL                | Файл                              |
| ------------------ | --------------------------------- |
| `/`                | `app/page.tsx` (Server Component) |
| `/about`           | `app/about/page.tsx` (lazy)       |
| `/items`           | `app/items/page.tsx` (lazy)       |
| `/items/:id`       | `app/items/[id]/page.tsx`         |
| `/items/new`       | `app/items/new/page.tsx`          |
| `/items/:id/edit`  | `app/items/[id]/edit/page.tsx`    |
| `/dashboard`       | `app/dashboard/page.tsx` (lazy)   |
| `/login`           | `app/login/page.tsx`              |
| любой другой       | `app/not-found.tsx`               |

`/items/new` и `/items/[id]` не конфликтуют: статический сегмент всегда приоритетнее динамического.

## Структура

```
app/            маршруты (страницы и layout'ы) — только склейка, без логики
components/     переиспользуемые компоненты (ItemCard, Pagination, NavBar, ...)
components/views/  «тело» страниц (ItemsView, DashboardView, ...) — их грузим лениво
hooks/          useAsync (loading/error/отмена запросов), useItemsQuery (URL ⇄ фильтры)
services/service.ts  ВСЕ запросы к API (getItems, getItem, createItem, ...)
lib/            типы, чистые функции (stats, status, форматирование), seed-данные
styles/         globals.css и CSS Modules
```

## Что где реализовано

- **Список** (`ItemsView`): поиск, фильтры по статусу и категории, сортировка (+ направление),
  пагинация по 6. Всё хранится в URL: `/items?status=maintenance&category=Tools&sort=value&order=desc&page=2`.
  Значения по умолчанию в URL не пишутся; невалидные значения из URL заменяются дефолтами.
  Loading (скелетоны) / error (+ Try again) / empty (+ Clear filters).
- **Детали** (`ItemDetailsView`): `useParams` → `getItem(id)`. 8 полей, кнопки *Back* и *All equipment*.
  Нечисловой id (`/items/abc`) → настоящий 404 через `notFound()`. Числовой, но несуществующий
  (`/items/999`) → сообщение «No equipment with id 999». Устаревшие запросы: `useAsync` отменяет
  предыдущий запрос через `AbortController` при смене id и игнорирует его ответ.
- **Dashboard**: 5 плиток (количество, общая и средняя стоимость, % доступных, требуют обслуживания),
  2 разреза (по статусу, по категории), фильтр по категории и статусу, который пересчитывает всё,
  ссылки на `/items?status=…`, `/items?category=…` и на конкретные позиции.
- **Прежний функционал сохранён**: create / edit / remove, check out / return / maintenance,
  симулятор сети (футер).
- **Lazy loading**: `/items`, `/dashboard`, `/about` подгружают свой код через `React.lazy` + `Suspense`.
  Важно: Next.js и так режет бандл по маршрутам; `lazy` здесь добавляет ещё и явный fallback,
  а `Suspense` на `/items` заодно нужен для `useSearchParams` при сборке.

## Данные

«API» — `services/service.ts`: Promise, случайные задержки, случайные ошибки, `AbortSignal`,
хранилище в `localStorage`. Поэтому страницы с данными — клиентские (`"use client"`):
на сервере `localStorage` нет. Данные одного браузера не видны другому.

## Деплой

Vercel: импортировать репозиторий, **Root Directory = `task5`**, остальное по умолчанию.
(GitHub Pages не подходит: `/items/[id]` с id, созданными в браузере, нельзя заранее
сгенерировать для статического экспорта.)

# Lab Inventory — Server Data, Caching & Firebase Auth (Next.js)

Task 6. Проект из task 5 (все маршруты, фильтры, пагинация, URL-состояние сохранены) + :

- **Firebase Authentication** — Email/Password и Google, сессия сохраняется после refresh;
- **кэширование серверных данных** через **TanStack Query**;
- **переменные окружения** (`.env.local`, `.env.example`).

> В задании `VITE_` — это Vite. В Next.js аналог — префикс **`NEXT_PUBLIC_`**
> (только такие переменные попадают в браузерный код). `firebase.ts` вместо `firebase.js` — проект на TypeScript.

## Настройка Firebase

1. [console.firebase.google.com](https://console.firebase.google.com) → *Add project*.
2. *Build → Authentication → Get started → Sign-in method*: включить **Email/Password** и **Google**.
3. *Project settings → General → Your apps → Web (`</>`)* → скопировать конфиг.
4. `cp .env.example .env.local` и вставить значения (`.env.local` в `.gitignore`).
5. *Authentication → Settings → Authorized domains*: добавить домен деплоя (например `xxx.vercel.app`).
   `localhost` уже разрешён.
6. При деплое на Vercel добавить те же 6 переменных в *Project → Settings → Environment Variables*.

Без `.env.local` приложение собирается и работает, а на /login показывается понятное сообщение
«Firebase is not configured».

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

---

# Task 6: что добавлено

## Авторизация

| Что                       | Где                                                                       |
| ------------------------- | ------------------------------------------------------------------------- |
| Инициализация Firebase    | `lib/firebase.ts` (ленивая — сборка не падает без ключей)                 |
| Все вызовы Firebase Auth  | `services/authService.ts` (signUp, logIn, logInWithGoogle, logOut, ошибки)|
| `AuthProvider`, `useAuth` | `context/AuthContext.tsx` — `user`, `loading`, `error`, действия          |
| Защита маршрутов          | `components/ProtectedRoute.tsx`                                           |
| Страницы                  | `/login`, `/signup` (валидация + confirm), `/profile` (email, UID, logout)|
| NavBar                    | Login / Signup ↔ Profile / Logout                                         |

- `onAuthStateChanged` — единственный источник правды. Он срабатывает при старте (восстанавливает
  сохранённую сессию → **сессия переживает refresh**, явно выставлен `browserLocalPersistence`) и при каждом login/logout.
- `loading = true`, пока Firebase не ответил. Пока идёт проверка, `ProtectedRoute` показывает
  «Checking your session…» и **не** редиректит — иначе refresh на `/profile` выкидывал бы на `/login`.
- Защищены: `/profile`, `/items/new`, `/items/:id/edit` (редирект на `/login?next=…`, после входа возвращает назад).
  Просмотр списка, карточек и дашборда остаётся публичным. Залогиненного с `/login` и `/signup` отправляет дальше.
- Ошибки Firebase (`auth/invalid-credential` и др.) переводятся в понятные сообщения.

## Стратегия кэширования

Для всех данных об оборудовании используется **TanStack Query** (`hooks/useItemsApi.ts`,
настройки — `lib/queryClient.ts`). Компоненты не вызывают API напрямую — только хуки.

**Ключи кэша** (`itemKeys`):

| Ресурс                | Ключ                           |
| --------------------- | ------------------------------ |
| страница списка       | `["items","list", {search,status,category,sort,order,page,pageSize}]` |
| все (для дашборда)    | `["items","everything"]`       |
| одна карточка         | `["items","detail", id]`       |

Любой параметр запроса входит в ключ, поэтому «страница 2» и «страница 3» — разные записи и не перетирают друг друга.

**Срок жизни:**

- `staleTime = 30 с` — 30 секунд данные «свежие»: показываются из кэша **без запроса**
  (вернулись на ту же страницу фильтров — мгновенно).
- После 30 с данные «устарели»: показываются сразу из кэша, но **в фоне перезапрашиваются** (stale-while-revalidate).
  Это же происходит при возврате фокуса на вкладку.
- `gcTime = 5 мин` — запись, которую никто не использует, удаляется из памяти.
- Кэш живёт в памяти вкладки; `localStorage` из компонентов не используется
  (он остаётся только внутри `services/service.ts` как «база данных» фейкового API).

**Когда кэш инвалидируется** (мутации в `useItemsApi.ts`):

| Операция                                | Что происходит                                                             |
| --------------------------------------- | -------------------------------------------------------------------------- |
| создание (`useCreateItem`)              | инвалидируются все списки и `everything`; новая карточка кладётся в кэш    |
| изменение / смена статуса (`useUpdateItem`) | карточка обновляется через `setQueryData`; списки и `everything` инвалидируются |
| удаление (`useDeleteItem`)              | карточка удаляется из кэша; списки и `everything` инвалидируются           |
| кнопки «Refresh» / «Try again»          | ручной `refetch()`                                                         |

Инвалидированные запросы, которые сейчас на экране, перезапрашиваются сразу, остальные — при следующем показе.

**Устаревшие запросы не перетирают новые:** ключ запроса меняется вместе с фильтрами, а `queryFn`
получает `signal` — TanStack Query отменяет (`AbortController`) запрос, если ключ сменился или компонент ушёл.
Фейковый API учитывает `signal` (`services/service.ts`). Ответ записывается только в запись со своим ключом.

**Состояния:** loading (скелетоны; при переходе между страницами остаётся предыдущая страница
благодаря `keepPreviousData`), error (сообщение + «Try again»), empty («Nothing matches…» / «No equipment yet»).

## Структура (новое)

```
context/AuthContext.tsx     AuthProvider + useAuth
services/authService.ts     Firebase Auth (единственное место, где импортируется firebase/auth)
lib/firebase.ts             инициализация Firebase из NEXT_PUBLIC_* переменных
lib/queryClient.ts          QueryClient, staleTime / gcTime
hooks/useItemsApi.ts        ключи кэша, useItemsList / useItem / useAllItems, мутации с инвалидацией
hooks/useRedirectIfAuthed.ts редирект с /login и /signup после входа (?next= только same-site)
components/Providers.tsx    QueryClientProvider + AuthProvider
components/ProtectedRoute.tsx
components/views/{Login,Signup,Profile}View.tsx
.env.example                шаблон переменных (сам .env.local в git не попадает)
```

`hooks/useAsync.ts` из task 5 удалён — его заменил TanStack Query.

## Деплой

```bash
npx vercel          # затем добавить NEXT_PUBLIC_FIREBASE_* в настройках проекта и redeploy
```

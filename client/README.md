# Клиент

Канбан-доска на Vite, React, TypeScript и MUI.

Пока `VITE_USE_MOCK` не равен `false`, задачи хранятся в `localStorage`. Запросы к `/api` проксируются на `http://localhost:3000`.

## Запуск

```bash
npm install
npm run dev
```

Приложение откроется на http://localhost:5173.

Чтобы ходить в API, создайте `.env.local` со строкой `VITE_USE_MOCK=false` и перезапустите Vite.

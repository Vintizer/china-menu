# Локальный запуск и отладка (HTTPS для Telegram)

Telegram открывает Mini App только по **HTTPS**. Локально два варианта: туннель (ngrok/cloudflared) или только фронт в браузере без Telegram.

---

## Вариант 1: Только фронт (без бота из Telegram)

Удобно дебажить верстку и логику корзины/чекаута.

```powershell
# .env с VITE_BOT_TOKEN и VITE_ADMIN_CHAT_ID (для отправки заказа через fetch)
npm run dev
```

Открываешь http://localhost:5173 — заказы пойдут в Telegram через `sendMessage` (токен из `.env`). Кнопка «Открыть меню» в самом Telegram по-прежнему ведёт на прод (Vercel), потому что URL задаётся в боте на Vercel.

---

## Вариант 2: Mini App из Telegram на локальной сборке (HTTPS туннель)

Чтобы по кнопке в Telegram открывалось твоё локальное приложение, нужен **публичный HTTPS-URL** на твой `localhost`.

### Шаг 1: Туннель на Vite

**ngrok** (нужна бесплатная регистрация на ngrok.com):

```powershell
# Установка: winget install ngrok или скачать с ngrok.com
npm run dev
# В другом терминале:
ngrok http 5173
```

В выводе будет что-то вроде `https://abc123.ngrok-free.app` — это твой HTTPS-URL.

**cloudflared** (без регистрации):

```powershell
# Установка: winget install cloudflare.cloudflared
npm run dev
# В другом терминале:
cloudflared tunnel --url http://localhost:5173
```

Будет выдан URL вида `https://xxx-xxx.trycloudflare.com`.

### Шаг 2: Указать этот URL боту

Кнопка «🍜 Открыть меню» в Telegram берёт URL из переменной **WEBAPP_URL** в боте.

- **Если бот крутится на Vercel:**  
  В Vercel → Project → Settings → Environment Variables добавь/измени:
  - `WEBAPP_URL` = `https://твой-ngrok-или-cloudflare-url` (с `/` в конце)
  Задеплой заново (или подожди автодеплой). После этого по кнопке в Telegram откроется твой локальный dev через туннель.

- **Если будешь запускать бота локально** (см. Вариант 3): задаёшь `WEBAPP_URL` в `.env` и перезапускаешь скрипт.

Важно: пока туннель запущен и `WEBAPP_URL` указывает на него — из Telegram откроется именно локальный Vite. Для прода после отладки верни `WEBAPP_URL` на `https://china-menu.vercel.app/`.

---

## Вариант 3: Локальный бот (без webhook, без своего HTTPS для бота)

Для бота Telegram не обязательно использовать webhook. Можно включить **long polling**: бот сам опрашивает Telegram, тогда HTTPS для приёма запросов боту не нужен.

1. Установи зависимость и создай `.env`:

```powershell
npm install telegraf
```

В `.env` должны быть:
- `VITE_BOT_TOKEN` — токен бота
- `VITE_ADMIN_CHAT_ID` — куда слать заказы
- `WEBAPP_URL` — URL Mini App (для локальной отладки сюда подставь ngrok/cloudflared из Варианта 2)

2. Запуск локального бота (скрипт ниже):

```powershell
node scripts/bot-local.js
```

В `scripts/bot-local.js` бот запускается с `bot.launch()` (polling). Webhook не ставится, поэтому HTTPS для бота не нужен. Кнопка «Открыть меню» будет вести на `WEBAPP_URL` из `.env` (например твой ngrok).

Итого для полной локальной отладки «как в проде»:
- Терминал 1: `npm run dev`
- Терминал 2: `ngrok http 5173` (или cloudflared)
- Терминал 3: `node scripts/bot-local.js` с `WEBAPP_URL=https://xxx.ngrok-free.app/` в `.env`

---

## Кратко

| Цель | Действия |
|------|----------|
| Дебажить только фронт | `npm run dev`, открыть localhost:5173 |
| Открывать Mini App из Telegram локально | Туннель (ngrok/cloudflared) на 5173 → подставить URL в WEBAPP_URL (Vercel или локальный бот) |
| Дебажить бота локально | Запустить бота через `bot-local.js` с polling, WEBAPP_URL = твой туннель |

HTTPS нужен **только** для URL, который открывает Telegram (Mini App). Для приёма апдейтов ботом при локальном запуске достаточно polling — тогда свой HTTPS боту не нужен.

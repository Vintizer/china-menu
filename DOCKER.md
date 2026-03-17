# Деплой на свой сервер (Docker)

## Быстрый старт

```bash
# 1. Создай .env
cp .env.docker.example .env
# Заполни VITE_BOT_TOKEN, VITE_ADMIN_CHAT_ID, WEBAPP_URL

# 2. Собери и запусти
docker compose up -d --build

# 3. Загрузи меню в БД (один раз после первого запуска)
docker compose exec app npm run seed

# 4. Настрой webhook бота (замени на свой домен бота с HTTPS)
# curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://bot.твой-домен.com/webhook"
# Либо задай BOT_WEBHOOK_DOMAIN в .env — бот сам зарегистрирует webhook при старте
```

Приложение будет на `http://localhost:3000` (или на твоём домене, если настроишь Caddy/nginx).

---

## HTTPS (обязательно для Telegram)

Telegram требует HTTPS для Mini App и webhook. Варианты:

### Вариант A: Caddy (встроен в compose)

1. Раскомментируй сервис `caddy` в `docker-compose.yml`
2. В `Caddyfile` замени `example.com` на свой домен
3. Убедись, что домен указывает на IP сервера, порты 80 и 443 открыты
4. В `.env` задай `WEBAPP_URL=https://твой-домен.com/`
5. `docker compose up -d --build`
6. Webhook: задай `BOT_WEBHOOK_DOMAIN=https://bot.твой-домен.com` в .env (бот сам вызовет setWebhook)

### Вариант B: Свой nginx / Cloudflare Tunnel

Поставь приложение на порт 3000, настрой nginx (или другой прокси) с SSL перед ним. В `WEBAPP_URL` укажи итоговый HTTPS-URL.

---

## Структура

| Сервис   | Описание                          |
|----------|-----------------------------------|
| postgres | БД для меню (categories, dishes)  |
| app      | Node + Express: статика, /api/menu |
| telegram-bot | NestJS: webhook для Telegram (порт 3001) |
| caddy    | (опционально) Reverse proxy + Let's Encrypt |

---

## Полезные команды

```bash
# Логи
docker compose logs -f app

# Перезапуск после изменений
docker compose up -d --build

# Повторный seed (перезапишет меню из menu.json)
docker compose exec app npm run seed
```

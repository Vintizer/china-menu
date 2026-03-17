# Telegram-бот (NestJS + TypeScript)

Отдельный сервис для обработки заказов из Mini App.

## Запуск

### Локально

```bash
cd services/telegram-bot
cp .env.example .env
# Заполни BOT_TOKEN, ADMIN_CHAT_ID
npm install
npm run start:dev
```

Для webhook нужен публичный URL (ngrok, cloudflare tunnel и т.п.):

```bash
BOT_TOKEN=... ADMIN_CHAT_ID=... WEBHOOK_DOMAIN=https://xxx.ngrok.io npm run start:dev
```

### Docker

```bash
# Из корня проекта
docker compose up -d telegram-bot
```

Убедись, что `BOT_WEBHOOK_DOMAIN` в `.env` указывает на публичный URL бота (например `https://bot.example.com`).

## Эндпоинты

- `POST /webhook` — принимает обновления от Telegram

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| BOT_TOKEN | Токен от @BotFather |
| ADMIN_CHAT_ID | ID чата администратора |
| WEBAPP_URL | URL Mini App (кнопка «Открыть меню») |
| WEBHOOK_DOMAIN | Публичный URL бота для регистрации webhook |
| PORT | Порт (по умолчанию 3001) |

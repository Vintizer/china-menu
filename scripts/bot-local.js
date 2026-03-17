/**
 * Локальный запуск бота в режиме long polling.
 * HTTPS для бота не нужен — апдейты бот забирает сам.
 * WEBAPP_URL в .env — URL Mini App (для локальной отладки подставь ngrok/cloudflared).
 */
import "dotenv/config";
import { bot } from "../api/bot.js";

const token = process.env.VITE_BOT_TOKEN;
if (!token) {
  console.error("VITE_BOT_TOKEN не задан в .env");
  process.exit(1);
}

async function main() {
  await bot.telegram.deleteWebhook({ drop_pending_updates: true });
  await bot.launch();
  console.log("Бот запущен (polling). WEBAPP_URL:", process.env.WEBAPP_URL || "https://china-menu.vercel.app/");
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

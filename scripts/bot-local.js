/**
 * Локальный запуск бота (NestJS).
 * Для webhook нужен публичный URL — задай WEBHOOK_DOMAIN (ngrok/cloudflared).
 * Без WEBHOOK_DOMAIN webhook не зарегистрируется.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const botDir = path.join(__dirname, "../services/telegram-bot");

const child = spawn("npm", ["run", "start:dev"], {
  cwd: botDir,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    BOT_TOKEN: process.env.VITE_BOT_TOKEN,
    ADMIN_CHAT_ID: process.env.VITE_ADMIN_CHAT_ID,
  },
});

child.on("exit", (code) => process.exit(code ?? 0));

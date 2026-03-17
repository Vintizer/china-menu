/**
 * Express-сервер для self-hosted деплоя.
 * Раздаёт статику (dist/), /api/menu (из БД).
 * Webhook бота — отдельный сервис telegram-bot (порт 3001).
 */
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import menuHandler from "../api/menu.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../dist");
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: "1mb" }));

// API routes
app.get("/api/menu", async (req, res) => {
  try {
    await menuHandler(req, res);
  } catch (err) {
    console.error("[server] /api/menu error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Static files + SPA fallback
app.use(express.static(distPath, {
  maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
  etag: true,
}));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

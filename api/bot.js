import { Telegraf } from "telegraf";
import { formatOrderMessage } from "../shared/orderMessage.js";

const bot = new Telegraf(process.env.VITE_BOT_TOKEN);

const WEBAPP_URL = process.env.WEBAPP_URL || "https://china-menu.vercel.app/";

function parseOrderCallback(data) {
    // ord:(ok|cancel):<orderId>:<userId>
    if (typeof data !== "string") return null;
    const parts = data.split(":");
    if (parts.length !== 4) return null;
    const [prefix, action, orderId, userIdRaw] = parts;
    if (prefix !== "ord") return null;
    if (action !== "ok" && action !== "cancel") return null;
    const userId = Number(userIdRaw);
    if (!Number.isFinite(userId)) return null;
    if (!orderId || orderId.length > 32) return null;
    return { action, orderId, userId };
}

bot.start(async (ctx) => {
    await ctx.reply("Открыть меню:", {
        reply_markup: {
            keyboard: [[{ text: "🍜 Открыть меню", web_app: { url: WEBAPP_URL } }]],
            resize_keyboard: true,
        },
    });
});

bot.command("menu", async (ctx) => {
    await ctx.reply("Меню:", {
        reply_markup: {
            keyboard: [[{ text: "🍜 Открыть меню", web_app: { url: WEBAPP_URL } }]],
            resize_keyboard: true,
        },
    });
});

// обработка данных из Mini App
bot.on("message", async (ctx) => {
    const webAppData = ctx.message?.web_app_data;
    if (webAppData?.data) {
        const adminId = process.env.VITE_ADMIN_CHAT_ID;
        const payload = String(webAppData.data ?? "");

        // Сейчас Mini App шлёт уже готовый HTML-текст.
        // На всякий случай поддержим и JSON-формат (если вернёмся к нему позже).
        let text = payload;
        try {
            const order = JSON.parse(payload);
            if (order && typeof order === "object") {
                const form = {
                    name: order.name,
                    phone: order.phone,
                    address: order.address,
                    comment: order.comment ?? "",
                    payment: order.payment ?? "cash",
                };
                const items = (order.items || []).map((i) => ({
                    name_ru: i.name_ru,
                    quantity: i.qty ?? i.quantity,
                    price: i.price,
                    code: i.code,
                }));
                text = formatOrderMessage(form, items);
            }
        } catch (_) {
            // не JSON — ок, отправляем как есть
        }

        await ctx.telegram.sendMessage(adminId, text, { parse_mode: "HTML" });
    }
});

bot.on("callback_query", async (ctx) => {
    const cb = ctx.callbackQuery;
    const adminChatId = String(process.env.VITE_ADMIN_CHAT_ID || "").trim();
    const msgChatId = cb?.message?.chat?.id != null ? String(cb.message.chat.id) : "";

    const parsed = parseOrderCallback(cb?.data);
    if (!parsed) {
        await ctx.answerCbQuery("Неизвестная кнопка", { show_alert: false }).catch(() => {});
        return;
    }

    if (!adminChatId || msgChatId !== adminChatId) {
        await ctx.answerCbQuery("Недостаточно прав", { show_alert: true }).catch(() => {});
        return;
    }

    const { action, orderId, userId } = parsed;
    const statusText = action === "ok" ? "✅ Заказ принят" : "❌ Заказ отменён";
    const userText = action === "ok"
        ? `✅ Ваш заказ ${orderId} принят. Скоро свяжемся с вами.`
        : `❌ Ваш заказ ${orderId} отменён. Если это ошибка — напишите администратору.`;

    // Сразу снимаем "ожидание" с кнопки — иначе Telegram крутит бесконечно
    await ctx.answerCbQuery(statusText, { show_alert: false }).catch(() => {});

    const chatId = cb.message.chat.id;
    const messageId = cb.message.message_id;
    const original = cb.message?.text || cb.message?.caption || "";
    const updated = `${original}\n\n<b>${statusText}</b>`;

    ctx.telegram
        .editMessageText(chatId, messageId, undefined, updated, {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: [] },
            disable_web_page_preview: true,
        })
        .catch((e) => console.error("[bot] edit admin message failed", e));

    ctx.telegram.sendMessage(userId, userText).catch((e) => console.error("[bot] notify user failed", e));
});

export default async function handler(req, res) {
    try {
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error("[bot] body is string but not JSON", e);
                return res.status(400).send("bad body");
            }
        }
        await bot.handleUpdate(body);
        res.status(200).send("ok");
    } catch (err) {
        console.error("[bot] handler error", err);
        res.status(500).send("error");
    }
}

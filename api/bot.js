import { Telegraf } from "telegraf";
import { formatOrderMessage } from "../shared/orderMessage.js";

const bot = new Telegraf(process.env.VITE_BOT_TOKEN);

// обработка данных из Mini App
bot.on("message", async (ctx) => {
    const webAppData = ctx.message?.web_app_data;
    if (webAppData?.data) {
        const adminId = process.env.VITE_ADMIN_CHAT_ID;
        const payload = String(webAppData.data ?? "");

        console.log("[bot] web_app_data received", {
            fromId: ctx.from?.id,
            username: ctx.from?.username,
            payloadLen: payload.length,
        });

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
        const msg = body?.message ?? {};
        console.log("[bot] update", {
            update_id: body?.update_id,
            message_keys: msg ? Object.keys(msg) : [],
            has_web_app_data: !!msg?.web_app_data,
        });
        await bot.handleUpdate(body);
        res.status(200).send("ok");
    } catch (err) {
        console.error("[bot] handler error", err);
        res.status(500).send("error");
    }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { formatOrderMessage } from '../utils/order-message.util';

export interface OrderCallbackParsed {
  action: 'ok' | 'cancel';
  orderId: string;
  userId: number;
}

function parseOrderCallback(data: unknown): OrderCallbackParsed | null {
  if (typeof data !== 'string') return null;
  const parts = data.split(':');
  if (parts.length !== 4) return null;
  const [prefix, action, orderId, userIdRaw] = parts;
  if (prefix !== 'ord') return null;
  if (action !== 'ok' && action !== 'cancel') return null;
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) return null;
  if (!orderId || orderId.length > 32) return null;
  return { action, orderId, userId };
}

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;
  private readonly webappUrl: string;
  private readonly adminChatId: string;

  constructor() {
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error('BOT_TOKEN is required');
    this.bot = new Telegraf(token);
    this.webappUrl = process.env.WEBAPP_URL || 'https://china-menu.vercel.app/';
    this.adminChatId = (process.env.ADMIN_CHAT_ID || '').trim();
  }

  onModuleInit() {
    this.setupHandlers();
  }

  private setupHandlers() {
    this.bot.start(async (ctx) => {
      await ctx.reply('Открыть меню:', {
        reply_markup: {
          keyboard: [[{ text: '🍜 Открыть меню', web_app: { url: this.webappUrl } }]],
          resize_keyboard: true,
        },
      });
    });

    this.bot.command('menu', async (ctx) => {
      await ctx.reply('Меню:', {
        reply_markup: {
          keyboard: [[{ text: '🍜 Открыть меню', web_app: { url: this.webappUrl } }]],
          resize_keyboard: true,
        },
      });
    });

    this.bot.on('message', async (ctx) => {
      const webAppData = ctx.message && 'web_app_data' in ctx.message ? ctx.message.web_app_data : undefined;
      if (webAppData?.data) {
        const payload = String(webAppData.data ?? '');

        let text = payload;
        try {
          const order = JSON.parse(payload);
          if (order && typeof order === 'object') {
            const form = {
              name: order.name,
              phone: order.phone,
              address: order.address,
              comment: order.comment ?? '',
              payment: order.payment ?? 'cash',
              orderId: order.orderId,
            };
            const items = (order.items || []).map((i: { name_ru: string; qty?: number; quantity?: number; price: number; code?: string }) => ({
              name_ru: i.name_ru,
              quantity: i.qty ?? i.quantity ?? 0,
              price: i.price,
              code: i.code,
            }));
            text = formatOrderMessage(form, items);
          }
        } catch {
          // не JSON — отправляем как есть
        }

        await ctx.telegram.sendMessage(this.adminChatId, text, { parse_mode: 'HTML' });
      }
    });

    this.bot.on('callback_query', async (ctx) => {
      const cb = ctx.callbackQuery;
      const msgChatId = cb?.message && 'chat' in cb.message ? String(cb.message.chat.id) : '';
      const data = 'data' in cb ? cb.data : undefined;

      const parsed = parseOrderCallback(data);
      if (!parsed) {
        await ctx.answerCbQuery('Неизвестная кнопка', { show_alert: false }).catch(() => {});
        return;
      }

      if (!this.adminChatId || msgChatId !== this.adminChatId) {
        await ctx.answerCbQuery('Недостаточно прав', { show_alert: true }).catch(() => {});
        return;
      }

      const { action, orderId, userId } = parsed;
      const statusText = action === 'ok' ? '✅ Заказ принят' : '❌ Заказ отменён';
      const userText =
        action === 'ok'
          ? `✅ Ваш заказ ${orderId} принят. Скоро свяжемся с вами.`
          : `❌ Ваш заказ ${orderId} отменён. Если это ошибка — напишите администратору.`;

      await ctx.answerCbQuery(statusText, { show_alert: false }).catch(() => {});

      const chatId = cb.message && 'chat' in cb.message ? cb.message.chat.id : 0;
      const messageId = cb.message && 'message_id' in cb.message ? cb.message.message_id : 0;
      const original = cb.message && ('text' in cb.message || 'caption' in cb.message)
        ? ((cb.message as { text?: string; caption?: string }).text ?? (cb.message as { caption?: string }).caption ?? '')
        : '';
      const updated = `${original}\n\n<b>${statusText}</b>`;

      ctx.telegram
        .editMessageText(chatId, messageId, undefined, updated, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [] },
        })
        .catch((e) => console.error('[bot] edit admin message failed', e));

      ctx.telegram.sendMessage(userId, userText).catch((e) => console.error('[bot] notify user failed', e));
    });
  }

  handleUpdate(update: object): Promise<void> {
    return this.bot.handleUpdate(update as any);
  }

  getWebhookCallback() {
    return this.bot.webhookCallback('/webhook');
  }

  async setWebhook(url: string): Promise<void> {
    await this.bot.telegram.setWebhook(url);
  }
}

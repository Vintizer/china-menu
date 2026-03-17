export interface OrderForm {
  name: string;
  phone: string;
  address: string;
  comment?: string;
  payment?: string;
  orderId?: string;
  source?: 'website' | 'bot';
}

export interface OrderItem {
  name_ru: string;
  quantity: number;
  price: number;
  code?: string;
}

export function formatOrderMessage(form: OrderForm, items: OrderItem[]): string {
  const { name, phone, address, comment, payment = 'cash', orderId, source } = form;
  const sourceLabel = source === 'bot' ? '🤖 Бот' : source === 'website' ? '📱 Сайт' : null;
  const lines = items.map(
    (i) =>
      `• ${(i.code ?? '').trim() ? i.code + ' ' : ''}${i.name_ru} × ${i.quantity} = ${i.price * i.quantity} р`,
  );
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return [
    '🍜 <b>Новый заказ</b>',
    orderId ? `<code>${orderId}</code>` : null,
    sourceLabel ? `📍 Откуда: ${sourceLabel}` : null,
    '',
    `👤 Имя: ${name}`,
    `📞 Телефон: ${phone}`,
    `📍 Адрес: ${address}`,
    comment ? `💬 Комментарий: ${comment}` : null,
    `💳 Оплата: ${payment === 'cash' ? 'Наличные' : 'Картой'}`,
    '',
    '<b>Блюда:</b>',
    ...lines,
    '',
    `<b>Итого: ${total} р</b>`,
  ]
    .filter((l): l is string => l !== null)
    .join('\n');
}

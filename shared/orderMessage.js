/**
 * Единый формат текста заказа для Telegram (HTML).
 * Используется и в Checkout (клиент), и в api/bot.js (сервер).
 *
 * @param {{ name: string, phone: string, address: string, comment?: string, payment?: string }} form
 * @param {{ name_ru: string, quantity: number, price: number, code?: string }[]} items
 */
export function formatOrderMessage(form, items) {
  const { name, phone, address, comment, payment = 'cash' } = form
  const lines = items.map(
    (i) =>
      `• ${(i.code ?? '').trim() ? i.code + ' ' : ''}${i.name_ru} × ${i.quantity} = ${i.price * i.quantity} р`
  )
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  return [
    '🍜 <b>Новый заказ</b>',
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
    .filter((l) => l !== null)
    .join('\n')
}

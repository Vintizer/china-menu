/**
 * Единый формат текста заказа для Telegram (HTML).
 * Используется в Checkout (клиент) и в services/telegram-bot (сервер).
 *
 * @param {{ name, phone, address?, comment?, payment?, orderId?, source?, deliveryType?, timePreference?, scheduledTime? }} form
 * @param {{ name_ru: string, quantity: number, price: number, code?: string }[]} items
 */
export function formatOrderMessage(form, items) {
  const {
    name,
    phone,
    address,
    comment,
    payment = 'cash',
    orderId,
    source,
    deliveryType = 'delivery',
    timePreference = 'asap',
    scheduledTime,
  } = form
  const sourceLabel = source === 'bot' ? '🤖 Бот' : source === 'website' ? '📱 Сайт' : null
  const isPickup = deliveryType === 'pickup'
  const deliveryLabel = isPickup ? '🏪 Самовывоз' : '🚚 Доставка'
  const timeLabel =
    timePreference === 'scheduled' && scheduledTime
      ? `🕐 Ко времени: ${scheduledTime}`
      : '⚡ Как можно скорее'

  const lines = items.map(
    (i) =>
      `• ${(i.code ?? '').trim() ? i.code + ' ' : ''}${i.name_ru} × ${i.quantity} = ${i.price * i.quantity} р`
  )
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  return [
    '🍜 <b>Новый заказ</b>',
    orderId ? `<code>${orderId}</code>` : null,
    sourceLabel ? `📍 Откуда: ${sourceLabel}` : null,
    '',
    deliveryLabel,
    timeLabel,
    '',
    `👤 Имя: ${name}`,
    `📞 Телефон: ${phone}`,
    !isPickup && address ? `📍 Адрес: ${address}` : null,
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

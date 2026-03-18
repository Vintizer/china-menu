import { isValid, parse } from '@telegram-apps/init-data-node'

/**
 * Проверяет подпись Telegram WebApp initData.
 * @param {string} initData - строка initData из window.Telegram.WebApp.initData
 * @param {string} botToken - токен бота
 * @returns {{ valid: boolean, user?: object }}
 */
export function verifyTelegramWebAppData(initData, botToken) {
  if (!initData?.trim() || !botToken?.trim()) {
    return { valid: false }
  }

  try {
    const token = botToken.trim()
    if (!isValid(initData, token, { expiresIn: 86400 * 7 })) {
      console.log('[admin] isValid returned false')
      return { valid: false }
    }
    const parsed = parse(initData)
    return { valid: true, user: parsed.user ?? null }
  } catch (e) {
    console.log('[admin] verify error:', e?.message ?? e)
    return { valid: false }
  }
}

export function isAdmin(telegramUserId) {
  const ids = process.env.ADMIN_TELEGRAM_ID || ''
  if (!ids.trim()) return false
  const list = ids.split(',').map(s => s.trim()).filter(Boolean)
  return list.includes(String(telegramUserId))
}

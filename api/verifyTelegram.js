import crypto from 'crypto'

/**
 * Проверяет подпись Telegram WebApp initData.
 * @param {string} initData - строка initData из window.Telegram.WebApp.initData
 * @param {string} botToken - токен бота
 * @returns {{ valid: boolean, user?: object }}
 */
export function verifyTelegramWebAppData(initData, botToken) {
  if (!initData?.trim() || !botToken) {
    return { valid: false }
  }

  try {
    const pairs = Object.fromEntries(
      initData.split('&').map(part => {
        const eq = part.indexOf('=')
        return eq >= 0 ? [part.slice(0, eq), part.slice(eq + 1)] : [part, '']
      })
    )
    const hash = pairs.hash
    if (!hash) return { valid: false }

    delete pairs.hash
    const dataCheckString = Object.keys(pairs)
      .sort()
      .map(k => `${k}=${pairs[k]}`)
      .join('\n')

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    const hashMatch = hash.length === computedHash.length && crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
    if (!hashMatch) {
      console.log('[admin] hash mismatch:', { receivedLen: hash.length, computedLen: computedHash.length, received: hash.slice(0, 16) + '...', computed: computedHash.slice(0, 16) + '...', dataCheckLen: dataCheckString.length })
      return { valid: false }
    }

    const userStr = pairs.user
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null
    return { valid: true, user }
  } catch {
    return { valid: false }
  }
}

export function isAdmin(telegramUserId) {
  const ids = process.env.ADMIN_TELEGRAM_ID || ''
  if (!ids.trim()) return false
  const list = ids.split(',').map(s => s.trim()).filter(Boolean)
  return list.includes(String(telegramUserId))
}

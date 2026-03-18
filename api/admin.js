import { verifyTelegramWebAppData, isAdmin } from './verifyTelegram.js'
import { getPool } from './db.js'

const BOT_TOKEN = process.env.VITE_BOT_TOKEN || process.env.BOT_TOKEN

function requireAdmin(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data')

  let initData = req.headers['x-telegram-init-data'] || req.body?.initData
  if (initData && /^[A-Za-z0-9+/=]+$/.test(initData)) {
    try {
      initData = Buffer.from(initData, 'base64').toString('utf-8')
    } catch {}
  }
  console.log('[admin] requireAdmin:', { hasInitData: !!initData, initDataLen: initData?.length, startsWith: initData?.slice(0, 30) })
  if (!initData) {
    console.log('[admin] reject: no initData')
    return res.status(401).json({ error: 'Только в Telegram. Откройте приложение через бота.' })
  }

  if (!BOT_TOKEN) {
    console.log('[admin] reject: no BOT_TOKEN')
    return res.status(500).json({ error: 'BOT_TOKEN не настроен' })
  }
  console.log('[admin] BOT_TOKEN len:', BOT_TOKEN?.length)

  const { valid, user } = verifyTelegramWebAppData(initData, BOT_TOKEN)
  console.log('[admin] verify:', { valid, userId: user?.id, adminIds: process.env.ADMIN_TELEGRAM_ID })
  if (!valid || !user) {
    console.log('[admin] reject: invalid initData')
    return res.status(401).json({ error: 'Недействительные данные Telegram' })
  }

  if (!isAdmin(user.id)) {
    console.log('[admin] reject: not admin, userId=', user.id)
    return res.status(403).json({ error: 'Доступ запрещён' })
  }

  console.log('[admin] ok: user', user.id)
  return { user }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data')
    return res.status(204).end()
  }

  const path = req.path?.replace(/^\/api\/admin/, '') || req.url?.replace(/^.*\/api\/admin/, '') || ''
  const pathParts = path.split('/').filter(Boolean)

  if (pathParts[0] === 'check') {
    const auth = requireAdmin(req, res)
    if (auth?.user) return res.json({ ok: true, user: auth.user })
    return
  }

  if (pathParts[0] === 'dishes') {
    const auth = requireAdmin(req, res)
    if (!auth?.user) return

    const pool = getPool()
    const client = await pool.connect()

    try {
      if (req.method === 'GET') {
        const { rows: categories } = await client.query('SELECT * FROM categories ORDER BY sort_order')
        const { rows: dishes } = await client.query('SELECT * FROM dishes ORDER BY category_id, sort_order')
        return res.json({
          categories,
          dishes: dishes.map(d => ({
            code: d.code,
            category_id: d.category_id,
            name_cn: d.name_cn,
            name_ru: d.name_ru,
            weight: d.weight,
            price: Number(d.price),
            image: d.image,
            is_best_seller: d.is_best_seller,
            sort_order: d.sort_order,
          })),
        })
      }

      if (req.method === 'POST') {
        const { code, category_id, name_cn, name_ru, weight, price, image, is_best_seller } = req.body || {}
        if (!code || !category_id || !name_cn || !name_ru || price == null) {
          return res.status(400).json({ error: 'Не указаны обязательные поля: code, category_id, name_cn, name_ru, price' })
        }
        const { rows } = await client.query(
          `SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM dishes WHERE category_id = $1`,
          [category_id]
        )
        const sort_order = rows[0]?.next_order ?? 0
        await client.query(
          `INSERT INTO dishes (code, category_id, name_cn, name_ru, weight, price, image, is_best_seller, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [code, category_id, name_cn, name_ru, weight || null, Number(price), image || null, !!is_best_seller, sort_order]
        )
        return res.status(201).json({ ok: true })
      }

      if (req.method === 'PUT' && pathParts[1]) {
        const code = pathParts[1]
        const { category_id, name_cn, name_ru, weight, price, image, is_best_seller } = req.body || {}
        const updates = []
        const values = []
        let i = 1
        if (category_id !== undefined) { updates.push(`category_id = $${i++}`); values.push(category_id) }
        if (name_cn !== undefined) { updates.push(`name_cn = $${i++}`); values.push(name_cn) }
        if (name_ru !== undefined) { updates.push(`name_ru = $${i++}`); values.push(name_ru) }
        if (weight !== undefined) { updates.push(`weight = $${i++}`); values.push(weight) }
        if (price !== undefined) { updates.push(`price = $${i++}`); values.push(Number(price)) }
        if (image !== undefined) { updates.push(`image = $${i++}`); values.push(image) }
        if (is_best_seller !== undefined) { updates.push(`is_best_seller = $${i++}`); values.push(!!is_best_seller) }
        if (updates.length === 0) {
          return res.status(400).json({ error: 'Нет полей для обновления' })
        }
        values.push(code)
        await client.query(
          `UPDATE dishes SET ${updates.join(', ')} WHERE code = $${i}`,
          values
        )
        return res.json({ ok: true })
      }

      if (req.method === 'DELETE' && pathParts[1]) {
        const code = pathParts[1]
        await client.query('DELETE FROM dishes WHERE code = $1', [code])
        return res.json({ ok: true })
      }

      return res.status(405).json({ error: 'Method not allowed' })
    } catch (e) {
      console.error('Admin API error:', e)
      return res.status(500).json({ error: 'Database error', message: e.message })
    } finally {
      client.release()
    }
  }

  return res.status(404).json({ error: 'Not found' })
}

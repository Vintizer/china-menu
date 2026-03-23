import { verifyTelegramWebAppData, isAdmin } from './verifyTelegram.js'
import { getPool } from './db.js'

const BOT_TOKEN = process.env.VITE_BOT_TOKEN || process.env.BOT_TOKEN

function requireAdmin(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data')

  const initData = req.headers['x-telegram-init-data'] || req.body?.initData
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

  if (pathParts[0] === 'promotions') {
    const auth = requireAdmin(req, res)
    if (!auth?.user) return

    const pool = getPool()
    const client = await pool.connect()

    const parseDishCodes = (raw) => {
      if (Array.isArray(raw)) return raw.map(String).map(s => s.trim()).filter(Boolean)
      if (typeof raw === 'string') {
        return raw.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean)
      }
      return []
    }

    const toYmd = (d) => {
      if (!d) return null
      if (typeof d === 'string') return d.slice(0, 10)
      if (d instanceof Date) return d.toISOString().slice(0, 10)
      return String(d).slice(0, 10)
    }

    const mapRow = (r) => ({
      id: r.id,
      title_ru: r.title_ru,
      title_cn: r.title_cn,
      description_ru: r.description_ru,
      description_cn: r.description_cn,
      terms_ru: r.terms_ru,
      terms_cn: r.terms_cn,
      image: r.image ?? null,
      starts_on: toYmd(r.starts_on),
      ends_on: toYmd(r.ends_on),
      dish_codes: Array.isArray(r.dish_codes) ? r.dish_codes : [],
      cta_category_id: r.cta_category_id ?? null,
      cta_label_ru: r.cta_label_ru ?? null,
      cta_label_cn: r.cta_label_cn ?? null,
      sort_order: r.sort_order ?? 0,
      active: r.active !== false,
    })

    try {
      if (req.method === 'GET' && !pathParts[1]) {
        const { rows } = await client.query(
          `SELECT id, title_ru, title_cn, description_ru, description_cn, terms_ru, terms_cn,
                  image, starts_on, ends_on, dish_codes, cta_category_id, cta_label_ru, cta_label_cn, sort_order, active
           FROM promotions ORDER BY sort_order ASC, id ASC`
        )
        return res.json({ promotions: rows.map(mapRow) })
      }

      if (req.method === 'POST' && !pathParts[1]) {
        const b = req.body || {}
        const {
          title_ru,
          title_cn,
          description_ru,
          description_cn,
          terms_ru,
          terms_cn,
          image,
          starts_on,
          ends_on,
          dish_codes,
          cta_category_id,
          cta_label_ru,
          cta_label_cn,
          sort_order,
          active,
        } = b
        if (!title_ru || !description_ru || !starts_on || !ends_on) {
          return res.status(400).json({ error: 'Обязательно: title_ru, description_ru, starts_on, ends_on' })
        }
        const codes = parseDishCodes(dish_codes)
        const { rows: mx } = await client.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM promotions')
        const so = sort_order != null ? Number(sort_order) : mx[0]?.n ?? 0
        const { rows } = await client.query(
          `INSERT INTO promotions (
             title_ru, title_cn, description_ru, description_cn, terms_ru, terms_cn,
             image, starts_on, ends_on, dish_codes, cta_category_id, cta_label_ru, cta_label_cn, sort_order, active
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::date,$9::date,$10,$11,$12,$13,$14,$15)
           RETURNING *`,
          [
            title_ru,
            title_cn || null,
            description_ru,
            description_cn || null,
            terms_ru || null,
            terms_cn || null,
            image || null,
            toYmd(starts_on),
            toYmd(ends_on),
            codes,
            cta_category_id || null,
            cta_label_ru || null,
            cta_label_cn || null,
            so,
            active !== false,
          ]
        )
        return res.status(201).json({ promotion: mapRow(rows[0]) })
      }

      const promoId = pathParts[1] ? parseInt(pathParts[1], 10) : NaN
      if (!Number.isFinite(promoId)) {
        return res.status(400).json({ error: 'Некорректный id акции' })
      }

      if (req.method === 'PUT') {
        const b = req.body || {}
        const updates = []
        const values = []
        let i = 1
        const push = (col, val) => {
          updates.push(`${col} = $${i++}`)
          values.push(val)
        }
        if (b.title_ru !== undefined) push('title_ru', b.title_ru)
        if (b.title_cn !== undefined) push('title_cn', b.title_cn || null)
        if (b.description_ru !== undefined) push('description_ru', b.description_ru)
        if (b.description_cn !== undefined) push('description_cn', b.description_cn || null)
        if (b.terms_ru !== undefined) push('terms_ru', b.terms_ru || null)
        if (b.terms_cn !== undefined) push('terms_cn', b.terms_cn || null)
        if (b.image !== undefined) push('image', b.image || null)
        if (b.starts_on !== undefined) push('starts_on', toYmd(b.starts_on))
        if (b.ends_on !== undefined) push('ends_on', toYmd(b.ends_on))
        if (b.dish_codes !== undefined) push('dish_codes', parseDishCodes(b.dish_codes))
        if (b.cta_category_id !== undefined) push('cta_category_id', b.cta_category_id || null)
        if (b.cta_label_ru !== undefined) push('cta_label_ru', b.cta_label_ru || null)
        if (b.cta_label_cn !== undefined) push('cta_label_cn', b.cta_label_cn || null)
        if (b.sort_order !== undefined) push('sort_order', Number(b.sort_order))
        if (b.active !== undefined) push('active', !!b.active)
        if (updates.length === 0) {
          return res.status(400).json({ error: 'Нет полей для обновления' })
        }
        values.push(promoId)
        const { rows } = await client.query(
          `UPDATE promotions SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
          values
        )
        if (!rows[0]) return res.status(404).json({ error: 'Акция не найдена' })
        return res.json({ promotion: mapRow(rows[0]) })
      }

      if (req.method === 'DELETE') {
        const { rowCount } = await client.query('DELETE FROM promotions WHERE id = $1', [promoId])
        if (!rowCount) return res.status(404).json({ error: 'Акция не найдена' })
        return res.json({ ok: true })
      }

      return res.status(405).json({ error: 'Method not allowed' })
    } catch (e) {
      console.error('Admin promotions error:', e)
      if (e.code === '42P01') {
        return res.status(503).json({ error: 'Таблица promotions отсутствует. Запустите npm run seed.' })
      }
      return res.status(500).json({ error: 'Database error', message: e.message })
    } finally {
      client.release()
    }
  }

  return res.status(404).json({ error: 'Not found' })
}

import { getPool } from './db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const client = await getPool().connect()
  try {
    const { rows: cats } = await client.query('SELECT * FROM categories ORDER BY sort_order')
    const { rows: dishes } = await client.query('SELECT * FROM dishes ORDER BY category_id, sort_order')

    let promoRows = []
    try {
      const { rows } = await client.query(
        `SELECT id, title_ru, title_cn, description_ru, description_cn, terms_ru, terms_cn,
                image, starts_on, ends_on, dish_codes, cta_category_id, cta_label_ru, cta_label_cn, sort_order
         FROM promotions
         WHERE active = true AND starts_on <= CURRENT_DATE AND ends_on >= CURRENT_DATE
         ORDER BY sort_order ASC, id ASC`
      )
      promoRows = rows
    } catch (e) {
      if (e.code !== '42P01') console.warn('[menu] promotions table:', e.message)
    }

    const toYmd = (d) => {
      if (!d) return null
      if (typeof d === 'string') return d.slice(0, 10)
      if (d instanceof Date) return d.toISOString().slice(0, 10)
      return String(d).slice(0, 10)
    }

    const promotions = promoRows.map((r) => ({
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
    }))

    const menu = {
      restaurant: {
        name_cn: '家园中餐厅',
        name_ru: 'Кафе Цзяюань',
        contacts: { phone: '+3752967158', telegram: 'JIAYUAN6688' },
      },
      promotions,
      categories: cats.map(cat => ({
        id: cat.id,
        name_cn: cat.name_cn,
        name_ru: cat.name_ru,
        note_ru: cat.note_ru ?? null,
        note_cn: cat.note_cn ?? null,
        items: dishes
          .filter(d => d.category_id === cat.id)
          .map(d => ({
            code: d.code,
            name_cn: d.name_cn,
            name_ru: d.name_ru,
            weight: d.weight ?? null,
            price: Number(d.price),
            image: d.image ?? null,
            isBestSeller: d.is_best_seller ?? false,
          })),
      })),
    }

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
    return res.status(200).json(menu)
  } catch (e) {
    console.error('DB error:', e)
    return res.status(500).json({ error: 'Database error', message: e.message })
  } finally {
    client.release()
  }
}

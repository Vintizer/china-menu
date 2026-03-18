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

    const menu = {
      restaurant: {
        name_cn: '家园中餐厅',
        name_ru: 'Кафе Цзяюань',
        contacts: { phone: '+3752967158', telegram: 'JIAYUAN6688' },
      },
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

import { readFileSync } from 'fs'
import path from 'path'
import { getPool } from './_db.js'

const NOTE_CN = {
  G: '配菜：米饭或面条',
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Проверка секрета
  const secret = req.query.secret ?? req.body?.secret
  const expected = process.env.SEED_SECRET

  if (!expected) {
    return res.status(500).json({ error: 'SEED_SECRET не задан на сервере' })
  }
  if (!secret || secret !== expected) {
    return res.status(401).json({ error: 'Неверный secret' })
  }

  // Читаем menu.json (в Vercel файл доступен из корня проекта)
  let menu
  try {
    const filePath = path.join(process.cwd(), 'public', 'menu.json')
    menu = JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch (e) {
    return res.status(500).json({ error: 'Не удалось прочитать public/menu.json', message: e.message })
  }

  const client = await getPool().connect()
  const log = []

  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id          VARCHAR(4) PRIMARY KEY,
        name_cn     TEXT        NOT NULL,
        name_ru     TEXT        NOT NULL,
        note_ru     TEXT,
        note_cn     TEXT,
        sort_order  INTEGER     DEFAULT 0
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS dishes (
        code           VARCHAR(10) PRIMARY KEY,
        category_id    VARCHAR(4)  REFERENCES categories(id),
        name_cn        TEXT        NOT NULL,
        name_ru        TEXT        NOT NULL,
        weight         TEXT,
        price          DECIMAL(10, 2) NOT NULL,
        image          TEXT,
        is_best_seller BOOLEAN     DEFAULT false,
        sort_order     INTEGER     DEFAULT 0
      )
    `)

    await client.query('DELETE FROM dishes')
    await client.query('DELETE FROM categories')

    let totalDishes = 0

    for (let i = 0; i < menu.categories.length; i++) {
      const cat = menu.categories[i]

      await client.query(
        `INSERT INTO categories (id, name_cn, name_ru, note_ru, note_cn, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cat.id, cat.name_cn, cat.name_ru, cat.note_ru ?? null, cat.note_cn ?? NOTE_CN[cat.id] ?? null, i]
      )

      for (let j = 0; j < cat.items.length; j++) {
        const dish = cat.items[j]
        await client.query(
          `INSERT INTO dishes (code, category_id, name_cn, name_ru, weight, price, image, is_best_seller, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            dish.code, cat.id, dish.name_cn, dish.name_ru,
            dish.weight ?? null, dish.price, dish.image ?? null,
            dish.isBestSeller ?? false, j,
          ]
        )
        totalDishes++
      }

      log.push(`[${cat.id}] ${cat.name_ru} — ${cat.items.length} блюд`)
    }

    await client.query('COMMIT')

    return res.status(200).json({
      ok: true,
      categories: menu.categories.length,
      dishes: totalDishes,
      log,
    })
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('Seed error:', e)
    return res.status(500).json({ error: 'Ошибка при загрузке данных', message: e.message })
  } finally {
    client.release()
  }
}

/**
 * Seed script: переносит данные из public/menu.json в PostgreSQL
 * Запуск: npm run seed
 */
import 'dotenv/config'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import pg from 'pg'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!process.env.POSTGRES_URL) {
  console.error('❌ POSTGRES_URL не задан. Создайте .env файл по образцу .env.example')
  process.exit(1)
}

const url = process.env.POSTGRES_URL || ""
const useSsl = url.includes("sslmode=require") || url.includes("sslmode=verify")
const pool = new Pool({
  connectionString: url,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
})

const menu = JSON.parse(
  readFileSync(path.join(__dirname, '../public/menu.json'), 'utf-8')
)

// Переводы примечаний к категориям (если нет в JSON)
const NOTE_CN = {
  G: '配菜：米饭或面条',
}

async function seed() {
  const client = await pool.connect()
  console.log('🔌 Подключились к базе данных')

  try {
    await client.query('BEGIN')

    // Создаём таблицы
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id                 SERIAL PRIMARY KEY,
        title_ru           TEXT        NOT NULL,
        title_cn           TEXT,
        description_ru     TEXT        NOT NULL,
        description_cn     TEXT,
        terms_ru           TEXT,
        terms_cn           TEXT,
        image              TEXT,
        starts_on          DATE        NOT NULL,
        ends_on            DATE        NOT NULL,
        dish_codes         VARCHAR(10)[] NOT NULL DEFAULT '{}',
        cta_category_id    VARCHAR(4)  REFERENCES categories(id),
        cta_label_ru       TEXT,
        cta_label_cn       TEXT,
        sort_order         INTEGER     DEFAULT 0,
        active             BOOLEAN     DEFAULT true
      )
    `)

    // Очищаем существующие данные (акции раньше категорий — FK cta_category_id)
    await client.query('DELETE FROM promotions')
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
            dish.code,
            cat.id,
            dish.name_cn,
            dish.name_ru,
            dish.weight ?? null,
            dish.price,
            dish.image ?? null,
            dish.isBestSeller ?? false,
            j,
          ]
        )
        totalDishes++
      }

      console.log(`  ✓ [${cat.id}] ${cat.name_ru} — ${cat.items.length} блюд`)
    }

    await client.query(
      `INSERT INTO promotions (
         title_ru, title_cn, description_ru, description_cn, terms_ru, terms_cn,
         image, starts_on, ends_on, dish_codes, cta_category_id, cta_label_ru, cta_label_cn, sort_order, active
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        'Серия «Сухой горшочек» (干锅)',
        '干锅系列特惠',
        'При покупке любого блюда серии 干锅 — в подарок: 2 порции риса или 3 пары паровых булочек (мантоу).',
        '购买干锅系列菜品即送两份米饭或3个馒头！',
        'Только при заказе в зале. Один подарок на одного гостя. Подарок не выдаётся на вынос.',
        '活动仅限堂食。每人限领一份。赠品不外带。',
        'promo-dry-pot-mar2026.png',
        '2026-03-23',
        '2026-03-29',
        ['O1', 'O2', 'O3', 'O4', 'O5', 'O6'],
        'O',
        'К блюдам 干锅',
        '查看干锅',
        0,
        true,
      ]
    )
    console.log('  ✓ Акция «Сухой горшочек» (flyer 23–29.03)')

    await client.query('COMMIT')
    console.log(`\n✅ Готово! Загружено: ${menu.categories.length} категорий, ${totalDishes} блюд`)
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('❌ Ошибка при загрузке:', e.message)
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch(e => {
  console.error(e)
  process.exit(1)
})

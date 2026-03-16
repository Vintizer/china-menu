/**
 * Генерирует menu.sql из public/menu.json
 * Запуск: npm run dump
 * Полученный SQL можно выполнить в любом Postgres (Vercel Dashboard → Storage → Query)
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const menu = JSON.parse(readFileSync(path.join(__dirname, '../public/menu.json'), 'utf-8'))

const NOTE_CN = { G: '配菜：米饭或面条' }

function esc(val) {
  if (val === null || val === undefined) return 'NULL'
  return `'${String(val).replace(/'/g, "''")}'`
}

const lines = []

lines.push('-- ============================================================')
lines.push(`-- Menu dump — generated ${new Date().toISOString()}`)
lines.push('-- ============================================================')
lines.push('')

// Tables
lines.push(`CREATE TABLE IF NOT EXISTS categories (
  id          VARCHAR(4) PRIMARY KEY,
  name_cn     TEXT           NOT NULL,
  name_ru     TEXT           NOT NULL,
  note_ru     TEXT,
  note_cn     TEXT,
  sort_order  INTEGER        DEFAULT 0
);`)
lines.push('')

lines.push(`CREATE TABLE IF NOT EXISTS dishes (
  code           VARCHAR(10) PRIMARY KEY,
  category_id    VARCHAR(4)  REFERENCES categories(id),
  name_cn        TEXT           NOT NULL,
  name_ru        TEXT           NOT NULL,
  weight         TEXT,
  price          DECIMAL(10, 2) NOT NULL,
  image          TEXT,
  is_best_seller BOOLEAN        DEFAULT false,
  sort_order     INTEGER        DEFAULT 0
);`)
lines.push('')

// Truncate (порядок важен из-за FK)
lines.push('TRUNCATE TABLE dishes, categories RESTART IDENTITY CASCADE;')
lines.push('')

// Categories
lines.push('-- Categories')
for (let i = 0; i < menu.categories.length; i++) {
  const c = menu.categories[i]
  const note_cn = c.note_cn ?? NOTE_CN[c.id] ?? null
  lines.push(
    `INSERT INTO categories (id, name_cn, name_ru, note_ru, note_cn, sort_order) VALUES ` +
    `(${esc(c.id)}, ${esc(c.name_cn)}, ${esc(c.name_ru)}, ${esc(c.note_ru ?? null)}, ${esc(note_cn)}, ${i});`
  )
}
lines.push('')

// Dishes
lines.push('-- Dishes')
for (let i = 0; i < menu.categories.length; i++) {
  const c = menu.categories[i]
  lines.push(`-- [${c.id}] ${c.name_ru}`)
  for (let j = 0; j < c.items.length; j++) {
    const d = c.items[j]
    lines.push(
      `INSERT INTO dishes (code, category_id, name_cn, name_ru, weight, price, image, is_best_seller, sort_order) VALUES ` +
      `(${esc(d.code)}, ${esc(c.id)}, ${esc(d.name_cn)}, ${esc(d.name_ru)}, ${esc(d.weight ?? null)}, ${d.price}, ${esc(d.image ?? null)}, ${d.isBestSeller ? 'true' : 'false'}, ${j});`
    )
  }
  lines.push('')
}

const out = path.join(__dirname, '../menu.sql')
writeFileSync(out, lines.join('\n'), 'utf-8')
console.log(`✅ Создан menu.sql (${menu.categories.length} категорий, ${menu.categories.reduce((s, c) => s + c.items.length, 0)} блюд)`)
console.log(`   → Vercel Dashboard → Storage → [ваша БД] → Query → вставить и запустить`)

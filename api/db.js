import pg from 'pg'

const { Pool } = pg
let pool

export function getPool() {
  if (!pool) {
    const url = process.env.POSTGRES_URL || ''
    const useSsl = url.includes('sslmode=require') || url.includes('sslmode=verify')
    pool = new Pool({
      connectionString: url,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    })
  }
  return pool
}

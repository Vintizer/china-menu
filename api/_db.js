import pg from 'pg'

const { Pool } = pg
let pool

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
    })
  }
  return pool
}

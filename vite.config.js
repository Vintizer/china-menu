import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-dev-middleware',
      configureServer(server) {
        // В dev-режиме /api/menu отдаёт данные из public/menu.json
        server.middlewares.use('/api/menu', (req, res, next) => {
          if (req.method !== 'GET') return next()
          try {
            const menu = JSON.parse(
              readFileSync(path.resolve(__dirname, 'public/menu.json'), 'utf-8')
            )
            let promos = []
            try {
              const raw = readFileSync(path.resolve(__dirname, 'public/promotions.json'), 'utf-8')
              const parsed = JSON.parse(raw)
              promos = parsed.promotions || []
            } catch {
              /* нет файла — только меню */
            }
            const today = new Date().toISOString().slice(0, 10)
            const promotions = promos.filter(
              (p) =>
                p &&
                p.active !== false &&
                String(p.starts_on || '').slice(0, 10) <= today &&
                String(p.ends_on || '').slice(0, 10) >= today
            )
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ...menu, promotions }))
          } catch (e) {
            next(e)
          }
        })

        // В dev-режиме /api/seed недоступен — используй npm run seed
        server.middlewares.use('/api/seed', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 503
          res.end(JSON.stringify({
            error: 'В режиме разработки используйте: npm run seed',
          }))
        })
      },
    },
  ],
  server: {
    proxy: {
      '/api/admin': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})

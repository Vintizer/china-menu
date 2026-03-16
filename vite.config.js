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
            const data = readFileSync(
              path.resolve(__dirname, 'public/menu.json'),
              'utf-8'
            )
            res.setHeader('Content-Type', 'application/json')
            res.end(data)
          } catch (e) {
            next(e)
          }
        })
      },
    },
  ],
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

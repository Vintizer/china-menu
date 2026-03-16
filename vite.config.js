import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      // Serve images from project root /images/ folder in dev mode
      name: 'serve-images',
      configureServer(server) {
        server.middlewares.use('/images', (req, res, next) => {
          const filename = decodeURIComponent(req.url.slice(1))
          const imgPath = path.join(__dirname, 'images', filename)
          if (fs.existsSync(imgPath)) {
            const ext = path.extname(imgPath).slice(1).toLowerCase()
            const mimes = {
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
              png: 'image/png',
              webp: 'image/webp',
              gif: 'image/gif',
            }
            res.setHeader('Content-Type', mimes[ext] || 'application/octet-stream')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            fs.createReadStream(imgPath).pipe(res)
          } else {
            next()
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

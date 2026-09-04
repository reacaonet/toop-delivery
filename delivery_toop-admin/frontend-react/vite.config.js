import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_API_PROXY || 'http://admin-api:8100'

const isAsset = (url) =>
  url.startsWith('/src/') ||
  url.startsWith('/node_modules/') ||
  url.startsWith('/@react-refresh') ||
  url.startsWith('/@vite/') ||
  url.startsWith('/@id/') ||
  url.startsWith('/vite/') ||
  url.includes('.vite/') ||
  /\.(js|jsx|ts|tsx|css|map|svg|png|jpg|jpeg|gif|ico|webp|woff2?|ttf|eot|json)$/.test(url)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4202,
    host: '0.0.0.0',
    proxy: {
      '/': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        bypass: (req, res) => {
          // Navegação SPA -> serve o index.html (fallback), não faz proxy
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html'
          }
          const url = req.url || ''
          // Assets do próprio vite -> deixa o dev server servir localmente
          if (isAsset(url)) {
            return url
          }
          // Demais requisições (API) -> encaminha para o backend
          return undefined
        },
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})

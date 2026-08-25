import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_API_PROXY || 'http://localhost:8100'

const proxyRoutes = ['/auth', '/users', '/companies', '/orders', '/deliverymen', '/payments', '/notifications', '/categories', '/banners', '/upload', '/products', '/cart', '/health', '/settings', '/drivers', '/bookings', '/wallet', '/messages', '/branches', '/stock-items', '/stock-batches', '/stock-movements', '/reviews']

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4202,
    host: '0.0.0.0',
    proxy: Object.fromEntries(
      proxyRoutes.map(route => [route, {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html'
          }
        }
      }])
    )
  },
  build: {
    outDir: 'dist'
  }
})

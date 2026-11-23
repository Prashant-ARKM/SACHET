import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: '/citizen',
        name: 'SACHET · सचेत',
        short_name: 'SACHET',
        description: 'Offline scam message detector',
        theme_color: '#1F4D33',
        background_color: '#F7F1E6',
        display: 'standalone',
        start_url: '/citizen',
        scope: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,avif,json,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^\/(?:\?|$)/, /^\/citizen(?:[/?]|$)/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    // FastAPI (M2) runs on :8000. In dev, /api/* is forwarded there.
    proxy: { '/api': 'http://localhost:8000' },
  },
})

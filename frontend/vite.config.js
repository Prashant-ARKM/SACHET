import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Code used only by the officials' dashboard (its pages, charts and map libraries).
// It is built into assets/official/ and left out of the offline cache below,
// so citizens' phones never download or store it.
const OFFICIAL_ONLY = /\/src\/dashboard\/|\/node_modules\/(echarts|echarts-for-react|zrender|leaflet|react-leaflet|@react-leaflet)\//
// Citizen code never imports dashboard code, so any chunk containing it belongs to the dashboard.
const isOfficialChunk = (chunk) => chunk.moduleIds.some((id) => OFFICIAL_ONLY.test(id.replace(/\\/g, '/')))

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunk) =>
          isOfficialChunk(chunk) ? 'assets/official/[name]-[hash].js' : 'assets/[name]-[hash].js',
      },
    },
  },
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
        // Officials' dashboard is online-only: keep it out of the citizen's offline cache
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js', 'assets/official/**'],
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

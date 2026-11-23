import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // The Whisper speech worker uses ES modules
  worker: { format: 'es' },
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
        // Android "Share" menu: sharing a message or link to SACHET opens the checker with it
        share_target: {
          action: '/citizen/check',
          method: 'GET',
          params: { title: 'title', text: 'text', url: 'url' },
        },
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
        // Speech engine (ONNX Runtime) files that Transformers.js downloads on first use:
        // keep them so recorded-call transcription also works offline afterwards.
        // (The Whisper model itself is kept by Transformers.js in its own browser cache.)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/(@huggingface\/transformers|onnxruntime-web)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'speech-engine',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    // FastAPI (M2) runs on :8000. In dev, /api/* is forwarded there.
    proxy: { '/api': 'http://localhost:8000' },
  },
})

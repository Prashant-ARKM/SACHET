import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // FastAPI (M2) runs on :8000. In dev, /api/* is forwarded there.
    proxy: { '/api': 'http://localhost:8000' },
  },
})

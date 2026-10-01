import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import photoManifest from './plugins/photo-manifest.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), photoManifest()],
  test: {
    environment: 'jsdom',
  },
})

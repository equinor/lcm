import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import csp from 'vite-plugin-csp-guard'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    csp({
      dev: {
        run: false,
      },
      policy: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", 'https://cdn.eds.equinor.com/font/equinor-font.css', "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'frame-src': ["'self'"],
        'font-src': ["'self'", 'https://*.equinor.com'],
        'connect-src': ["'self'", 'https://*.microsoftonline.com', 'ws:'],
      },
      build: {
        sri: true,
      },
      override: true,
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'build',
  },
})

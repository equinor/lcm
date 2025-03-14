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
        'style-src': ["'self'", 'https://*.equinor.com', "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
        'object-src': ["'none'"],
        'font-src': ["'self'", 'https://*.equinor.com'],
        'connect-src': [
          "'self'",
          'https://*.microsoftonline.com',
          'https://*.applicationinsights.azure.com',
          'https://*.monitor.azure.com',
        ],
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

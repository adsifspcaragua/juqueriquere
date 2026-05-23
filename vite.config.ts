import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',

    includeAssets: [
      '**/*.png',
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.svg',
      '**/*.webp',
      '**/*.woff',
      '**/*.woff2',
      '**/*.ttf',
      '**/*.otf',
      '**/*.eot'
    ],

    devOptions: {
      enabled: true, // só pra testar em dev (opcional)
    },

    manifest: {
      name: 'Juqueriquere - App de Trilhas',
      short_name: 'Juqueriquere - Trilhas',
      start_url: '/',
      display: 'standalone',
      background_color: '#008A66',
      theme_color: '#008A66',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },

    workbox: {

      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,

      navigateFallback: '/index.html',
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache'
          }
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        }
      ]
    }

  })
  ],
  server: {
    allowedHosts: ['wimp-thus-remnant.ngrok-free.dev']
  }
})

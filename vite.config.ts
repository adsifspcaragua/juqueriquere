import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    useCredentials: true,

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
      '**/*.eot',
      '**/*.ico'
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
          src: '/icon-192.webp',
          sizes: '192x192',
          type: 'image/webp'
        },
        {
          src: '/icon-512.webp',
          sizes: '512x512',
          type: 'image/webp'
        }
      ]
    },

    workbox: {
      globPatterns: ['**/*.{ts,tsx,js,css,html,png,jpg,jpeg,svg,webp,woff,woff2,ttf,otf,eot,json,ico}'],
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,

      navigateFallback: '/index.html',
      runtimeCaching: [
        // 1. Cache para o arquivo CSS do Google Fonts (StaleWhileRevalidate)
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets',
          },
        },
        // 2. Cache para os arquivos de fonte reais do Google Fonts (CacheFirst)
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano (fontes raramente mudam)
            },
          },
        },
        // 3. Cache para as páginas de navegação (NetworkFirst)
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache'
          }
        }
      ]
    }
  })
  ],
})

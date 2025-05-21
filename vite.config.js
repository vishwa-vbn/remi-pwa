// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// })



// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'
// import tailwindcss from '@tailwindcss/vite'
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       devOptions: {
//         enabled: true // Enables PWA in development mode for testing
//       },
//       manifest: {
//         name: 'My PWA App',
//         short_name: 'PWA App',
//         description: 'A production-ready Progressive Web App',
//         theme_color: '#ffffff',
//         background_color: '#ffffff',
//         display: 'standalone',
//         scope: '/',
//         start_url: '/',
//         icons: [
//           {
//             src: '/icon-192x192.png',
//             sizes: '192x192',
//             type: 'image/png'
//           },
//           {
//             src: '/icon-512x512.png',
//             sizes: '512x512',
//             type: 'image/png'
//           }
//         ]
//       },
//       workbox: {
//         globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
//         runtimeCaching: [
//           {
//             urlPattern: ({ request }) => request.destination === 'image',
//             handler: 'CacheFirst',
//             options: {
//               cacheName: 'images',
//               expiration: {
//                 maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
//               }
//             }
//           }
//         ]
//       }
//     })
//   ]
// })

// // vite.config.js
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       includeAssets: ['favicon.svg', 'robots.txt', 'icons/*'],
//       manifest: {
//         name: 'Remi PWA',
//         short_name: 'Remi',
//         start_url: '/',
//         display: 'standalone',
//         background_color: '#ffffff',
//         theme_color: '#ffffff',
//         icons: [
//           {
//             src: '/icon-192x192.png',
//             sizes: '192x192',
//             type: 'image/png'
//           },
//           {
//             src: '/icon-512x512.png',
//             sizes: '512x512',
//             type: 'image/png'
//           }
//         ]
//       },
//       strategies: 'injectManifest',
//       srcDir: 'src',
//       filename: 'sw.js',
//       devOptions: {
//         enabled: true
//       }
//     })
//   ]
// })
// vite.config.js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['icon-192x192.png', 'icon-512x512.png', 'vite.svg', 'firebase-messaging-sw.js'],
      manifest: {
        name: 'My PWA App',
        short_name: 'PWA App',
        description: 'A production-ready Progressive Web App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: ({ request }) => request.url.includes('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',
  },
});
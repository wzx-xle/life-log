import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { resolve } from 'path'
import postcssPxToViewport from 'postcss-px-to-viewport-8-plugin'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/webapi\.amap\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'amap-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/[a-z0-9]+\.is\.autonavi\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'amap-tile-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff2?)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'third-party-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'LifeLog - 生活体验记录',
        short_name: 'LifeLog',
        description: '记录你的本地生活消费体验',
        theme_color: '#FF6B35',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        postcssPxToViewport({
          viewportWidth: 320,
          unitPrecision: 5,
          viewportUnit: 'vw',
          selectorBlackList: [],
          minPixelValue: 1,
          mediaQuery: false,
          exclude: [/node_modules/],
        }),
      ],
    },
  },
  build: {
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // echarts 体积大、仅统计页用，独立且保持懒加载
            if (id.includes('echarts') || id.includes('zrender')) return 'echarts'
            // compressorjs 仅表单页用，独立保持懒加载
            if (id.includes('compressorjs')) return 'compressor'
            // 其余依赖（vue / vant / pinia / dexie 及 Vant 各组件小 chunk）合并为单一 vendor
            return 'vendor'
          }
        },
      },
    },
  },
  base: '/',
})

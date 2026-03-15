import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import metaPlugin, { getBuildHash } from './build/meta'
import dayjs from 'dayjs'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isServe = command === 'serve'
  console.log('env.VITE_APP_MODE_ENV: ', env.VITE_APP_MODE_ENV)
  console.log('isServe: ', isServe)
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return {
    define: {
      // https://github.com/vitejs/vite/issues/2605#issuecomment-803276660
      LOCAL_BUILD_HASH: env.VITE_APP_MODE_ENV !== 'dev' ? JSON.stringify(getBuildHash()) : '""',
      LOCAL_BUILD_TIME: env.VITE_APP_MODE_ENV !== 'dev' ? JSON.stringify(now) : '""',
    },
    base: '/gfftz/',
    server: {
      // host: '0.0.0.0',
      proxy: {
        '/ggfftz/api': {
          target: 'http://localhost:6300',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ggfftz/, ''),
        },
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
      metaPlugin(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Group JS files in js directory
          entryFileNames: `js/[name]-[hash].js`,
          chunkFileNames: `js/[name]-[hash].js`,
          // Group CSS files in css directory
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name!.split('.').pop()?.toLowerCase()
            if (extType === 'css') {
              return `css/[name]-[hash].[ext]`
            }
            // Keep other assets in assets directory
            return `assets/[name]-[hash].[ext]`
          },
        },
      },
    },
  }
})

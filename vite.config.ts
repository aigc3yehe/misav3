import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://45.77.170.65:5555',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/studio-api': {
        target: 'http://43.153.40.155:5577',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/studio-api/, '')
      }
    }
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          const info = name.split('.');
          const extType = info[info.length - 1];
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(name)) {
            return `assets/media/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/\.(br)(\?.*)?$/i.test(name)) {
            return `[name].[hash][extname]`;
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        }
      }
    }
  }
})

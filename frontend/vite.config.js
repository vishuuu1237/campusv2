import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7200,
    proxy: {
      '/api': {
        target: 'http://localhost:2220',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:2210',
        changeOrigin: true
      }
    }
  }
})


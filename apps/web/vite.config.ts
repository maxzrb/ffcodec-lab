import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // 将稳定的第三方运行时与业务目录拆开，避免高级参数继续推高首屏主包。
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ffcodec/domain': resolve(__dirname, '../../packages/domain/src'),
      '@ffcodec/catalog': resolve(__dirname, '../../packages/catalog/src'),
      '@ffcodec/workbench': resolve(__dirname, '../../packages/workbench/src'),
      '@ffcodec/platform-api': resolve(__dirname, '../../packages/platform-api/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})

import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    entry: 'electron/main/index.ts',
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts'),
        },
      },
    },
  },
  preload: {
    entry: 'electron/preload/index.ts',
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    root: 'renderer',
    build: {
      outDir: resolve(__dirname, 'dist/renderer'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'renderer/index.html'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@ffcodec/workbench': resolve(__dirname, '../../packages/workbench/src'),
        '@ffcodec/platform-api': resolve(__dirname, '../../packages/platform-api/src'),
        '@ffcodec/domain': resolve(__dirname, '../../packages/domain/src'),
        '@ffcodec/catalog': resolve(__dirname, '../../packages/catalog/src'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'privacy-policy': resolve(__dirname, 'privacy-policy/index.html'),
        'terms-of-service': resolve(__dirname, 'terms-of-service/index.html'),
        'data-delete-instructions': resolve(__dirname, 'data-delete-instructions/index.html'),
      },
    },
  }
})

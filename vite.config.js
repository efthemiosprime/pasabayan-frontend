import { defineConfig } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const snapflowDir = resolve(__dirname, 'public/snapflow')
const snapflowIndex = resolve(snapflowDir, 'index.html')

/** Pre-built snap-flow app — copied to build/snapflow/ via publicDir. Run: npm run sync:snapflow */
function snapflowPlugin() {
  return {
    name: 'snapflow',
    enforce: 'pre',
    buildStart() {
      if (!existsSync(snapflowIndex)) {
        throw new Error(
          'Missing public/snapflow/. Run: npm run sync:snapflow',
        )
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''

        if (path === '/snapflow') {
          res.writeHead(302, { Location: '/snapflow/' })
          res.end()
          return
        }

        if (path === '/snapflow/') {
          res.setHeader('Content-Type', 'text/html')
          res.end(readFileSync(snapflowIndex))
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [snapflowPlugin()],
  build: {
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'privacy-policy': resolve(__dirname, 'privacy-policy/index.html'),
        'terms-of-service': resolve(__dirname, 'terms-of-service/index.html'),
        'data-delete-instructions': resolve(__dirname, 'data-delete-instructions/index.html'),
        'support': resolve(__dirname, 'support/index.html'),
      },
    },
  },
})

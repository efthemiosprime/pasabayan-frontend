import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
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

/**
 * Dev-only stand-in for the pasabayan.com nginx relay (deploy/nginx/pasabayan.com.conf):
 * forwards the hero search to a local pasabayan-api and adds the relay key and visitor
 * address server-side, so the key never reaches the browser. Only active when
 * WEBSITE_SEARCH_API_TARGET is set (e.g. in .env.development.local); never in builds.
 * WEBSITE_SEARCH_* are deliberately not VITE_-prefixed, so Vite never inlines them.
 */
function websiteSearchDevProxy(env) {
  const target = env.WEBSITE_SEARCH_API_TARGET
  if (!target) return undefined

  return {
    '/api/public/website-search': {
      target,
      changeOrigin: true,
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          proxyReq.setHeader('X-Pasabayan-Relay-Key', env.WEBSITE_SEARCH_RELAY_KEY ?? '')
          proxyReq.setHeader('X-Pasabayan-Visitor-IP', req.socket.remoteAddress ?? '')
          proxyReq.removeHeader('cookie')
        })
      },
    },
    // Lets VITE_LOCATIONS_API_URL=/api/locations/search reach the same local API.
    '/api/locations': { target, changeOrigin: true },
  }
}

export default defineConfig(({ mode }) => ({
  root: '.',
  publicDir: 'public',
  plugins: [snapflowPlugin(), react()],
  server: {
    proxy: websiteSearchDevProxy(loadEnv(mode, __dirname, '')),
  },
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
}))

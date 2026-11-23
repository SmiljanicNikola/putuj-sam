import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { getPageSeo, normalizePath, renderSeoHead, renderSitemap, staticPaths } from './src/seo'

function staticPages(): Plugin {
  return {
    name: 'putujsam-static-pages',
    transformIndexHtml(html, context) {
      const path = context.path === '/index.html' ? '/' : context.path
      return html.replace(
        /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,
        () => `<!-- seo:start -->\n    ${renderSeoHead(getPageSeo(path))}\n    <!-- seo:end -->`,
      )
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split('?')[0] !== '/sitemap.xml') return next()
        response.setHeader('Content-Type', 'application/xml; charset=utf-8')
        response.end(renderSitemap())
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url || '/', 'http://localhost')
        const path = normalizePath(url.pathname)
        const cleanPath = path === '/index.html' ? '/' : path.replace(/\.html$/, '')
        if ((path !== cleanPath || path !== url.pathname) && staticPaths.includes(cleanPath)) {
          response.statusCode = 308
          response.setHeader('Location', `${cleanPath}${url.search}`)
          response.end()
          return
        }
        if (staticPaths.includes(path)) {
          request.url = `${path === '/' ? '/index.html' : `${path}.html`}${url.search}`
          return next()
        }
        if (path.includes('.') && !path.endsWith('.html')) return next()
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        try {
          response.end(
            await readFile(resolve(server.config.root, server.config.build.outDir, '404.html')),
          )
        } catch {
          response.end('Stranica nije pronađena. Pokreni npm run build pre pregleda.')
        }
      })
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), staticPages()],
  build: { copyPublicDir: !isSsrBuild },
}))

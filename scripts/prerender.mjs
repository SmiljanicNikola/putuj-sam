import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import {
  getPageSeo,
  renderPage,
  renderSeoHead,
  renderSitemap,
  staticPaths,
} from '../.prerender/entry-server.js'

const outputDir = resolve('dist')
const template = await readFile(resolve(outputDir, 'index.html'), 'utf8')
const seoPattern = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/
if (!seoPattern.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error('Prerender template is missing its SEO or root placeholder.')
}

for (const path of [...staticPaths, '/404']) {
  const seo = getPageSeo(path)
  const body = await renderPage(path)
  const html = template
    .replace(
      seoPattern,
      () => `<!-- seo:start -->\n    ${renderSeoHead(seo)}\n    <!-- seo:end -->`,
    )
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
  const file = resolve(outputDir, path === '/' ? 'index.html' : `${path.slice(1)}.html`)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
}

await writeFile(resolve(outputDir, 'sitemap.xml'), renderSitemap())
const cleanRedirects = staticPaths
  .filter((path) => path !== '/')
  .map((path) => `${path}.html ${path} 301!`)
const pageRewrites = staticPaths
  .filter((path) => path !== '/')
  .map((path) => `${path} ${path}.html 200`)
await writeFile(
  resolve(outputDir, '_redirects'),
  ['/index.html / 301!', ...cleanRedirects, ...pageRewrites, '/* /404.html 404', ''].join('\n'),
)
console.log(
  `Prerendered ${staticPaths.length} pages, a noindex 404 page, and ${staticPaths.length - 1} sitemap URLs.`,
)

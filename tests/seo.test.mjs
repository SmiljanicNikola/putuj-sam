import { readFile, access, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import test from 'node:test'

const read = (path) => readFile(resolve('dist', path), 'utf8')
const meta = (html, key) =>
  html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1]

test('every sitemap URL has complete indexable HTML and unique search metadata', async () => {
  const sitemap = await read('sitemap.xml')
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]))
  assert.equal(urls.length, 13)
  assert.equal(new Set(urls.map((url) => url.href)).size, urls.length)
  assert.ok(!sitemap.includes('/sacuvano'))
  const titles = new Set()
  const descriptions = new Set()
  for (const url of urls) {
    const html = await read(url.pathname === '/' ? 'index.html' : `${url.pathname.slice(1)}.html`)
    const title = html.match(/<title>(.*?)<\/title>/)?.[1]
    const description = meta(html, 'description')
    assert.ok(title?.includes('Putuj sam'), url.href)
    assert.ok(
      description?.length >= 80 && description.length <= 180,
      `${url.href}: ${description?.length}`,
    )
    assert.ok(!titles.has(title), `Duplicate title: ${url.href}`)
    assert.ok(!descriptions.has(description), `Duplicate description: ${url.href}`)
    titles.add(title)
    descriptions.add(description)
    assert.ok(html.includes(`<link rel="canonical" href="${url.href}"`), url.href)
    assert.ok(!meta(html, 'robots').includes('noindex'), url.href)
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, url.href)
    assert.ok(html.includes('<main id="main-content">'), url.href)
    assert.ok(!html.includes('<!--$?-->'), `Unresolved Suspense boundary: ${url.href}`)
    assert.ok(!html.includes('<!--$!-->'), `Client-only content: ${url.href}`)
    assert.ok(
      !/<div hidden id="S:/.test(html),
      `Content requires JavaScript to become visible: ${url.href}`,
    )
    assert.equal(meta(html, 'og:url'), url.href)
    assert.equal(meta(html, 'og:title'), title)
    assert.equal(meta(html, 'twitter:title'), title)
    await access(resolve('dist', new URL(meta(html, 'og:image')).pathname.slice(1)))
    const graph = JSON.parse(
      html.match(
        /<script id="structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )[1],
    )['@graph']
    assert.ok(graph.some((item) => item['@type'] === 'WebSite'))
    if (/\/(destinacije|smestaj)\//.test(url.pathname)) {
      const place = graph.find((item) =>
        ['TouristAttraction', 'LodgingBusiness'].includes(item['@type']),
      )
      const breadcrumbs = graph.find((item) => item['@type'] === 'BreadcrumbList')
      assert.equal(place.url, url.href)
      assert.equal(breadcrumbs.itemListElement.at(-1).item, url.href)
      assert.ok(html.includes(place.name), url.href)
      assert.ok(html.includes('Pre nego što kreneš'), url.href)
      assert.ok(html.includes('Kako stići') || html.includes('Kako do smeštaja'), url.href)
    }
  }
})

test('discovery pages expose real links to every public place page', async () => {
  const html = (await read('index.html')) + (await read('smestaj.html'))
  const sitemap = await read('sitemap.xml')
  const places = [
    ...sitemap.matchAll(/<loc>https:\/\/putujsam.com(\/(?:destinacije|smestaj)\/[^<]+)<\/loc>/g),
  ]
  assert.equal(places.length, 10)
  for (const [, path] of places)
    assert.ok(html.includes(`href="${path}"`), `Missing crawlable link: ${path}`)
})

test('private saved lists and the error page are excluded from indexing', async () => {
  for (const file of ['sacuvano.html', '404.html']) {
    const html = await read(file)
    assert.ok(meta(html, 'robots').includes('noindex'))
  }
  const error = await read('404.html')
  assert.ok(!error.includes('rel="canonical"'))
  assert.ok(error.includes('404'))
  const redirects = await read('_redirects')
  assert.ok(redirects.includes('/destinacije/tara /destinacije/tara.html 200'))
  assert.ok(redirects.includes('/* /404.html 404'))
  assert.ok(!redirects.includes('/* /index.html 200'))
})

test('owner inquiries are indexable without exposing unpublished hotel profiles', async () => {
  const html = await read('smestaj.html')
  assert.ok(html.includes('Predstavite svoj'))
  assert.equal((html.match(/class="listing-placeholder"/g) || []).length, 4)
  assert.ok(html.includes('Ilustrativni prikaz budućih profila smeštaja.'))
  assert.ok(html.includes('href="tel:+381658889087"'))
  assert.ok(html.includes('href="mailto:nikola.kiki.00@gmail.com?subject='))
  assert.ok(!meta(html, 'robots').includes('noindex'))
  const graph = JSON.parse(
    html.match(/<script id="structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  )['@graph']
  assert.ok(graph.some((item) => item['@type'] === 'WebPage'))
  assert.ok(
    !graph.some((item) =>
      ['LodgingBusiness', 'ItemList', 'Offer', 'Review'].includes(item['@type']),
    ),
  )
  const sitemap = await read('sitemap.xml')
  const redirects = await read('_redirects')
  const assets = await readdir(resolve('dist/assets'))
  const publicCode = (
    await Promise.all(
      assets.filter((name) => name.endsWith('.js')).map((name) => read(`assets/${name}`)),
    )
  ).join('')
  for (const id of ['omorika', 'mecavnik', 'premier-aqua', 'ramonda']) {
    assert.ok(!sitemap.includes(`/smestaj/${id}`))
    assert.ok(!redirects.includes(`/smestaj/${id}`))
    assert.ok(!publicCode.includes(id), `Retired hotel data present in browser bundle: ${id}`)
    await assert.rejects(access(resolve('dist/smestaj', `${id}.html`)), { code: 'ENOENT' })
  }
})

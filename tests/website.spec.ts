import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  // Verify map behavior independently of the availability of public tile servers.
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  )
})

test('search, category and region filters synchronize the cards and map', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox').fill('tara')
  await expect(page.locator('.place-card')).toHaveCount(1)
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1)
  await expect(page.locator('.card-title')).toHaveText('Nacionalni park Tara')
  await page.getByRole('button', { name: 'Obriši pretragu' }).click()
  await page.getByRole('button', { name: 'Kultura', exact: true }).click()
  await expect(page.locator('.place-card')).toHaveCount(2)
  await page.locator('#region').selectOption('Istočna Srbija')
  await expect(page.locator('.place-card')).toHaveCount(1)
  await expect(page.locator('.card-title')).toHaveText('Golubačka tvrđava')
  await page.reload()
  await expect(page.locator('.place-card')).toHaveCount(1)
})

test('favorites persist across routes and browser reloads', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sačuvaj: Nacionalni park Tara', exact: true }).click()
  await page.getByRole('link', { name: 'Sačuvana mesta (1)' }).click()
  await expect(page.locator('.saved-grid .place-card')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('.saved-grid .place-card')).toHaveCount(1)
  await page
    .getByRole('button', { name: 'Ukloni iz sačuvanih: Nacionalni park Tara', exact: true })
    .click()
  await expect(page.locator('.saved-empty')).toBeVisible()
})

test('destination pages have clean URLs, directions and working legacy links', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Otkrij: Nacionalni park Tara', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Nacionalni park Tara', level: 1 })).toBeVisible()
  await expect(page).toHaveURL(/\/destinacije\/tara$/)
  await expect(page.getByRole('link', { name: 'Kako da stigneš', exact: true })).toHaveAttribute(
    'href',
    /google\.com\/maps\/search/,
  )
  await page.goto('/?mesto=golubac')
  await expect(page).toHaveURL(/\/destinacije\/golubac$/)
  await expect(page.getByRole('heading', { name: 'Golubačka tvrđava', level: 1 })).toBeVisible()
})

test('planner generates a real directions URL and allows reordering stops', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Hajde da krenemo' }).click()
  const dialog = page.getByRole('dialog', { name: 'Isplaniraj svoje putovanje' })
  await dialog.getByRole('button', { name: 'Pronađi moj put' }).click()
  await expect(dialog.locator('.plan-stops li')).toHaveCount(2)
  await expect(dialog.getByRole('link', { name: 'Otvori rutu u Google mapama' })).toHaveAttribute(
    'href',
    /google\.com\/maps\/dir.*waypoints=/,
  )
  await dialog.getByRole('button', { name: 'Pomeri kasnije: Nacionalni park Tara' }).click()
  await expect(dialog.locator('.stop-details').first()).toContainText('Drina i Bajina Bašta')
  await dialog.getByRole('button', { name: 'Ukloni iz plana: Nacionalni park Tara' }).click()
  await expect(dialog.locator('.plan-stops li')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
})

test('map markers open a place preview and can expand to fullscreen', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  if (testInfo.project.name === 'mobile')
    await page
      .locator('.mobile-map-switch')
      .getByRole('button', { name: 'Mapa', exact: true })
      .click()
  await page.locator('.leaflet-marker-icon[title="Golubačka tvrđava"]').click()
  await expect(page.locator('.map-preview')).toContainText('Golubačka tvrđava')
  await page.getByRole('button', { name: 'Mapa preko celog ekrana' }).click()
  await expect(page.locator('.map-fullscreen')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.map-fullscreen')).toHaveCount(0)
})

test('empty results reset and illustrative accommodation slots open owner inquiries', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('searchbox').fill('qwerty-nepostojece')
  await expect(page.locator('.empty-state')).toBeVisible()
  await page.getByRole('button', { name: 'Prikaži sva mesta' }).first().click()
  await expect(page.locator('.place-card')).toHaveCount(10)
  await page.goto('/smestaj')
  await expect(page.locator('.listing-placeholder')).toHaveCount(4)
  await expect(page.locator('.place-card, .leaflet-container')).toHaveCount(0)
  const trigger = page
    .locator('.listing-placeholder')
    .first()
    .getByRole('button', { name: 'Zatražite objavu' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Predstavljanje smeštaja' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.listing-context')).toHaveText('Hotel')
  await expect(dialog.getByRole('link', { name: /Pozovite/ })).toHaveAttribute(
    'href',
    'tel:+381658889087',
  )
  const href = await dialog.getByRole('link', { name: /Pošaljite upit/ }).getAttribute('href')
  const email = new URL(href!)
  expect(email.pathname).toBe('nikola.kiki.00@gmail.com')
  expect(email.searchParams.get('subject')).toContain('predstavljanje smeštaja')
  expect(email.searchParams.get('body')).toContain('Tip smeštaja: Hotel')
  expect(email.searchParams.get('subject')).not.toContain('kupovinu')
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await page.getByText('Šta je potrebno za objavu?', { exact: true }).click()
  await expect(page.locator('.listing-faq details[open]')).toContainText(
    'fotografije koje imate pravo da koristite',
  )
})

test('both designs load photos, remain within the viewport and have no runtime errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const route of [
    '/',
    '/inspiracija',
    '/smestaj',
    '/sacuvano',
    '/destinacije/tara',
    '/destinacije/uvac',
  ]) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    await page.locator('img').evaluateAll(async (images) => {
      images.forEach((image) => {
        ;(image as HTMLImageElement).loading = 'eager'
      })
      await Promise.all(images.map((image) => (image as HTMLImageElement).decode().catch(() => {})))
    })
    expect(
      await page
        .locator('img')
        .evaluateAll((images) =>
          images
            .filter((image) => (image as HTMLImageElement).naturalWidth === 0)
            .map((image) => image.getAttribute('src')),
        ),
    ).toEqual([])
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  }
  expect(errors).toEqual([])
})

test('core pages meet automated accessibility checks', async ({ page }) => {
  for (const path of ['/', '/inspiracija', '/smestaj', '/sacuvano', '/destinacije/tara']) {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(
      results.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([])
  }
})

test('nearby places use the granted location and enable distance sorting', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: 44.8125, longitude: 20.4612 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Blizu mene', exact: true }).click()
  await expect(page.locator('#sort')).toHaveValue('nearby')
  await expect(page.locator('.leaflet-overlay-pane path.leaflet-interactive')).toHaveCount(1)
})

test('nearby markers are grouped and expand when clicked', async ({ page }, testInfo) => {
  await page.goto('/')
  if (testInfo.project.name === 'mobile')
    await page
      .locator('.mobile-map-switch')
      .getByRole('button', { name: 'Mapa', exact: true })
      .click()
  const clusters = page.locator('.place-cluster')
  await expect(clusters.first()).toBeVisible()
  const initialMarkers = await page.locator('.leaflet-marker-icon').count()
  await clusters.first().click()
  await expect
    .poll(() => page.locator('.leaflet-marker-icon').count())
    .toBeGreaterThan(initialMarkers)
})

test('SEO metadata follows navigation and favorites survive hydration on place pages', async ({
  page,
}) => {
  await page.goto('/destinacije/tara')
  await expect(page).toHaveTitle(/Nacionalni park Tara.*šta videti/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://putujsam.com/destinacije/tara',
  )
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://putujsam.com/destinacije/tara',
  )
  await expect(page.locator('#structured-data')).toHaveCount(1)
  await page.getByRole('button', { name: 'Sačuvaj mesto', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Sačuvano', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page
    .locator('.place-listing-invitation')
    .getByRole('link', { name: 'Predstavite smeštaj' })
    .click()
  await expect(page).toHaveTitle(/Predstavite svoj smeštaj u Srbiji/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://putujsam.com/smestaj',
  )
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /Predstavite svoj smeštaj/,
  )
  await expect(page.locator('#structured-data')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Sačuvana mesta (1)' })).toBeVisible()
  await page.locator('.listing-hero').getByRole('button', { name: 'Zatražite objavu' }).click()
  const dialog = page.getByRole('dialog', { name: 'Predstavljanje smeštaja' })
  const email = new URL(
    (await dialog.getByRole('link', { name: /Pošaljite upit/ }).getAttribute('href'))!,
  )
  expect(email.searchParams.get('body')).toContain('Mesto / region: Zapadna Srbija')
  await expect(dialog.locator('.listing-context')).toHaveText('Zapadna Srbija')
})

test('browser back restores filters after opening a destination page', async ({ page }) => {
  await page.goto('/?q=tara')
  await expect(page.locator('.place-card')).toHaveCount(1)
  await page.getByRole('link', { name: 'Otkrij: Nacionalni park Tara', exact: true }).click()
  await expect(page).toHaveURL(/\/destinacije\/tara$/)
  await page.goBack()
  await expect(page.getByRole('searchbox')).toHaveValue('tara')
  await expect(page.locator('.place-card')).toHaveCount(1)
})

test('missing pages are noindex and valid navigation clears that directive', async ({ page }) => {
  const response = await page.goto('/destinacije/nepostojeca-destinacija')
  if (process.env.PLAYWRIGHT_PRODUCTION === '1') expect(response?.status()).toBe(404)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await page.getByRole('link', { name: 'Vrati se na mapu', exact: true }).click()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'index, follow, max-image-preview:large',
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://putujsam.com/',
  )
})

test('destination content and navigation work without JavaScript in the production HTML', async ({
  browser,
  baseURL,
}) => {
  test.skip(process.env.PLAYWRIGHT_PRODUCTION !== '1', 'Requires the prerendered production build.')
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    const response = await page.goto('/destinacije/tara')
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole('heading', { name: 'Nacionalni park Tara', level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Šta videti i doživeti', level: 2 }),
    ).toBeVisible()
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      /Nacionalni park Tara/,
    )
    await page
      .locator('.place-listing-invitation')
      .getByRole('link', { name: 'Predstavite smeštaj' })
      .click()
    await expect(
      page.getByRole('heading', { name: 'Predstavite svoj smeštaj u Srbiji.', level: 1 }),
    ).toBeVisible()
    await expect(page.locator('.listing-placeholder')).toHaveCount(4)
    const contacts = page.locator('.listing-intro-panel')
    await expect(contacts.getByRole('link', { name: /Pozovite/ })).toHaveAttribute(
      'href',
      'tel:+381658889087',
    )
    const email = new URL(
      (await contacts.getByRole('link', { name: /Pošaljite upit/ }).getAttribute('href'))!,
    )
    expect(email.pathname).toBe('nikola.kiki.00@gmail.com')
    expect(email.searchParams.get('subject')).toContain('predstavljanje smeštaja')
    // Static contact links remain usable before hydration and without JavaScript.
    await page.getByText('Ko može da predstavi svoj smeštaj?', { exact: true }).click()
    await expect(page.locator('.listing-faq details[open]')).toContainText(
      'Vlasnici i ovlašćeni predstavnici',
    )
    const notFound = await page.goto('/nepostojeca-stranica')
    expect(notFound?.status()).toBe(404)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  } finally {
    await context.close()
  }
})

test('retired accommodation profiles return 404 and stale favorites are removed', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('favorites-seeded')) {
      localStorage.setItem(
        'putujsam-saved',
        JSON.stringify(['tara', 'omorika', 'mecavnik', 'premier-aqua', 'ramonda']),
      )
      sessionStorage.setItem('favorites-seeded', '1')
    }
  })
  await page.goto('/sacuvano')
  await expect(page.locator('.saved-grid .place-card')).toHaveCount(1)
  await expect(page.locator('.card-title')).toHaveText('Nacionalni park Tara')
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('putujsam-saved') || '[]')))
    .toEqual(['tara'])
  for (const id of ['omorika', 'mecavnik', 'premier-aqua', 'ramonda']) {
    const response = await page.goto(`/smestaj/${id}`)
    if (process.env.PLAYWRIGHT_PRODUCTION === '1') expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: /Ovaj put još/ })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  }
  if (process.env.PLAYWRIGHT_PRODUCTION === '1') {
    const response = await page.goto('/smestaj/omorika.html')
    expect(response?.status()).toBe(404)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  }
})

test('the listing dialog is accessible and stays distinct from the website sale inquiry', async ({
  page,
}) => {
  await page.goto('/smestaj')
  await page.locator('.listing-hero').getByRole('button', { name: 'Zatražite objavu' }).click()
  const dialog = page.getByRole('dialog', { name: 'Predstavljanje smeštaja' })
  await expect(dialog).toBeVisible()
  await expect.poll(() => dialog.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  // Inspect the active dialog; the backdrop deliberately dims the underlying page.
  const results = await new AxeBuilder({ page })
    .include('.listing-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    results.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => node.target),
    })),
  ).toEqual([])
  await page.keyboard.press('Escape')
  await page.locator('.nav-sale-button').click()
  const sale = page.getByRole('dialog', { name: 'Kupovina sajta i domena putujsam.com' })
  await expect(sale).toBeVisible()
  const email = new URL(
    (await sale.getByRole('link', { name: /Pošaljite upit/ }).getAttribute('href'))!,
  )
  expect(email.searchParams.get('subject')).toContain('kupovinu sajta i domena')
  expect(email.searchParams.get('body')).toBeNull()
})

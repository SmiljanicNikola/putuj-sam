# Putuj sam

A Serbian travel discovery website for **putujsam.com**, built with React 19, TypeScript, Vite, and Leaflet. All interface copy is in Serbian Latin script.

## Preview the two designs

- **`/` — Map discovery:** destination cards beside an interactive Leaflet map, with search, category and region filters. On mobile, switch between cards and the map.
- **`/inspiracija` — Editorial discovery:** a photographic homepage with selected destinations, a Tara weekend feature, and discovery by mood.
- **`/smestaj` — Accommodation partnerships:** an owner-facing page with four blurred, clearly illustrative profile slots, the publication process, FAQs, and direct phone/email contact. “Zatražite objavu” opens an inquiry dialog with a prefilled email tailored to the property type and region.
- **`/sacuvano` — Saved places:** favorites stored locally in the visitor's browser.
- **`/destinacije/:id` — Destination guides:** standalone pages for all ten destinations, with photographs, visit tips, directions, breadcrumbs, and related places.
- **`/smestaj/:id` — Future accommodation guides:** generated only for approved profiles added to `stays`. No accommodation profiles are currently published; the previous four hotel addresses return 404.

The navbar links both designs. I would use the editorial layout as the public homepage and keep map discovery as the main planning tool. The current default opens the map version so both can be reviewed before choosing.

## Run locally

Use Node.js 20.19+ or 22+.

On a new MacBook, install Git and Node.js, then clone the project:

```sh
git clone https://github.com/SmiljanicNikola/putuj-sam.git
cd putuj-sam
npm ci
npm run dev
```

Vite prints the assigned local URL. If port 5173 is occupied, it uses the next available port.

Source code, photographs, configuration, and the dependency lockfile are included
in Git. Dependencies and generated builds are recreated locally. No API keys or
environment file are required for the default setup; `.env.example` documents
the optional map provider settings. Local `.env` files are ignored by Git and
must be transferred separately if you customize them.

Before switching computers, commit and push your work from the current computer:

```sh
git add .
git commit -m "Describe your changes"
git push
```

For an existing clone, start with a clean working tree and update before editing:

```sh
git pull --ff-only
npm ci
npm run dev
```

To build and preview production output:

```sh
npm run build
npm run preview
```

The production files are generated in **`dist/`**. The build renders all public routes to complete HTML, then React hydrates that content in the browser. Rendering uses Node and the existing React/Vite dependencies; no browser or runtime backend is required to build or host the site.

## Working features

- Search that supports Serbian accents and case-insensitive input.
- Shareable search/filter URLs and clean destination addresses (`/destinacije/tara`). Older `?mesto=` links redirect to the corresponding guide in the browser.
- Map markers with automatic grouping, card synchronization, place previews, zoom, reset, and fullscreen.
- Optional browser geolocation and sorting by straight-line distance.
- Persistent saved places, including synchronization between tabs.
- Trip planner with departure city, three suggested regions, saved-place routes, stop reordering/removal, and Google Maps driving directions.
- External links for actual directions, visitor information, and accommodation inquiries.
- Responsive navigation and footer; accessible dialogs with keyboard focus management, Escape dismissal, reduced-motion support, and screen-reader labels.
- Code splitting, locally hosted fonts, responsive WebP photography, lazy-loaded card images, and photo attribution.
- Prerendered content, unique page titles and descriptions, canonical URLs, Open Graph and Twitter cards, JSON-LD structured data, robots.txt, an automatically generated sitemap, and hosting route configuration.

## SEO and public pages

**`src/seo.ts`** is the shared source for metadata, public routes, canonical addresses, breadcrumbs, and structured data. It has individual search descriptions for each destination and accommodation. After adding a place in `src/data.ts`, add its short search description in `placeDescriptions` and rebuild. The new route, links, static HTML, sitemap entry, and Netlify rewrite are generated from the place data.

**`src/PlacePage.tsx`** renders the same guide during the build and in the browser. Destination and accommodation cards use real links so crawlers and visitors without JavaScript can open their pages. The map loads only after the browser becomes interactive; the list and guide content are visible immediately.

**`scripts/prerender.mjs`** generates 14 pages plus `404.html`, and a sitemap containing 13 indexable URLs. Saved lists and missing pages use `noindex`. Search and filter URLs point to the collection's canonical address. Structured data describes the website, page, breadcrumb trail, and actual destinations. The accommodation partnership page is a `WebPage`; illustrative slots have no lodging, review, offer, or list schema. Approved future accommodation profiles can use `LodgingBusiness`; images marked `imageIsIllustrative` are excluded from the business schema.

Keep the generated HTML for each route when deploying. A global SPA rewrite to `index.html` would replace individual page metadata and turn missing pages into HTTP 200 responses. The included hosting configuration serves the corresponding page and preserves real 404 errors.

Once `putujsam.com` is live, verify the domain in Google Search Console, submit `https://putujsam.com/sitemap.xml`, and inspect the homepage and a destination URL. Indexing and search positions depend on the published site and content; they cannot be validated from localhost.

## Content and photographs

Update **`src/data.ts`** to add destinations, revise copy, change official links, or manage approved accommodation profiles. Place coordinates are discovery points and are not turn-by-turn access instructions.

The `stays` list is intentionally empty. Add an actual property only after agreeing on publication with its owner and reviewing its name, location, description, official contact, and permission to use the supplied photos. Add its search description in `src/seo.ts`, credit its photographs, and rebuild. Its guide, discovery links, and sitemap entry then appear automatically. Use actual property photos; set `imageIsIllustrative: true` if an image instead shows the surrounding destination. The four blurred slots are decorative examples, not hidden hotel records or a paid unlock flow.

**`src/contact.ts`** centralizes the contact phone and email. **`src/ContactLinks.tsx`** distinguishes accommodation inquiries from inquiries about buying the website and domain. Contact links open the visitor's phone/email application; an email is sent only when the visitor submits it there. No inquiry is sent, stored, or automatically published by this static site. Destination guides link owners to `/smestaj?region=...`; the region is carried into the email template while the canonical URL remains `/smestaj`.

Photography is downloaded from Wikimedia Commons with author, license, and source recorded in **`public/image-credits.json`**. The footer opens the full credits. Retain the credits and license information when replacing or reusing the photos.

Font and runtime-library license notices are included in `public/licenses/` and shipped with the production build.

Images are already included. To reproduce the asset workflow:

```sh
python3 scripts/prepare-assets.py
node scripts/optimize-images.mjs
```

The download script only fetches missing JPEG files. Wikimedia can rate-limit requests; rerun the script later if a download fails. The optimizer produces compressed JPEGs, full-size WebP files, and 600px WebP variants. Run it when adding original photos, rather than repeatedly recompressing existing JPEGs.

## Map provider

The default is the standard OpenStreetMap tile service, with visible attribution, browser caching, and normal browser referrer behavior. It requires no API key. Review [OpenStreetMap's usage policy](https://operations.osmfoundation.org/policies/tiles/) for your expected traffic. For sustained commercial traffic, use a suitable hosted tile provider.

To switch providers, copy `.env.example` to `.env.local`, set `VITE_MAP_TILE_URL` and `VITE_MAP_ATTRIBUTION`, and rebuild. These values are public client configuration. Keep the attribution and update the privacy text to reflect the chosen provider.

## Tests

The browser suite covers filters, URL persistence, favorites, deep links, keyboard dismissal, trip planning, stop editing, map controls, geolocation, photos, overflow, runtime errors, and automated accessibility. It also verifies page metadata during navigation, saved lists after hydration, browser Back restoring filters, and missing-page indexing directives, owner inquiry templates, dialog accessibility, retired hotel 404s, and removal of stale accommodation favorites. It runs in desktop Chrome and a mobile Chromium viewport. Tile requests are stubbed during tests to keep the suite independent of public map services; live map rendering is checked separately in the browser.

```sh
npx playwright install chromium
npm run test:e2e
```

To use an existing Chrome installation on macOS:

```sh
PLAYWRIGHT_CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:e2e
```

Check the built output and run the browser suite against the production preview:

```sh
npm run build
npm run test:seo
npm run test:production
```

Use the same `PLAYWRIGHT_CHROME_PATH` prefix if using installed Chrome on macOS. Production tests additionally disable JavaScript to verify that guide content and links work in raw HTML, and verify HTTP 404 responses. The SEO checks inspect every sitemap page for complete content, unique metadata, canonical URLs, structured data, image availability, and crawlable links. They also ensure unpublished accommodation profiles are absent from generated pages, sitemap, rewrites, and browser bundles.

Formatting:

```sh
npm run format
npm run format:check
```

## Deploy to putujsam.com

**Namecheap shared hosting + Dynadot:** run `npm run package:namecheap` to build,
check the public pages, and create `deploy/putujsam-namecheap.zip`. Extract it
directly into the document root for `putujsam.com` in cPanel. The included
`.htaccess` serves clean destination URLs, redirects `.html`, HTTP, and `www`
URLs, and returns real 404 errors. SSL must be active for both hostnames
(already verified for this upload). See [DEPLOYMENT.md](DEPLOYMENT.md) for DNS,
upload, and launch steps.

**Vercel:** import this project, choose Vite, use `npm run build`, and set the output directory to `dist`. `vercel.json` enables clean URLs for the generated `.html` files. Vercel serves `404.html` for missing pages. Remove any older catch-all SPA rewrite from the hosting project's configuration.

**Netlify:** use `npm run build` and publish `dist`. The build generates `_redirects` with exact rewrites for public pages, canonical redirects from `.html` URLs, and a 404 fallback.

**Other static hosting:** upload `dist` and serve extensionless URLs from their matching `.html` file. For nginx, use `try_files $uri $uri.html $uri/ =404;` in the site location block, with `index index.html;` and `error_page 404 /404.html;`. Unknown routes must return HTTP 404 rather than the homepage with HTTP 200.

Add `putujsam.com` to the hosting project's custom domains and use the DNS records shown by that host. Redirect `www.putujsam.com` to the apex domain and enable HTTPS. Exact DNS values depend on the hosting account.

The current site is a static travel guide. Booking transactions, live availability, accounts, a CMS, and email delivery are outside this implementation; accommodation inquiries open the configured phone or email application. Future published profiles can link guests directly to the properties. Favorites remain on the visitor's device.

Before publishing, choose which design should be the default, review the curated destinations and contact details for your editorial needs, and connect the domain to the chosen hosting project. If analytics or additional integrations are added later, update the corresponding privacy information.

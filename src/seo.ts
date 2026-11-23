import { allPlaces, destinations, stays, type Place } from './data'

export const SITE_URL = 'https://putujsam.com'
export const SITE_NAME = 'Putuj sam'

export const placePath = (place: Place) =>
  `/${place.category === 'Smeštaj' ? 'smestaj' : 'destinacije'}/${place.id}`

export const normalizePath = (pathname: string) => pathname.replace(/\/+$/, '') || '/'

export function placeForPath(pathname: string) {
  return allPlaces.find((place) => placePath(place) === normalizePath(pathname))
}

export const staticPaths = [
  '/',
  '/inspiracija',
  '/smestaj',
  '/sacuvano',
  ...allPlaces.map(placePath),
]

interface Breadcrumb {
  name: string
  path: string
}

export interface PageSeo {
  title: string
  description: string
  canonical: string | null
  image: string
  imageAlt: string
  robots: string
  structuredData: Record<string, unknown>
}

const collectionDescriptions: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Destinacije u Srbiji i interaktivna mapa',
    description:
      'Istraži destinacije u Srbiji na interaktivnoj mapi. Otkrij planine, jezera, gradove i znamenitosti, sačuvaj omiljena mesta i pronađi ideju za vikend.',
  },
  '/inspiracija': {
    title: 'Gde za vikend u Srbiji? Ideje za putovanje',
    description:
      'Pronađi ideju za vikend u Srbiji: Tara, Uvac, Golubac i gradske šetnje. Otkrij odabrane destinacije i napravi plan za svoje sledeće putovanje.',
  },
  '/smestaj': {
    title: 'Predstavite svoj smeštaj u Srbiji',
    description:
      'Predstavite hotel, apartman ili etno-domaćinstvo putnicima koji istražuju Srbiju. Kontaktirajte Putuj sam za dogovor o objavi profila vašeg smeštaja.',
  },
  '/sacuvano': {
    title: 'Tvoja sačuvana mesta u Srbiji',
    description: 'Tvoja lista omiljenih destinacija i smeštaja za sledeće putovanje po Srbiji.',
  },
}

const placeDescriptions: Record<string, string> = {
  tara: 'Otkrij Nacionalni park Tara: Banjska stena, šumske staze oko Mitrovca i jezero Zaovine. Pogledaj lokaciju, savete za posetu i ideje za putovanje.',
  uvac: 'Istraži meandre Uvca, vidikovac Molitva i organizovanu plovidbu rezervatom. Pronađi lokaciju, savete za posetu i ideju za vikend u zapadnoj Srbiji.',
  golubac:
    'Poseti Golubačku tvrđavu na Dunavu. Saznaj šta videti, pogledaj lokaciju i zvanične informacije i pronađi još destinacija u istočnoj Srbiji.',
  drina:
    'Otkrij Drinu i Bajinu Baštu: kućicu na Drini, jezero Perućac i reku Vrelo. Pogledaj lokaciju i savete za svoje sledeće putovanje po Srbiji.',
  'fruska-gora':
    'Pronađi ideju za izlet na Frušku goru: šumske staze, manastiri i Sremski Karlovci. Pogledaj lokaciju, savete za posetu i druge destinacije u regionu.',
  'novi-sad':
    'Isplaniraj vikend u Novom Sadu: Petrovaradinska tvrđava, Dunavski park i šetnja centrom. Pogledaj šta videti, lokaciju i ideje za izlet u okolini.',
  zlatibor:
    'Upoznaj mirniju stranu Zlatibora: Ribničko jezero, Stopića pećina i Sirogojno. Pronađi lokaciju, savete za posetu i ideju za planinski vikend.',
  studenica:
    'Poseti manastir Studenicu u centralnoj Srbiji. Pogledaj znamenitosti, lokaciju i savete za obilazak, uz zvanične informacije o UNESCO baštini.',
  rtanj:
    'Otkrij planinu Rtanj u istočnoj Srbiji. Pronađi ideje za boravak u prirodi, lokaciju i savete za pripremu izleta, uz povezane destinacije u regionu.',
  'mokra-gora':
    'Istraži Mokru Goru, Šargansku osmicu i Drvengrad. Pogledaj lokaciju, savete za posetu i predlog za vikend među planinama zapadne Srbije.',
}

export function breadcrumbsFor(place: Place): Breadcrumb[] {
  return [
    { name: 'Destinacije u Srbiji', path: '/' },
    ...(place.category === 'Smeštaj' ? [{ name: 'Smeštaj', path: '/smestaj' }] : []),
    { name: place.name, path: placePath(place) },
  ]
}

export function getPageSeo(pathname: string): PageSeo {
  const path = normalizePath(pathname)
  const place = placeForPath(path)
  const collection = collectionDescriptions[path]
  const exists = !!place || !!collection
  const canonical = exists ? `${SITE_URL}${path === '/' ? '/' : path}` : null
  const description = place
    ? placeDescriptions[place.id] || `${place.name}, ${place.region}. ${place.description}`
    : collection?.description ||
      'Ova stranica nije pronađena. Istraži destinacije i smeštaj u Srbiji na sajtu Putuj sam.'
  const title = `${
    place
      ? `${place.name} — ${place.category === 'Smeštaj' ? 'smeštaj i lokacija' : 'šta videti i kako stići'}`
      : collection?.title || 'Stranica nije pronađena'
  } | ${SITE_NAME}`
  const image = place?.image || (path === '/smestaj' ? '/images/tara.jpg' : '/images/uvac.jpg')
  const imageAlt =
    place?.imageAlt ||
    (path === '/smestaj'
      ? 'Nacionalni park Tara u Srbiji — Putuj sam'
      : 'Meandri Uvca u Srbiji — Putuj sam')
  const robots =
    !exists || path === '/sacuvano' ? 'noindex, follow' : 'index, follow, max-image-preview:large'
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: 'sr-Latn',
  }
  const graph: Record<string, unknown>[] = [website]
  if (canonical) {
    graph.push({
      '@type': place || path === '/smestaj' ? 'WebPage' : 'CollectionPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      inLanguage: 'sr-Latn',
      isPartOf: { '@id': website['@id'] },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${SITE_URL}${image}`,
        caption: imageAlt,
      },
      ...(place
        ? {
            mainEntity: { '@id': `${canonical}#place` },
            breadcrumb: { '@id': `${canonical}#breadcrumb` },
          }
        : {}),
    })
  }
  if (place && canonical) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: breadcrumbsFor(place).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    })
    graph.push({
      '@type': place.category === 'Smeštaj' ? 'LodgingBusiness' : 'TouristAttraction',
      '@id': `${canonical}#place`,
      name: place.name,
      description: place.description,
      url: canonical,
      ...(place.category === 'Smeštaj' ? { sameAs: place.source } : {}),
      ...(!place.imageIsIllustrative ? { image: `${SITE_URL}${image}` } : {}),
      geo: {
        '@type': 'GeoCoordinates',
        latitude: place.coordinates[0],
        longitude: place.coordinates[1],
      },
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: place.region,
        containedInPlace: { '@type': 'Country', name: 'Srbija' },
      },
    })
  } else if (canonical && path !== '/sacuvano' && (path !== '/smestaj' || stays.length > 0)) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${canonical}#places`,
      itemListElement: (path === '/smestaj'
        ? stays
        : path === '/inspiracija'
          ? [destinations[0], destinations[2], destinations[5]]
          : destinations
      ).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${SITE_URL}${placePath(item)}`,
      })),
    })
  }
  return {
    title,
    description,
    canonical,
    image: `${SITE_URL}${image}`,
    imageAlt,
    robots,
    structuredData: { '@context': 'https://schema.org', '@graph': graph },
  }
}

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  )

export const serializeStructuredData = (data: Record<string, unknown>) =>
  JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')

export function renderSeoHead(seo: PageSeo) {
  const meta = (attribute: 'name' | 'property', key: string, value: string) =>
    `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`
  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta('name', 'description', seo.description),
    meta('name', 'robots', seo.robots),
    ...(seo.canonical ? [`<link rel="canonical" href="${seo.canonical}" />`] : []),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:locale', 'sr_RS'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:title', seo.title),
    meta('property', 'og:description', seo.description),
    ...(seo.canonical ? [meta('property', 'og:url', seo.canonical)] : []),
    meta('property', 'og:image', seo.image),
    meta('property', 'og:image:type', 'image/jpeg'),
    meta('property', 'og:image:alt', seo.imageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', seo.title),
    meta('name', 'twitter:description', seo.description),
    meta('name', 'twitter:image', seo.image),
    meta('name', 'twitter:image:alt', seo.imageAlt),
    `<script id="structured-data" type="application/ld+json">${serializeStructuredData(seo.structuredData)}</script>`,
  ].join('\n    ')
}

export function renderSitemap() {
  const urls = staticPaths.filter((path) => path !== '/sacuvano')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n')}\n</urlset>\n`
}

import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'

export { getPageSeo, staticPaths, renderSeoHead, renderSitemap } from './seo'

const pagesReady = Promise.all([
  import('./Explorer'),
  import('./Inspiration'),
  import('./Accommodation'),
]).then(([explorer, inspiration, accommodation]) => ({
  Explorer: explorer.default,
  Inspiration: inspiration.default,
  Accommodation: accommodation.default,
}))

export async function renderPage(pathname: string) {
  // Resolve public route components before rendering so every page is visible
  // in plain HTML. The client still loads these routes and Leaflet separately.
  const prerenderPages = await pagesReady
  return renderToString(
    <StaticRouter location={pathname}>
      <App prerenderPages={prerenderPages} />
    </StaticRouter>,
  )
}

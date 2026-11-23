import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageSeo, renderSeoHead } from './seo'

export default function PageMetadata() {
  const { pathname } = useLocation()
  useEffect(() => {
    const template = document.createElement('template')
    template.innerHTML = renderSeoHead(getPageSeo(pathname))
    document.head
      .querySelectorAll(
        'title, link[rel="canonical"], meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], #structured-data',
      )
      .forEach((element) => element.remove())
    document.head.append(template.content)
  }, [pathname])
  return null
}

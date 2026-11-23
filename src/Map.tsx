import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { LocateFixed, Maximize2, Minimize2, Mountain, RotateCcw, X } from 'lucide-react'
import type { Place } from './data'
import { Link } from 'react-router-dom'
import { placePath } from './seo'

const categoryPaths: Record<string, string> = {
  Planine: '<path d="m3 20 7-16 4 9 3-6 5 13H3Z"/><path d="m7 11 3 2 3-2"/>',
  Priroda: '<path d="m12 3-7 9h4l-5 6h7v3h2v-3h7l-5-6h4L12 3Z"/>',
  'Jezera i reke':
    '<path d="M3 8c3-4 6 4 9 0s6 4 9 0M3 14c3-4 6 4 9 0s6 4 9 0M3 20c3-4 6 4 9 0s6 4 9 0"/>',
  Kultura: '<path d="M3 21h18M5 21V9h14v12M3 9l9-6 9 6H3ZM9 12v5m6-5v5"/>',
  Gradovi: '<path d="M3 21h18M5 21V5h9v16m0-12h5v12M8 8h3m-3 4h3m-3 4h3"/>',
  Smeštaj: '<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/>',
}

function markerIcon(place: Place, active: boolean) {
  return L.divIcon({
    className: 'place-marker-wrapper',
    html: `<span class="place-marker ${active ? 'is-active' : ''} ${place.category === 'Jezera i reke' ? 'water-marker' : ''} ${place.category === 'Kultura' ? 'culture-marker' : ''}" aria-hidden="true"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${categoryPaths[place.category]}</svg></span>`,
    iconSize: [40, 46],
    iconAnchor: [20, 43],
    tooltipAnchor: [0, -42],
  })
}

interface Props {
  places: Place[]
  selected: string | null
  onSelect: (id: string) => void
  onLocate: () => void
  userLocation: [number, number] | null
}

export default function SerbiaMap({ places, selected, onSelect, onLocate, userLocation }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markerLayer = useRef<L.LayerGroup | null>(null)
  const userMarker = useRef<L.CircleMarker | null>(null)
  const [fullScreen, setFullScreen] = useState(false)
  const [tileError, setTileError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const activePlace = places.find((p) => p.id === selected)

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, {
      center: [44.15, 20.6],
      zoom: 7,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
      zoomSnap: 0.25,
    })
    map.current = instance
    const tiles = L.tileLayer(
      import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          import.meta.env.VITE_MAP_ATTRIBUTION ||
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      },
    ).addTo(instance)
    let errors = 0
    tiles.on('tileerror', () => {
      if (++errors > 3) setTileError(true)
    })
    tiles.on('load', () => {
      if (errors === 0) setTileError(false)
    })
    L.control
      .zoom({ position: 'bottomright', zoomInTitle: 'Uvećaj mapu', zoomOutTitle: 'Umanji mapu' })
      .addTo(instance)
    markerLayer.current = L.layerGroup().addTo(instance)
    const resize = new ResizeObserver(() => instance.invalidateSize())
    resize.observe(container.current)
    return () => {
      resize.disconnect()
      instance.remove()
      map.current = null
    }
  }, [retryCount])

  useEffect(() => {
    const instance = map.current
    const layer = markerLayer.current
    if (!instance || !layer) return
    const render = () => {
      layer.clearLayers()
      const groups: { places: Place[]; point: L.Point }[] = []
      for (const place of places) {
        const point = instance.project(place.coordinates, instance.getZoom())
        const nearby =
          place.id !== selected &&
          groups.find(
            (group) =>
              group.places.every((p) => p.id !== selected) && group.point.distanceTo(point) < 42,
          )
        if (nearby) {
          nearby.point = nearby.point
            .multiplyBy(nearby.places.length)
            .add(point)
            .divideBy(nearby.places.length + 1)
          nearby.places.push(place)
        } else groups.push({ places: [place], point })
      }
      for (const group of groups) {
        if (group.places.length > 1) {
          const label = `${group.places.length} mesta u blizini. Uvećaj mapu.`
          const cluster = L.marker(instance.unproject(group.point, instance.getZoom()), {
            icon: L.divIcon({
              className: 'place-cluster-wrapper',
              html: `<span class="place-cluster">${group.places.length}</span>`,
              iconSize: [42, 42],
              iconAnchor: [21, 21],
            }),
            title: label,
            alt: label,
          })
            .bindTooltip(label, { direction: 'top', className: 'place-tooltip' })
            .on('click', () =>
              instance.fitBounds(L.latLngBounds(group.places.map((p) => p.coordinates)), {
                padding: [70, 70],
                maxZoom: 12,
              }),
            )
            .addTo(layer)
          cluster.getElement()?.setAttribute('aria-label', label)
        } else {
          const place = group.places[0]
          const marker = L.marker(place.coordinates, {
            icon: markerIcon(place, place.id === selected),
            title: place.name,
            alt: place.name,
            riseOnHover: true,
            zIndexOffset: place.id === selected ? 1000 : 0,
          })
            .bindTooltip(place.name, { direction: 'top', className: 'place-tooltip' })
            .on('click', () => selectRef.current(place.id))
            .addTo(layer)
          marker.getElement()?.setAttribute('aria-label', `Prikaži: ${place.name}`)
        }
      }
    }
    render()
    instance.on('zoomend', render)
    return () => {
      instance.off('zoomend', render)
    }
  }, [places, selected, retryCount])

  useEffect(() => {
    if (activePlace && map.current)
      map.current.panTo(activePlace.coordinates, { animate: true, duration: 0.5 })
  }, [activePlace])

  useEffect(() => {
    if (!map.current || !userLocation) return
    userMarker.current?.remove()
    userMarker.current = L.circleMarker(userLocation, {
      radius: 8,
      color: 'white',
      weight: 3,
      fillColor: '#3e7edf',
      fillOpacity: 1,
    })
      .addTo(map.current)
      .bindTooltip('Tvoja lokacija')
    map.current.setView(userLocation, 9)
  }, [userLocation, retryCount])

  useEffect(() => {
    if (!fullScreen) return
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullScreen(false)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', keyHandler)
    }
  }, [fullScreen])

  const reset = () => {
    if (places.length && map.current)
      map.current.fitBounds(L.latLngBounds(places.map((p) => p.coordinates)), {
        padding: [65, 65],
        maxZoom: 9,
        animate: true,
      })
  }

  return (
    <div className={`map-shell ${fullScreen ? 'map-fullscreen' : ''}`}>
      <div
        ref={container}
        className="leaflet-map"
        aria-label="Interaktivna mapa destinacija u Srbiji"
      />
      <div className="map-heading">
        <span className="live-dot" />
        <span>Srbija, na dlanu</span>
      </div>
      <div className="map-actions">
        <button
          onClick={onLocate}
          className="map-control"
          aria-label="Pronađi moju lokaciju"
          title="Moja lokacija"
        >
          <LocateFixed size={19} />
        </button>
        <button
          onClick={reset}
          className="map-control"
          aria-label="Prikaži sva mesta"
          title="Prikaži sva mesta"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setFullScreen(!fullScreen)}
          className="map-control"
          aria-label={fullScreen ? 'Zatvori pun ekran' : 'Mapa preko celog ekrana'}
        >
          {fullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
      {activePlace && (
        <div className="map-preview">
          <img src={activePlace.image.replace('.jpg', '-600.webp')} alt={activePlace.imageAlt} />
          <Link className="map-preview-content" to={placePath(activePlace)}>
            <span>{activePlace.region}</span>
            <strong>{activePlace.name}</strong>
            <small>
              Pogledaj mesto <span>↗</span>
            </small>
          </Link>
          <button
            className="preview-close"
            onClick={() => onSelect('')}
            aria-label="Zatvori pregled"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {tileError && (
        <div className="map-error" role="status">
          Mapa se trenutno ne učitava. Mesta možeš istražiti kroz kartice.
          <button
            onClick={() => {
              setTileError(false)
              setRetryCount((n) => n + 1)
            }}
          >
            Pokušaj ponovo
          </button>
        </div>
      )}
      {!activePlace && !tileError && (
        <div className="map-tip">
          <Mountain size={16} />
          <span>Velike priče počinju malim skretanjem.</span>
        </div>
      )}
    </div>
  )
}

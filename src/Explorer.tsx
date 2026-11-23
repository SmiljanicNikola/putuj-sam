import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Compass,
  LayoutGrid,
  LocateFixed,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { CategoryIcon, Dialog, Photo, PlaceCard } from './components'
import { categories, destinations, normalize, regions, type Category } from './data'
import { placePath } from './seo'

const SerbiaMap = lazy(() => import('./Map'))

interface Props {
  saved: string[]
  onSave: (id: string) => void
  onNotify: (message: string) => void
}

function distanceKm(point: [number, number], other: [number, number]) {
  const rad = (n: number) => (n * Math.PI) / 180
  const a =
    Math.sin(rad(other[0] - point[0]) / 2) ** 2 +
    Math.cos(rad(point[0])) * Math.cos(rad(other[0])) * Math.sin(rad(other[1] - point[1]) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function Explorer({ saved, onSave, onNotify }: Props) {
  const [params, setParams] = useSearchParams()
  const category = (params.get('kategorija') || 'Sve') as Category
  const search = params.get('q') || ''
  const region = params.get('region') || ''
  const [sort, setSort] = useState('recommended')
  const [selected, setSelected] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState('list')
  const [filterOpen, setFilterOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [onlySaved, setOnlySaved] = useState(false)
  const [shortTrip, setShortTrip] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  useEffect(() => setMapReady(true), [])
  const updateParam = (key: string, value: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value && value !== 'Sve') next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }
  const places = useMemo(() => {
    const filtered = destinations.filter(
      (place) =>
        (category === 'Sve' || place.category === category) &&
        (!region || place.region === region) &&
        (!search ||
          normalize(
            [place.name, place.subtitle, place.region, ...place.highlights].join(' '),
          ).includes(normalize(search))) &&
        (!onlySaved || saved.includes(place.id)) &&
        (!shortTrip || place.duration === '1 dan' || place.duration === '1–2 dana'),
    )
    if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'sr'))
    if (sort === 'nearby' && userLocation)
      filtered.sort(
        (a, b) => distanceKm(userLocation, a.coordinates) - distanceKm(userLocation, b.coordinates),
      )
    return filtered
  }, [category, region, search, onlySaved, shortTrip, saved, sort, userLocation])
  const activeFilters = Number(!!region) + Number(onlySaved) + Number(shortTrip)
  const clear = () => {
    setParams({}, { replace: true })
    setOnlySaved(false)
    setShortTrip(false)
    setSort('recommended')
  }

  useEffect(() => {
    setSelected(null)
  }, [category, region, search])

  const locate = () => {
    if (!navigator.geolocation) {
      onNotify('Tvoj pregledač ne podržava pronalaženje lokacije.')
      return
    }
    onNotify('Pronalaženje lokacije… Dozvoli pristup lokaciji u pregledaču.')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
        setSort('nearby')
        onNotify('Mesta su poređana po udaljenosti od tvoje lokacije.')
      },
      (error) =>
        onNotify(
          error.code === 1
            ? 'Pristup lokaciji nije dozvoljen. Možeš da izabereš region.'
            : 'Lokacija nije dostupna. Pokušaj ponovo ili izaberi region.',
        ),
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  return (
    <>
      <section className="explore-hero container">
        <div className="explore-hero-copy">
          <div className="eyebrow">
            <span className="tiny-sun">✳</span> MALA SKRETANJA. VELIKI DOŽIVLJAJI.
          </div>
          <h1>
            Srbija, <em>tvojim tempom.</em>
          </h1>
          <p>
            Od poznatih predela do skrivenih kutaka. Pronađi mesta koja te zovu, sačuvaj favorite i
            kreni svojim putem.
          </p>
          <div className="hero-note">
            <span className="note-line" />
            <span>Za vikend, za jedan dan, za sebe.</span>
          </div>
        </div>
        <Link
          className="hero-postcard"
          to={placePath(destinations[1])}
          aria-label="Otkrij meandre Uvca"
        >
          <Photo
            src="/images/uvac.jpg"
            srcSet="/images/uvac-600.webp 600w, /images/uvac.webp 1400w"
            sizes="(max-width: 700px) 90vw, 40vw"
            alt="Meandri Uvca, zelena reka koja vijuga kroz kanjon"
            width="1400"
            height="665"
            fetchPriority="high"
          />
          <div className="postcard-caption">
            <div>
              <span>NE TAKO DALEKO. SASVIM DRUGAČIJE.</span>
              <strong>
                Meandri Uvca <MapPin size={13} />
              </strong>
            </div>
            <span className="postcard-arrow">
              <ArrowUpRight size={19} />
            </span>
          </div>
          <span className="postcard-stamp">
            <Compass size={27} strokeWidth={1} />
            <span>
              ISTRAŽI
              <br />
              SRBIJU
            </span>
          </span>
        </Link>
      </section>

      <section className="explorer-section container" aria-label="Istraži Srbiju">
        <div className="explorer-heading">
          <div className="view-tabs">
            <Link to="/" className="active">
              <Compass size={17} />
              Destinacije
            </Link>
            <Link to="/smestaj">
              <MapPin size={17} />
              Smeštaj
            </Link>
          </div>
          <Link to="/inspiracija" className="text-link inspiration-link">
            <Sparkles size={15} /> Malo inspiracije <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="search-bar">
          <div className="search-input">
            <Search size={20} />
            <label className="sr-only" htmlFor="place-search">
              Pretraži destinacije i mesta
            </label>
            <input
              id="place-search"
              type="search"
              placeholder="Koje mesto ti je na umu?"
              value={search}
              onChange={(event) => updateParam('q', event.target.value)}
            />
            {search && (
              <button aria-label="Obriši pretragu" onClick={() => updateParam('q', '')}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="region-select">
            <MapPin size={17} />
            <label className="sr-only" htmlFor="region">
              Izaberi region
            </label>
            <select
              id="region"
              value={region}
              onChange={(event) => updateParam('region', event.target.value)}
            >
              <option value="">Cela Srbija</option>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
          <button className="nearby-button" onClick={locate} aria-label="Blizu mene">
            <LocateFixed size={17} />
            <span>Blizu mene</span>
          </button>
          <button
            className={`filter-button ${activeFilters ? 'has-filters' : ''}`}
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal size={17} />
            <span>Filteri</span>
            {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
          </button>
        </div>
        <div className="category-pills" aria-label="Kategorije destinacija">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => updateParam('kategorija', item)}
              aria-pressed={category === item}
            >
              <CategoryIcon category={item} size={17} />
              {item === 'Sve' ? 'Sve destinacije' : item}
            </button>
          ))}
        </div>
        <div className="results-bar">
          <p>
            <strong>{places.length} mesta</strong> za tvoju sledeću priču{' '}
            {search && <span>· „{search}“</span>}
          </p>
          <div className="sort-select">
            <label htmlFor="sort">Poređaj:</label>
            <select
              id="sort"
              aria-label="Poređaj mesta"
              value={sort}
              onChange={(e) => {
                if (e.target.value === 'nearby' && !userLocation) locate()
                else setSort(e.target.value)
              }}
            >
              <option value="recommended">Naš izbor</option>
              <option value="name">Naziv A–Š</option>
              <option value="nearby">Najbliže tebi</option>
            </select>
            <ChevronDown size={13} />
          </div>
        </div>
        <div className="mobile-map-switch">
          <button
            className={mobileView === 'list' ? 'active' : ''}
            onClick={() => setMobileView('list')}
          >
            <LayoutGrid size={16} />
            Mesta
          </button>
          <button
            className={mobileView === 'map' ? 'active' : ''}
            onClick={() => setMobileView('map')}
          >
            <Map size={16} />
            Mapa
          </button>
        </div>
        <div className={`explorer-grid mobile-show-${mobileView}`}>
          <div className="destination-list">
            {places.length ? (
              <div className="card-grid">
                {places.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    saved={saved.includes(place.id)}
                    active={place.id === selected}
                    onSave={() => onSave(place.id)}
                    onSelect={() => setSelected(place.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Compass size={35} strokeWidth={1} />
                <h3>Još jedno skretanje?</h3>
                <p>Nema mesta za ovu pretragu. Probaj drugi pojam ili proširi izbor.</p>
                <button className="button button-green" onClick={clear}>
                  Prikaži sva mesta <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
          {mapReady ? (
            <Suspense fallback={<MapPlaceholder />}>
              <SerbiaMap
                places={places}
                selected={selected}
                onSelect={setSelected}
                onLocate={locate}
                userLocation={userLocation}
              />
            </Suspense>
          ) : (
            <MapPlaceholder />
          )}
        </div>
        <div className="explorer-bottom">
          <span>
            <Check size={14} /> Pažljivo odabrana mesta. Sloboda da izabereš svoj put.
          </span>
          <span>Pronađi. Sačuvaj. Otputuj.</span>
        </div>
      </section>
      {filterOpen && (
        <Dialog
          title="Filteri pretrage"
          onClose={() => setFilterOpen(false)}
          className="filter-dialog"
        >
          <div className="eyebrow">TVOJ PUT, TVOJ IZBOR</div>
          <h2>Šta ti je na umu?</h2>
          <p className="muted">Prilagodi mesta svom sledećem putovanju.</p>
          <label className="form-label" htmlFor="filter-region">
            Region
          </label>
          <select
            className="form-select"
            id="filter-region"
            value={region}
            onChange={(e) => updateParam('region', e.target.value)}
          >
            <option value="">Cela Srbija</option>
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={onlySaved}
              onChange={(e) => setOnlySaved(e.target.checked)}
            />
            <span>
              Samo moja sačuvana mesta<small>Tvoji favoriti, na jednom mestu.</small>
            </span>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={shortTrip}
              onChange={(e) => setShortTrip(e.target.checked)}
            />
            <span>
              Za dan ili vikend<small>Mesta za koja preporučujemo 1–2 dana.</small>
            </span>
          </label>
          <div className="dialog-actions">
            <button className="text-link" onClick={clear}>
              Poništi filtere
            </button>
            <button className="button button-green" onClick={() => setFilterOpen(false)}>
              Prikaži mesta ({places.length}) <ArrowRight size={16} />
            </button>
          </div>
        </Dialog>
      )}
    </>
  )
}

function MapPlaceholder() {
  return (
    <div className="map-shell map-placeholder">
      <Map size={34} strokeWidth={1.3} aria-hidden="true" />
      <p>Interaktivna mapa destinacija</p>
      <span>Lokacije možeš istražiti i kroz kartice mesta.</span>
    </div>
  )
}

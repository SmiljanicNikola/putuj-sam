import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  Heart,
  Menu,
  Mountain,
  Route as RouteIcon,
  Tag,
  X,
} from 'lucide-react'
import { Brand, Dialog, Photo, PlaceCard } from './components'
import { allPlaces, type Place } from './data'
import Planner from './Planner'
import { SaleDialog, SaleFooter, SaleNotice } from './SaleNotice'
import PageMetadata from './PageMetadata'
import PlacePage from './PlacePage'
import NotFound from './NotFound'
import { placePath } from './seo'

const Explorer = lazy(() => import('./Explorer'))
const Inspiration = lazy(() => import('./Inspiration'))
const Accommodation = lazy(() => import('./Accommodation'))

type InfoPage = 'about' | 'privacy' | 'terms' | 'credits'
interface Credit {
  image: string
  place: string
  author: string
  license: string
  licenseUrl: string
  source: string
}
const infoTitles: Record<InfoPage, string> = {
  about: 'Putuj sam. Putuj po svom.',
  privacy: 'Tvoja privatnost',
  terms: 'Dobro je znati',
  credits: 'Ljudi iza fotografija',
}
function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('putujsam-saved') || '[]')
    return Array.isArray(value)
      ? value.filter(
          (id): id is string => typeof id === 'string' && allPlaces.some((p) => p.id === id),
        )
      : []
  } catch {
    return []
  }
}

function Information({ page, onClose }: { page: InfoPage; onClose: () => void }) {
  const [credits, setCredits] = useState<Credit[]>([])
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (page !== 'credits') return
    const controller = new AbortController()
    fetch('/image-credits.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error()
        return response.json()
      })
      .then(setCredits)
      .catch((error) => {
        if (error.name !== 'AbortError') setFailed(true)
      })
    return () => controller.abort()
  }, [page])
  return (
    <Dialog title={infoTitles[page]} onClose={onClose} className="info-dialog">
      <Brand />
      <h2>{infoTitles[page]}</h2>
      {page === 'about' && (
        <>
          <p>
            Verujemo da za veliku priču ne moraš daleko. Nekad je dovoljan slobodan dan, radoznalost
            i jedno skretanje sa poznatog puta.
          </p>
          <p>
            Putuj sam je vodič za samostalno istraživanje Srbije. Ovde pronalaziš mesta, povezuješ
            ih na mapi i praviš plan koji ima smisla za tebe.
          </p>
          <p>
            „Sam“ znači da biraš svoj put. Možeš da kreneš solo, sa društvom ili sa nekim koga
            voliš. Važan je tvoj tempo.
          </p>
          <div className="info-callout">
            <Mountain size={23} /> Manje čekanja na pravi trenutak. Više odlazaka.
          </div>
        </>
      )}
      {page === 'privacy' && (
        <>
          <p>
            Sačuvana mesta ostaju u lokalnoj memoriji ovog pregledača. Ne pravimo nalog i ne šaljemo
            tvoju listu na server. Možeš ih obrisati sa stranice „Sačuvano“ ili kroz podešavanja
            pregledača.
          </p>
          <p>
            Ako izabereš „Blizu mene“, pregledač traži dozvolu za pristup lokaciji. Koordinate
            koristimo u ovoj sesiji za prikaz i sortiranje mesta. Ne čuvamo ih na serveru.
          </p>
          <p>
            Interaktivna mapa učitava podloge sa servisa OpenStreetMap. Taj servis prima standardne
            podatke mrežnog zahteva, uključujući IP adresu. Otvaranje zvaničnih sajtova i Google
            mapa podleže pravilima tih servisa.
          </p>
          <p>
            Fotografije i fontove učitavamo sa ovog sajta. Ova verzija ne koristi reklamne kolačiće
            ili analitiku.
          </p>
          <p>
            Kontakt linkovi otvaraju aplikaciju za pozive ili email na tvom uređaju. Upit nije
            poslat samim otvaranjem linka. Podatke koje pošalješ koristimo za odgovor i dogovor o
            saradnji; upiti i prilozi se ne objavljuju automatski na sajtu.
          </p>
        </>
      )}
      {page === 'terms' && (
        <>
          <p>
            Putuj sam je vodič sa odabranim destinacijama i predlozima ruta. Svaki putnik sam bira
            raspored, prevoz i uslove putovanja.
          </p>
          <p>
            Podatke o radnom vremenu, ulaznicama, stanju staza i lokalnim pravilima proveri preko
            zvaničnih linkova u opisu mesta. Vremenske prilike i uslovi na terenu mogu da se
            promene.
          </p>
          <p>
            Stranica „Smeštaj“ poziva vlasnike da predstave svoj objekat. Zamućene kartice su
            ilustracija budućih profila i ne predstavljaju objavljene objekte. Profil se objavljuje
            nakon dogovora sa vlasnikom i pregleda dostavljenih podataka.
          </p>
          <p>
            Za objavljene objekte, rezervacije, cene i raspoloživost dogovaraš direktno sa smeštajem
            preko njegovog sajta ili kontakta. Putuj sam ne obrađuje rezervacije.
          </p>
          <p>
            Predložene rute su početna ideja za samostalno putovanje. Trajanje vožnje i prohodnost
            puteva proveri pre polaska.
          </p>
        </>
      )}
      {page === 'credits' && (
        <>
          <p>
            Prave fotografije mesta u Srbiji, zahvaljujući autorima sa Wikimedia Commons.
            Fotografije su prilagođene za prikaz na sajtu (veličina, kompresija i kadriranje).
          </p>
          {failed && (
            <p>
              Spisak trenutno nije dostupan.{' '}
              <a href="/image-credits.json">Otvori podatke o fotografijama.</a>
            </p>
          )}
          {!credits.length && !failed && <p>Učitavanje autora…</p>}
          <div className="credit-list">
            {credits.map((credit) => (
              <div key={credit.image}>
                <Photo src={credit.image} alt={credit.place} width="72" height="52" />
                <div>
                  <strong>{credit.place}</strong>
                  <span>{credit.author}</span>
                  <a href={credit.source} target="_blank" rel="noopener noreferrer">
                    {credit.license} · Izvor <ArrowUpRight size={12} />
                  </a>
                  {credit.licenseUrl && (
                    <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">
                      Uslovi licence
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Dialog>
  )
}

function SavedPlaces({
  saved,
  onSave,
  onPlan,
}: {
  saved: string[]
  onSave: (id: string) => void
  onPlan: () => void
}) {
  const places = allPlaces.filter((p) => saved.includes(p.id))
  return (
    <section className="saved-page container">
      <div className="eyebrow">MESTA KOJA TE ZOVU</div>
      <div className="section-heading">
        <h1>
          Tvoja mala <em>lista želja.</em>
        </h1>
        {places.length > 0 && (
          <button className="button button-green" onClick={onPlan}>
            Poveži ih u putovanje <ArrowUpRight size={17} />
          </button>
        )}
      </div>
      <p className="muted">
        {places.length
          ? `${places.length} sačuvanih mesta. Sledeće putovanje već ima dobar početak.`
          : 'Pronađi mesto koje ti se dopada i dodirni srce. Sačekaće te ovde.'}
      </p>
      {places.length ? (
        <div className="saved-grid">
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              saved
              onSave={() => onSave(place.id)}
              editorial
            />
          ))}
        </div>
      ) : (
        <div className="saved-empty">
          <Heart size={48} strokeWidth={1} />
          <h2>
            Neka sledeći put bude <em>tvoj.</em>
          </h2>
          <p>Od Tare do Dunava — otkrij svoje omiljeno mesto.</p>
          <Link to="/" className="button button-green">
            Istraži destinacije <ArrowRight size={17} />
          </Link>
        </div>
      )}
      <p className="saved-local-note">Tvoja lista se čuva u ovom pregledaču, na ovom uređaju.</p>
    </section>
  )
}

export default function App({
  prerenderPages,
}: {
  prerenderPages?: {
    Explorer: typeof import('./Explorer').default
    Inspiration: typeof import('./Inspiration').default
    Accommodation: typeof import('./Accommodation').default
  }
} = {}) {
  const ExplorerPage = prerenderPages?.Explorer || Explorer
  const InspirationPage = prerenderPages?.Inspiration || Inspiration
  const AccommodationPage = prerenderPages?.Accommodation || Accommodation
  const [saved, setSaved] = useState<string[]>([])
  const [savedReady, setSavedReady] = useState(false)
  const [toast, setToast] = useState('')
  const [info, setInfo] = useState<InfoPage | null>(null)
  const [saleOpen, setSaleOpen] = useState(false)
  const [planner, setPlanner] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const editorial = location.pathname === '/inspiracija'

  useEffect(() => {
    setSaved(readSaved())
    setSavedReady(true)
  }, [])
  useEffect(() => {
    const legacyId = new URLSearchParams(location.search).get('mesto')
    const legacyPlace = allPlaces.find((place) => place.id === legacyId)
    if (legacyPlace) navigate(placePath(legacyPlace), { replace: true })
  }, [location.search, navigate])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 4500)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    if (!savedReady) return
    try {
      localStorage.setItem('putujsam-saved', JSON.stringify(saved))
    } catch {
      setToast('Pregledač ne dozvoljava čuvanje. Lista je dostupna dok je stranica otvorena.')
    }
  }, [saved, savedReady])
  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key === 'putujsam-saved') setSaved(readSaved())
    }
    window.addEventListener('storage', synchronize)
    return () => window.removeEventListener('storage', synchronize)
  }, [])
  useEffect(() => {
    setMenu(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])
  useEffect(() => {
    if (!menu) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [menu])
  const toggleSaved = (id: string) => {
    const exists = saved.includes(id)
    setSaved((current) => (exists ? current.filter((item) => item !== id) : [...current, id]))
    setToast(
      exists ? 'Mesto je uklonjeno iz sačuvanih.' : 'Mesto je sačuvano za tvoju sledeću priču.',
    )
  }
  const openDetails = (place: Place) => navigate(placePath(place))
  return (
    <>
      <PageMetadata />
      <a href="#main-content" className="skip-link">
        Pređi na sadržaj
      </a>
      <SaleNotice />
      <header className="site-header">
        <div className="nav-container container">
          <Link to="/" aria-label="Putuj sam — početna">
            <Brand />
          </Link>
          <nav
            className={menu ? 'main-nav mobile-open' : 'main-nav'}
            aria-label="Glavna navigacija"
            id="main-navigation"
            onClick={() => setMenu(false)}
          >
            <NavLink to="/" end>
              Destinacije
            </NavLink>
            <NavLink to="/smestaj">Smeštaj</NavLink>
            <NavLink to="/inspiracija">
              Inspiracija
              <span className="nav-new-dot" />
            </NavLink>
            <button
              onClick={() => {
                setInfo('about')
                setMenu(false)
              }}
            >
              Naša priča
            </button>
            <button className="mobile-plan-link" onClick={() => setPlanner('west')}>
              Isplaniraj put <ArrowUpRight size={16} />
            </button>
          </nav>
          <div className="nav-actions">
            <NavLink
              to="/sacuvano"
              className="nav-saved"
              aria-label={`Sačuvana mesta (${saved.length})`}
            >
              <Heart size={19} />
              <span>Sačuvano</span>
              {saved.length > 0 && <span className="saved-count">{saved.length}</span>}
            </NavLink>
            <button
              className="nav-sale-button"
              onClick={() => setSaleOpen(true)}
              aria-label="Sajt i domen na prodaju — kontakt za kupovinu"
              aria-haspopup="dialog"
            >
              <Tag size={17} strokeWidth={1.7} aria-hidden="true" />
              <span className="nav-sale-copy">
                <span>Sajt i domen</span>
                <strong>Na prodaju</strong>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            <button
              className="menu-toggle"
              aria-label={menu ? 'Zatvori meni' : 'Otvori meni'}
              aria-expanded={menu}
              aria-controls="main-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content">
        <Suspense
          fallback={
            <section className="page-loading container" role="status">
              <Compass size={28} strokeWidth={1.2} />
              <p>Pronalazimo tvoj sledeći put…</p>
            </section>
          }
        >
          <Routes>
            <Route
              path="/"
              element={<ExplorerPage saved={saved} onSave={toggleSaved} onNotify={setToast} />}
            />
            <Route
              path="/smestaj"
              element={<AccommodationPage saved={saved} onSave={toggleSaved} />}
            />
            <Route
              path="/inspiracija"
              element={
                <InspirationPage
                  saved={saved}
                  onSave={toggleSaved}
                  onPlan={(region) => setPlanner(region || 'west')}
                />
              }
            />
            <Route
              path="/sacuvano"
              element={
                <SavedPlaces
                  saved={saved}
                  onSave={toggleSaved}
                  onPlan={() => setPlanner('saved')}
                />
              }
            />
            <Route
              path="/destinacije/:id"
              element={<PlacePage saved={saved} onSave={toggleSaved} onNotify={setToast} />}
            />
            <Route
              path="/smestaj/:id"
              element={<PlacePage saved={saved} onSave={toggleSaved} onNotify={setToast} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {!editorial && location.pathname !== '/smestaj' && (
          <section className="bottom-cta container">
            <div className="cta-doodle">
              <RouteIcon size={40} strokeWidth={1} />
            </div>
            <div>
              <h2>
                Najbolji su oni putevi <em>koji su tvoji.</em>
              </h2>
              <p>Mi smo tu da ti pomognemo da ih pronađeš.</p>
            </div>
            <button className="button button-green" onClick={() => setPlanner('west')}>
              Hajde da krenemo <ArrowUpRight size={17} />
            </button>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link to="/">
                <Brand light />
              </Link>
              <p>
                Negde blizu. Nešto posebno.
                <br />
                Tvoj vodič za Srbiju, tvojim tempom.
              </p>
              <span className="footer-made">
                <span>✳</span> Stvoreno za radoznale.
              </span>
            </div>
            <div className="footer-link-group">
              <strong>Pronađi svoj put</strong>
              <Link to="/">Sve destinacije</Link>
              <Link to="/?kategorija=Priroda">Priroda i predah</Link>
              <Link to="/?kategorija=Gradovi">Gradske priče</Link>
              <Link to="/smestaj">Predstavite smeštaj</Link>
            </div>
            <div className="footer-link-group">
              <strong>Malo inspiracije</strong>
              <Link to="/inspiracija">Ideje za vikend</Link>
              <button onClick={() => setPlanner('west')}>Isplaniraj putovanje</button>
              <Link to="/sacuvano">Moja sačuvana mesta</Link>
              <button onClick={() => setInfo('about')}>Naša priča</button>
            </div>
            <div className="footer-note">
              <Compass size={26} strokeWidth={1} />
              <p>
                Srbija ima još toliko priča.
                <br />
                <em>Jedna od njih čeka baš tebe.</em>
              </p>
              <Link to="/inspiracija">
                Otkrij nešto novo <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <SaleFooter />
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Putuj sam. Svaki put počinje radoznalošću.</span>
            <div>
              <button onClick={() => setInfo('privacy')}>Privatnost</button>
              <button onClick={() => setInfo('terms')}>Dobro je znati</button>
              <button onClick={() => setInfo('credits')}>Fotografije i autori</button>
            </div>
            <span className="footer-country">
              <span className="live-dot" /> Srbija
            </span>
          </div>
        </div>
      </footer>
      {planner !== null && (
        <Planner
          saved={saved}
          initialRegion={planner}
          onClose={() => setPlanner(null)}
          onDetails={openDetails}
        />
      )}
      {info && <Information page={info} onClose={() => setInfo(null)} />}
      {saleOpen && <SaleDialog onClose={() => setSaleOpen(false)} />}
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        <Check size={16} />
        {toast}
      </div>
    </>
  )
}

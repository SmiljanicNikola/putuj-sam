import { ArrowLeft, ArrowUpRight, Check, Compass, Heart, MapPin, Share2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { CategoryIcon, Photo, PlaceCard } from './components'
import { allPlaces, destinations, mapsLink, type Place } from './data'
import { breadcrumbsFor, placeForPath, placePath } from './seo'
import NotFound from './NotFound'

export default function PlacePage({
  saved,
  onSave,
  onNotify,
}: {
  saved: string[]
  onSave: (id: string) => void
  onNotify: (message: string) => void
}) {
  const location = useLocation()
  const place = placeForPath(location.pathname)
  if (!place) return <NotFound />
  return <PlaceArticle place={place} saved={saved} onSave={onSave} onNotify={onNotify} />
}

function PlaceArticle({
  place,
  saved,
  onSave,
  onNotify,
}: {
  place: Place
  saved: string[]
  onSave: (id: string) => void
  onNotify: (message: string) => void
}) {
  const isStay = place.category === 'Smeštaj'
  const isSaved = saved.includes(place.id)
  const related = destinations
    .filter((item) => item.id !== place.id && item.region === place.region)
    .slice(0, 3)
  const nearbyStays = allPlaces
    .filter((item) => item.category === 'Smeštaj' && item.region === place.region)
    .slice(0, 2)
  const share = async () => {
    const url = new URL(placePath(place), window.location.origin).href
    try {
      if (navigator.share) await navigator.share({ title: `${place.name} — Putuj sam`, url })
      else {
        await navigator.clipboard.writeText(url)
        onNotify('Link je kopiran. Podeli svoju sledeću destinaciju.')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError')
        onNotify('Link možeš kopirati iz adresne trake pregledača.')
    }
  }
  return (
    <article className="place-page container">
      <nav className="place-breadcrumbs" aria-label="Putanja stranice">
        <ol>
          {breadcrumbsFor(place).map((item, index, items) => (
            <li key={item.path}>
              {index === items.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link to={item.path}>{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <header className="place-page-heading">
        <div>
          <div className="eyebrow">
            <MapPin size={14} />
            {place.region}
          </div>
          <h1>{place.name}</h1>
          <p>{place.subtitle}</p>
        </div>
        <button className="button button-outline" onClick={share}>
          <Share2 size={17} />
          Podeli
        </button>
      </header>
      <figure className="place-page-photo">
        <Photo
          src={place.image}
          alt={place.imageAlt}
          sizes="(max-width: 700px) 90vw, 1200px"
          fetchPriority="high"
          width="1400"
          height="850"
        />
        {place.imageIsIllustrative && (
          <figcaption>
            Fotografija prikazuje okolinu. Fotografije objekta pogledaj na njegovom zvaničnom sajtu.
          </figcaption>
        )}
      </figure>
      <div className="place-page-grid">
        <div className="place-page-copy">
          <section aria-labelledby="place-overview">
            <div className="eyebrow">{isStay ? 'SMEŠTAJ U SRBIJI' : 'UPOZNAJ DESTINACIJU'}</div>
            <h2 id="place-overview">{isStay ? 'O smeštaju' : 'Zašto posetiti ovo mesto'}</h2>
            <p>{place.description}</p>
          </section>
          <section aria-labelledby="place-highlights">
            <h2 id="place-highlights">{isStay ? 'Lokacija i okolina' : 'Šta videti i doživeti'}</h2>
            <ul className="highlight-list">
              {place.highlights.map((highlight) => (
                <li key={highlight}>
                  <Check size={18} aria-hidden="true" />
                  {highlight}
                </li>
              ))}
            </ul>
          </section>
          <section className="detail-tip" aria-labelledby="place-tip">
            <Compass size={25} aria-hidden="true" />
            <div>
              <h2 id="place-tip">Pre nego što kreneš</h2>
              <p>{place.tip}</p>
            </div>
          </section>
          <section aria-labelledby="place-directions">
            <h2 id="place-directions">{isStay ? 'Kako do smeštaja' : 'Kako stići'}</h2>
            <p>
              Otvori lokaciju u Google mapama i izaberi svoju polaznu tačku.{' '}
              {isStay
                ? 'Ponudu, cene i raspoloživost proveri direktno sa objektom.'
                : 'Pre polaska proveri pristup, radno vreme i aktuelna obaveštenja na zvaničnom sajtu.'}
            </p>
            <a
              href={mapsLink(place)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Pogledaj lokaciju u Google mapama <ArrowUpRight size={17} />
            </a>
          </section>
        </div>
        <aside className="place-summary" aria-label="Informacije za planiranje posete">
          <div className="eyebrow">TVOJ PUT, TVOJ TEMPO</div>
          <h2>Planiraj posetu</h2>
          <dl>
            <div>
              <dt>Region</dt>
              <dd>{place.region}</dd>
            </div>
            <div>
              <dt>Kategorija</dt>
              <dd>
                <CategoryIcon category={place.category} size={16} />
                {place.category}
              </dd>
            </div>
            <div>
              <dt>{isStay ? 'Dužina boravka' : 'Predlog trajanja'}</dt>
              <dd>{place.duration}</dd>
            </div>
          </dl>
          <a
            className="button button-green full-width"
            href={isStay ? place.source : mapsLink(place)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isStay ? 'Poseti sajt smeštaja' : 'Kako da stigneš'}
            <ArrowUpRight size={17} />
          </a>
          <button
            className={`button button-outline full-width ${isSaved ? 'is-saved' : ''}`}
            onClick={() => onSave(place.id)}
            aria-pressed={isSaved}
          >
            <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Sačuvano' : 'Sačuvaj mesto'}
          </button>
          <a
            className="official-source"
            href={place.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            Proveri informacije na zvaničnom sajtu
            <ArrowUpRight size={15} />
          </a>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="place-related" aria-labelledby="related-heading">
          <div className="section-heading">
            <div>
              <div className="eyebrow">U ISTOM REGIONU</div>
              <h2 id="related-heading">
                Još ideja za <em>putovanje.</em>
              </h2>
            </div>
            <Link className="text-link" to={`/?region=${encodeURIComponent(place.region)}`}>
              Istraži region <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="editorial-card-grid">
            {related.map((item) => (
              <PlaceCard
                key={item.id}
                place={item}
                saved={saved.includes(item.id)}
                onSave={() => onSave(item.id)}
                editorial
              />
            ))}
          </div>
        </section>
      )}
      {!isStay && nearbyStays.length > 0 && (
        <section className="place-stay-links" aria-labelledby="nearby-stays-heading">
          <h2 id="nearby-stays-heading">Smeštaj u regionu</h2>
          <div>
            {nearbyStays.map((item) => (
              <Link key={item.id} to={placePath(item)}>
                {item.name}
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        </section>
      )}
      {!isStay && nearbyStays.length === 0 && (
        <section className="place-listing-invitation" aria-labelledby="place-listing-heading">
          <div>
            <h2 id="place-listing-heading">Imate smeštaj u ovom regionu?</h2>
            <p>
              Predstavite svoj objekat putnicima koji istražuju{' '}
              {place.region === 'Vojvodina'
                ? 'Vojvodinu'
                : place.region === 'Zapadna Srbija'
                  ? 'zapadnu Srbiju'
                  : place.region === 'Istočna Srbija'
                    ? 'istočnu Srbiju'
                    : 'centralnu Srbiju'}
              . Javite se za dogovor o objavi.
            </p>
          </div>
          <Link
            className="button button-outline"
            to={`/smestaj?region=${encodeURIComponent(place.region)}`}
          >
            Predstavite smeštaj
            <ArrowUpRight size={17} />
          </Link>
        </section>
      )}
      <Link className="text-link place-back-link" to={isStay ? '/smestaj' : '/'}>
        <ArrowLeft size={17} />
        {isStay ? 'Pogledaj sav smeštaj' : 'Vrati se na mapu destinacija'}
      </Link>
    </article>
  )
}

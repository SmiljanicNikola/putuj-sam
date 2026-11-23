import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  MapPin,
  MoveUpRight,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { CategoryIcon, Photo, PlaceCard } from './components'
import { destinations } from './data'
import { placePath } from './seo'

interface Props {
  saved: string[]
  onSave: (id: string) => void
  onPlan: (region?: string) => void
}

export default function Inspiration({ saved, onSave, onPlan }: Props) {
  const featured = [destinations[0], destinations[2], destinations[5]]
  return (
    <>
      <section className="inspiration-hero container">
        <div className="editorial-hero-image">
          <Photo
            src="/images/uvac.jpg"
            sizes="(max-width: 700px) 1100px, 90vw"
            alt="Pogled na kanjon Uvca i beloglavog supa"
            fetchPriority="high"
            width="1600"
            height="760"
          />
          <div className="editorial-hero-overlay" />
        </div>
        <div className="editorial-hero-content">
          <div className="eyebrow">
            <span>✳</span> NEGDE BLIZU. NEŠTO POSEBNO.
          </div>
          <h1>
            Ne moraš daleko
            <br />
            da bi stigao <em>negde novo.</em>
          </h1>
          <p>
            Dobrodošao u Srbiju koju vredi upoznati.
            <br />
            Jedan vikend. Jedno skretanje. Jedna nova priča.
          </p>
          <a href="#izdvojeno" className="button button-cream">
            Pronađi inspiraciju <ArrowDown size={17} />
          </a>
        </div>
        <Link className="editorial-location" to={placePath(destinations[1])}>
          <MapPin size={17} />
          <span>
            Meandri Uvca<small>Zapadna Srbija</small>
          </span>
          <ArrowUpRight size={19} />
        </Link>
        <div className="hero-index">
          <span>01</span>
          <span className="hero-index-line" />
          <span>SRBIJA, TVOJIM TEMPOM</span>
        </div>
      </section>

      <section className="editorial-intro container">
        <p>
          Za one koji vole <em>da skrenu sa puta.</em>
        </p>
        <span>
          Ne pravimo spisak mesta koja moraš da vidiš.
          <br />
          Pomažemo ti da pronađeš ona koja želiš.
        </span>
      </section>

      <section id="izdvojeno" className="editorial-section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PAŽLJIVO ODABRANO</div>
            <h2>
              Mesta koja ostaju <em>u tebi.</em>
            </h2>
          </div>
          <Link className="text-link" to="/">
            Sve destinacije <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="editorial-card-grid">
          {featured.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              saved={saved.includes(place.id)}
              onSave={() => onSave(place.id)}
              editorial
            />
          ))}
        </div>
      </section>

      <section className="weekend-section container">
        <div className="weekend-photo">
          <Photo
            src="/images/tara.jpg"
            alt="Livade i borova šuma na Mitrovcu na Tari"
            loading="lazy"
            width="800"
            height="600"
          />
          <span className="photo-coordinate">43°54′ N &nbsp; 19°25′ E</span>
          <span className="weekend-photo-tag">
            <Sparkles size={15} /> Odloži telefon. Zapamti trenutak.
          </span>
        </div>
        <div className="weekend-copy">
          <div className="eyebrow">IDEJA ZA SLEDEĆI VIKEND</div>
          <h2>
            Dva dana.
            <br />
            Bez žurbe.
            <br />
            <em>Samo ti i Tara.</em>
          </h2>
          <p>
            Jutro uz miris borova. Pogled koji traži da zastaneš. Kafa kojoj ne gledaš na sat. Nekad
            je za dobar vikend potrebno baš malo.
          </p>
          <div className="weekend-meta">
            <span>
              <Clock3 size={16} />2 dana
            </span>
            <span>
              <MapPin size={16} />
              Zapadna Srbija
            </span>
          </div>
          <button className="button button-green" onClick={() => onPlan('west')}>
            Isplaniraj ovaj vikend <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

      <section className="editorial-section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">KAKO TI SE DANAS PUTUJE?</div>
            <h2>
              Prati svoj <em>osećaj.</em>
            </h2>
          </div>
        </div>
        <div className="mood-grid">
          {[
            {
              category: 'Priroda' as const,
              title: 'Treba mi malo mira',
              subtitle: 'Šume, staze i tiši dani.',
              image: '/images/fruska-gora.jpg',
            },
            {
              category: 'Jezera i reke' as const,
              title: 'Negde pored vode',
              subtitle: 'Pronađi svoj odraz u prirodi.',
              image: '/images/drina.jpg',
            },
            {
              category: 'Kultura' as const,
              title: 'U potrazi za pričama',
              subtitle: 'Mesta koja čuvaju vreme.',
              image: '/images/golubac.jpg',
            },
          ].map((mood) => (
            <Link
              className="mood-card"
              key={mood.category}
              to={`/?kategorija=${encodeURIComponent(mood.category)}`}
            >
              <Photo src={mood.image} alt={mood.subtitle} loading="lazy" width="600" height="500" />
              <div className="mood-overlay" />
              <span className="mood-category">
                <CategoryIcon category={mood.category} size={18} />
                {mood.category}
              </span>
              <div className="mood-content">
                <h3>{mood.title}</h3>
                <p>{mood.subtitle}</p>
              </div>
              <span className="mood-arrow">
                <MoveUpRight size={22} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="map-invitation container">
        <div className="map-invitation-icon">
          <MapPin size={36} strokeWidth={1.1} />
        </div>
        <div>
          <div className="eyebrow">TVOJA SLEDEĆA PRIČA JE NEGDE OVDE</div>
          <h2>
            Voliš da vidiš <em>širu sliku?</em>
            <span> Sva mesta čekaju te na mapi.</span>
          </h2>
        </div>
        <Link to="/" className="button button-green">
          Otvori mapu <ArrowRight size={17} />
        </Link>
      </section>
    </>
  )
}

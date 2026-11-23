import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  House,
  Images,
  LockKeyhole,
  MapPin,
  MessageCircle,
} from 'lucide-react'
import { Dialog, Photo, PlaceCard } from './components'
import ContactLinks from './ContactLinks'
import { regions, stays } from './data'

const slots = [
  { type: 'Hotel', label: 'Hoteli i pansioni', image: '/images/tara.jpg' },
  { type: 'Apartmani', label: 'Apartmani i privatni smeštaj', image: '/images/fruska-gora.jpg' },
  {
    type: 'Etno-domaćinstvo',
    label: 'Etno-domaćinstva i seoski turizam',
    image: '/images/mokra-gora.jpg',
  },
  { type: 'Vikendica', label: 'Vikendice i kuće za odmor', image: '/images/rtanj.jpg' },
]

function listingMessage(type = '', region = '') {
  return {
    subject: `Upit za predstavljanje smeštaja na putujsam.com${type ? ` — ${type}` : ''}`,
    body: [
      'Poštovani,',
      '',
      'Želim da predstavim svoj smeštaj na sajtu putujsam.com.',
      '',
      'Naziv objekta: ',
      `Tip smeštaja: ${type}`,
      `Mesto / region: ${region}`,
      'Sajt ili link do fotografija: ',
      'Kontakt telefon: ',
      '',
      'Molim vas za informacije o uslovima predstavljanja.',
    ].join('\n'),
  }
}

function ListingDialog({
  type,
  region,
  onClose,
}: {
  type: string
  region: string
  onClose: () => void
}) {
  return (
    <Dialog title="Predstavljanje smeštaja" onClose={onClose} className="listing-dialog">
      <span className="listing-icon">
        <Building2 size={27} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div className="eyebrow">ZA VLASNIKE SMEŠTAJA</div>
      <h2>
        Vaš objekat.
        <br />
        <em>Naša sledeća preporuka.</em>
      </h2>
      <p>Kontaktirajte nas za dogovor o predstavljanju vašeg smeštaja na putujsam.com.</p>
      {(type || region) && (
        <div className="listing-context">
          {type && <span>{type}</span>}
          {region && (
            <span>
              <MapPin size={14} aria-hidden="true" />
              {region}
            </span>
          )}
        </div>
      )}
      <h3>Za prvi razgovor pripremite</h3>
      <ul className="listing-checklist">
        <li>
          <Check size={16} aria-hidden="true" />
          Naziv objekta i mesto u kom se nalazi
        </li>
        <li>
          <Check size={16} aria-hidden="true" />
          Kratak opis, fotografije ili link do sajta
        </li>
        <li>
          <Check size={16} aria-hidden="true" />
          Kontakt za dogovor o objavi
        </li>
      </ul>
      <ContactLinks
        purpose="listing"
        className="listing-contacts"
        {...listingMessage(type, region)}
      />
      <p className="listing-dialog-note">
        Uslove predstavljanja dogovaramo direktno sa vlasnikom. Profil se objavljuje nakon dogovora.
      </p>
    </Dialog>
  )
}

export default function Accommodation({
  saved,
  onSave,
}: {
  saved: string[]
  onSave: (id: string) => void
}) {
  const [params] = useSearchParams()
  const region = regions.find((item) => item === params.get('region')) || ''
  const [inquiry, setInquiry] = useState<string | null>(null)
  const openInquiry = (type = '') => setInquiry(type)
  return (
    <>
      <div className="accommodation-page container">
        <section className="listing-hero">
          <div className="listing-hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              ZA VLASNIKE SMEŠTAJA
            </div>
            <h1>
              Predstavite svoj
              <br />
              <em>smeštaj u Srbiji.</em>
            </h1>
            <p>
              Budite deo vodiča za samostalno istraživanje Srbije. Predstavite svoj objekat
              putnicima koji traže ideju za sledeći izlet, vikend ili odmor.
            </p>
            <div className="listing-hero-actions">
              <button
                className="button button-green"
                onClick={() => openInquiry()}
                aria-haspopup="dialog"
              >
                Zatražite objavu
                <ArrowUpRight size={18} />
              </button>
              <a className="text-link" href="#kako-se-objavljuje">
                Kako izgleda saradnja
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <aside className="listing-intro-panel" aria-label="Kontakt za predstavljanje smeštaja">
            <span className="listing-icon">
              <House size={29} strokeWidth={1.4} aria-hidden="true" />
            </span>
            <div className="eyebrow">MESTO ZA VAŠU PRIČU</div>
            <h2>
              Od dobrog domaćina
              <br />
              <em>do novog putovanja.</em>
            </h2>
            <p>
              Hoteli, apartmani, etno-domaćinstva i kuće za odmor — javite se za dogovor o
              predstavljanju.
            </p>
            <ContactLinks
              purpose="listing"
              className="listing-contacts"
              {...listingMessage('', region)}
            />
          </aside>
        </section>

        {stays.length > 0 && (
          <section className="published-stays" aria-labelledby="published-stays-heading">
            <div className="section-heading">
              <div>
                <div className="eyebrow">PREDSTAVLJENI OBJEKTI</div>
                <h2 id="published-stays-heading">
                  Smeštaj za vaš <em>sledeći put.</em>
                </h2>
              </div>
            </div>
            <div className="editorial-card-grid">
              {stays.map((place) => (
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
        )}

        <section className="listing-slots-section" aria-labelledby="listing-slots-heading">
          <div className="section-heading">
            <div>
              <div className="eyebrow">BUDUĆI PROFILI SMEŠTAJA</div>
              <h2 id="listing-slots-heading">
                Vaš smeštaj <em>ovde.</em>
              </h2>
            </div>
            <p>Prvi objekti se objavljuju nakon dogovora sa vlasnicima.</p>
          </div>
          <div className="listing-slots">
            {slots.map((slot) => (
              <article
                className="listing-placeholder"
                key={slot.type}
                aria-label={`Mesto za predstavljanje: ${slot.label}`}
              >
                <div className="listing-placeholder-image" aria-hidden="true">
                  <Photo
                    src={slot.image}
                    alt=""
                    sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 300px"
                    width="600"
                    height="420"
                    loading="lazy"
                  />
                  <div className="listing-placeholder-shade" />
                  <span className="listing-lock">
                    <LockKeyhole size={25} strokeWidth={1.5} />
                  </span>
                  <span className="listing-placeholder-tag">Mesto za vaš objekat</span>
                </div>
                <div className="listing-placeholder-body">
                  <span>{slot.label}</span>
                  <h3>Vaš smeštaj ovde</h3>
                  <p>Fotografije, opis i lokacija vašeg objekta na jednom mestu.</p>
                  <button
                    className="listing-request"
                    onClick={() => openInquiry(slot.type)}
                    aria-haspopup="dialog"
                  >
                    Zatražite objavu
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="listing-illustration-note">Ilustrativni prikaz budućih profila smeštaja.</p>
        </section>

        <section
          className="listing-process"
          id="kako-se-objavljuje"
          aria-labelledby="listing-process-heading"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow">OD PRVOG KONTAKTA DO OBJAVE</div>
              <h2 id="listing-process-heading">
                Jednostavan dogovor.
                <br />
                <em>Jasno predstavljanje.</em>
              </h2>
            </div>
          </div>
          <ol>
            <li>
              <span>01</span>
              <MessageCircle size={23} strokeWidth={1.5} aria-hidden="true" />
              <h3>Javite nam se</h3>
              <p>
                Pozovite nas ili pošaljite email sa nazivom objekta i lokacijom. Dogovaramo uslove
                predstavljanja.
              </p>
            </li>
            <li>
              <span>02</span>
              <Images size={23} strokeWidth={1.5} aria-hidden="true" />
              <h3>Predstavite svoj objekat</h3>
              <p>
                Pošaljite fotografije, kratak opis i kontakt za goste. Zajedno pripremamo sadržaj
                profila.
              </p>
            </li>
            <li>
              <span>03</span>
              <MapPin size={23} strokeWidth={1.5} aria-hidden="true" />
              <h3>Objavite svoju priču</h3>
              <p>
                Nakon dogovora i pregleda podataka, vaš profil dobija svoju stranicu i mesto uz
                destinacije u regionu.
              </p>
            </li>
          </ol>
        </section>

        <section className="listing-faq" aria-labelledby="listing-faq-heading">
          <div>
            <div className="eyebrow">PRE PRVOG RAZGOVORA</div>
            <h2 id="listing-faq-heading">
              Dobro je <em>znati.</em>
            </h2>
            <p>Imate dodatno pitanje? Kontakt je uvek na dohvat ruke.</p>
          </div>
          <div className="listing-faq-items">
            <details>
              <summary>
                Ko može da predstavi svoj smeštaj?
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>
                Vlasnici i ovlašćeni predstavnici hotela, apartmana, etno-domaćinstava, vikendica i
                drugih smeštajnih objekata u Srbiji.
              </p>
            </details>
            <details>
              <summary>
                Šta je potrebno za objavu?
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>
                Naziv objekta, lokacija, kratak opis, fotografije koje imate pravo da koristite i
                kontakt za goste. Detalje i uslove objave dogovaramo direktno.
              </p>
            </details>
            <details>
              <summary>
                Kako gosti stupaju u kontakt sa objektom?
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>
                Objavljeni profil vodi na vaš sajt ili kontakt. Rezervacije, cene i raspoloživost
                dogovarate direktno sa gostima.
              </p>
            </details>
          </div>
        </section>

        <section className="listing-bottom-contact" aria-labelledby="listing-contact-heading">
          <div>
            <div className="eyebrow">POČNIMO OD RAZGOVORA</div>
            <h2 id="listing-contact-heading">
              Vaše mesto.
              <br />
              <em>Na putu kroz Srbiju.</em>
            </h2>
            <p>Kontaktirajte nas za informacije o predstavljanju vašeg smeštaja.</p>
          </div>
          <ContactLinks
            purpose="listing"
            className="listing-contacts"
            {...listingMessage('', region)}
          />
        </section>
        <p className="listing-traveler-link">
          Tražite ideju za putovanje?{' '}
          <Link to="/">
            Istražite destinacije u Srbiji
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </p>
      </div>
      {inquiry !== null && (
        <ListingDialog type={inquiry} region={region} onClose={() => setInquiry(null)} />
      )}
    </>
  )
}

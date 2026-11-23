import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Compass,
  MapPin,
  Route,
  Trash2,
} from 'lucide-react'
import { Dialog, Photo } from './components'
import { allPlaces, destinations, routeLink, type Place } from './data'

const routeOptions: Record<string, { label: string; intro: string; ids: string[] }> = {
  west: {
    label: 'Zapadna Srbija',
    intro: 'Šume Tare, zelena Drina i jedan drugačiji ritam.',
    ids: ['tara', 'drina', 'mokra-gora'],
  },
  north: {
    label: 'Vojvodina',
    intro: 'Gradske šetnje i šumske staze, u istom vikendu.',
    ids: ['novi-sad', 'fruska-gora'],
  },
  east: {
    label: 'Istočna Srbija',
    intro: 'Dunav, tvrđave i prepoznatljiva silueta Rtnja.',
    ids: ['golubac', 'rtanj'],
  },
  saved: {
    label: 'Moja sačuvana mesta',
    intro: 'Tvoja omiljena mesta, povezana u novu priču.',
    ids: [],
  },
}

export default function Planner({
  saved,
  initialRegion,
  onClose,
  onDetails,
}: {
  saved: string[]
  initialRegion: string
  onClose: () => void
  onDetails: (place: Place) => void
}) {
  const [region, setRegion] = useState(initialRegion || 'west')
  const [origin, setOrigin] = useState('Beograd')
  const [days, setDays] = useState('2')
  const [plan, setPlan] = useState<Place[] | null>(null)
  const generate = () => {
    const selected =
      region === 'saved'
        ? allPlaces.filter((p) => saved.includes(p.id)).slice(0, 8)
        : routeOptions[region].ids.map((id) => destinations.find((p) => p.id === id)!)
    setPlan(selected.slice(0, region === 'saved' ? 8 : Number(days)))
  }
  const move = (index: number, direction: number) => {
    setPlan((current) => {
      if (!current) return current
      const next = [...current]
      ;[next[index], next[index + direction]] = [next[index + direction], next[index]]
      return next
    })
  }
  return (
    <Dialog title="Isplaniraj svoje putovanje" onClose={onClose} drawer className="planner-dialog">
      <div className="planner-icon">
        <Route size={26} strokeWidth={1.5} />
      </div>
      <div className="eyebrow">MANJE PLANIRANJA. VIŠE DOŽIVLJAJA.</div>
      <h2>
        Tvoj sledeći <em>mali beg.</em>
      </h2>
      <p className="muted">Izaberi pravac, poveži mesta i kreni svojim putem.</p>
      <div className="planner-fields">
        <label className="form-label" htmlFor="trip-origin">
          Odakle krećeš?
        </label>
        <select
          className="form-select"
          id="trip-origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        >
          {['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Čačak'].map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
        <label className="form-label" htmlFor="trip-region">
          Gde te put vodi?
        </label>
        <select
          className="form-select"
          id="trip-region"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value)
            setDays('2')
            setPlan(null)
          }}
        >
          {Object.entries(routeOptions).map(([id, item]) => (
            <option value={id} key={id} disabled={id === 'saved' && !saved.length}>
              {item.label}
              {id === 'saved' ? ` (${saved.length})` : ''}
            </option>
          ))}
        </select>
        {region !== 'saved' && (
          <>
            <label className="form-label" htmlFor="trip-days">
              Koliko dana imaš?
            </label>
            <select
              className="form-select"
              id="trip-days"
              value={days}
              onChange={(e) => {
                setDays(e.target.value)
                setPlan(null)
              }}
            >
              <option value="1">Jedan dan</option>
              <option value="2">Vikend · 2 dana</option>
              {region === 'west' && <option value="3">Produženi vikend · 3 dana</option>}
            </select>
          </>
        )}
        <button className="button button-green full-width" onClick={generate}>
          {plan ? 'Osveži moj plan' : 'Pronađi moj put'} <Compass size={18} />
        </button>
      </div>
      {plan && (
        <div className="generated-plan">
          <div className="plan-heading">
            <Check size={17} />
            <strong>Tvoja ideja za putovanje</strong>
          </div>
          <p>{routeOptions[region].intro}</p>
          <div className="plan-origin">
            <MapPin size={14} />
            Polazak: {origin}
          </div>
          <ol className="plan-stops">
            {plan.map((place, index) => (
              <li key={place.id}>
                <span className="stop-number">{index + 1}</span>
                <Photo src={place.image} alt={place.imageAlt} width="54" height="54" />
                <button
                  className="stop-details"
                  onClick={() => {
                    onClose()
                    onDetails(place)
                  }}
                >
                  <strong>{place.name}</strong>
                  <small>{place.region}</small>
                </button>
                <div className="stop-actions">
                  <button
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Pomeri ranije: ${place.name}`}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    disabled={index === plan.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Pomeri kasnije: ${place.name}`}
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => setPlan((current) => current!.filter((p) => p.id !== place.id))}
                    aria-label={`Ukloni iz plana: ${place.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {plan.length > 0 ? (
            <a
              className="button button-green full-width"
              href={routeLink(plan, origin)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Otvori rutu u Google mapama <ArrowUpRight size={17} />
            </a>
          ) : (
            <p className="muted">Plan je prazan. Ponovo pronađi svoj put.</p>
          )}
          <small className="plan-note">
            Ovo je predlog rute. U Google mapama proveri aktuelno vreme vožnje, pa prilagodi dnevni
            raspored sebi.
          </small>
        </div>
      )}
    </Dialog>
  )
}

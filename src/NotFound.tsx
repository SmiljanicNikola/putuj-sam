import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="not-found container">
      <div className="eyebrow">JEDNO POGREŠNO SKRETANJE · 404</div>
      <h1>
        Ovaj put još <em>nije ucrtan.</em>
      </h1>
      <p>Ali tvoje sledeće omiljeno mesto jeste.</p>
      <Link to="/" className="button button-green">
        Vrati se na mapu <ArrowRight size={17} />
      </Link>
    </section>
  )
}

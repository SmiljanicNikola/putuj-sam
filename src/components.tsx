import { useEffect, useRef, type ReactNode, type ImgHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Building2,
  Compass,
  Heart,
  Landmark,
  MapPin,
  Mountain,
  TreePine,
  Waves,
  X,
} from 'lucide-react'
import type { Category, Place } from './data'
import { placePath } from './seo'

export function Photo({ src, srcSet, sizes, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const variants = src?.endsWith('.jpg')
    ? `${src.replace('.jpg', '-600.webp')} 600w, ${src.replace('.jpg', '.webp')} 1400w`
    : undefined
  return (
    <img
      src={src}
      srcSet={srcSet || variants}
      sizes={sizes || '(max-width: 700px) 90vw, 50vw'}
      {...props}
    />
  )
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? 'brand-light' : ''}`}>
      <svg
        className="brand-symbol"
        width="36"
        height="39"
        viewBox="0 0 36 39"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 28C-1 18 17 20 21 10C25 0 37 5 29 14C24 20 11 21 14 32"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="9" cy="28" r="4.2" fill="#d99364" />
        <circle cx="25.5" cy="7" r="2.5" fill="currentColor" />
      </svg>
      <span>
        putuj<span className="brand-sam">sam</span>
        <span className="brand-dot">.</span>
      </span>
    </span>
  )
}

export function CategoryIcon({ category, size = 19 }: { category: Category; size?: number }) {
  const Icon = {
    Sve: Compass,
    Priroda: TreePine,
    Planine: Mountain,
    Gradovi: Building2,
    'Jezera i reke': Waves,
    Kultura: Landmark,
    Smeštaj: Building2,
  }[category]
  return <Icon size={size} strokeWidth={1.6} />
}

export function PlaceCard({
  place,
  saved,
  active,
  onSave,
  onSelect,
  editorial = false,
}: {
  place: Place
  saved: boolean
  active?: boolean
  onSave: () => void
  onSelect?: () => void
  editorial?: boolean
}) {
  return (
    <article
      className={`place-card ${active ? 'selected-card' : ''} ${editorial ? 'editorial-card' : ''}`}
      onMouseEnter={onSelect}
      onFocus={onSelect}
    >
      <div className="card-image-wrap">
        <Link
          className="card-image-button"
          to={placePath(place)}
          aria-label={`Otkrij: ${place.name}`}
        >
          <img
            src={place.image}
            srcSet={`${place.image.replace('.jpg', '-600.webp')} 600w, ${place.image.replace('.jpg', '.webp')} 1400w`}
            sizes={editorial ? '(max-width: 700px) 90vw, 33vw' : '(max-width: 900px) 45vw, 300px'}
            alt={place.imageAlt}
            loading="lazy"
            width="500"
            height="350"
          />
        </Link>
        {place.badge && (
          <span className="card-badge">
            {place.badge === 'Naš izbor' && <span>✦</span>}
            {place.badge}
          </span>
        )}
        {place.imageIsIllustrative && <span className="card-badge">Fotografija destinacije</span>}
        <button
          className={`save-button ${saved ? 'saved' : ''}`}
          aria-label={saved ? `Ukloni iz sačuvanih: ${place.name}` : `Sačuvaj: ${place.name}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <MapPin size={12} />
          <span>{place.region}</span>
        </div>
        <Link className="card-title" to={placePath(place)}>
          {place.name}
          <ArrowUpRight size={17} />
        </Link>
        <p>{place.subtitle}</p>
        <div className="card-bottom">
          <span>
            <CategoryIcon category={place.category} size={13} />
            {place.category}
          </span>
          <span>{place.duration}</span>
        </div>
      </div>
    </article>
  )
}

export function Dialog({
  title,
  children,
  onClose,
  className = '',
  drawer = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
  drawer?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    const lastFocused = document.activeElement as HTMLElement | null
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const element = ref.current!
    element.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
      if (event.key === 'Tab') {
        const focusable = Array.from(
          element.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex="0"]',
          ),
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
        const first = focusable[0],
          last = focusable.at(-1)
        if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === element)
        ) {
          event.preventDefault()
          last?.focus()
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === element)
        ) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKey)
      lastFocused?.focus()
    }
  }, [])
  return (
    <div
      className={`dialog-backdrop ${drawer ? 'drawer-backdrop' : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`dialog ${drawer ? 'drawer' : ''} ${className}`}
      >
        <button className="dialog-close" onClick={onClose} aria-label="Zatvori prozor">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

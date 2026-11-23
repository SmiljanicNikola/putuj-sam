import { Mail, Phone } from 'lucide-react'
import { businessContact, emailHref } from './contact'

export default function ContactLinks({
  purpose,
  subject,
  body,
  className,
}: {
  purpose: 'sale' | 'listing'
  subject: string
  body?: string
  className: string
}) {
  const context = purpose === 'listing' ? 'predstavljanju smeštaja' : 'kupovini sajta i domena'
  return (
    <div className={className}>
      <a
        href={businessContact.phoneHref}
        aria-label={`Pozovite ${businessContact.phone} za informacije o ${context}`}
      >
        <Phone size={16} strokeWidth={1.6} aria-hidden="true" />
        <span>{businessContact.phone}</span>
      </a>
      <a
        href={emailHref(subject, body)}
        aria-label={`Pošaljite upit o ${context} na ${businessContact.email}`}
      >
        <Mail size={17} strokeWidth={1.6} aria-hidden="true" />
        <span>{businessContact.email}</span>
      </a>
    </div>
  )
}

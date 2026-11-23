export const businessContact = {
  phone: '065 888 90 87',
  phoneHref: 'tel:+381658889087',
  email: 'nikola.kiki.00@gmail.com',
}

export function emailHref(subject: string, body?: string) {
  return `mailto:${businessContact.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`
}

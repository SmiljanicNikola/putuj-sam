import { Tag } from 'lucide-react'
import ContactLinks from './ContactLinks'
import { Dialog } from './components'

function SaleContacts() {
  return (
    <ContactLinks
      purpose="sale"
      className="sale-contacts"
      subject="Upit za kupovinu sajta i domena putujsam.com"
    />
  )
}

export function SaleNotice() {
  return (
    <aside className="sale-notice" aria-label="Sajt i domen na prodaju">
      <div className="container sale-notice-inner">
        <div className="sale-message">
          <span className="sale-tag">
            <Tag size={13} aria-hidden="true" />
            Na prodaju
          </span>
          <p>
            Sajt i domen <strong>putujsam.com</strong>
          </p>
        </div>
        <SaleContacts />
      </div>
    </aside>
  )
}

export function SaleFooter() {
  return (
    <section className="footer-sale" aria-label="Kontakt za kupovinu sajta i domena">
      <div className="footer-sale-copy">
        <h3>Sajt i domen na prodaju.</h3>
        <p>
          Sajt i domen <strong>putujsam.com</strong> su na prodaju. Kontaktirajte nas za detalje o
          kupovini.
        </p>
      </div>
      <SaleContacts />
    </section>
  )
}

export function SaleDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Kupovina sajta i domena putujsam.com" onClose={onClose} className="sale-dialog">
      <div className="sale-dialog-icon">
        <Tag size={26} strokeWidth={1.5} />
      </div>
      <div className="eyebrow">SAJT + DOMEN NA PRODAJU</div>
      <h2>
        Preuzmite
        <br />
        <em>putujsam.com</em>
      </h2>
      <p className="sale-dialog-description">
        Sajt Putuj sam i domen <strong>putujsam.com</strong> su na prodaju. Kontaktirajte nas za
        informacije o kupovini i uslovima preuzimanja.
      </p>
      <div className="sale-dialog-included">
        <span>Sajt Putuj sam</span>
        <span>putujsam.com</span>
      </div>
      <h3>Kontakt za kupovinu</h3>
      <SaleContacts />
    </Dialog>
  )
}

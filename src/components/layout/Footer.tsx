import { Link } from 'react-router-dom'
import { Truck, ShieldCheck, RotateCcw } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-sand-line bg-bone-dim/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-12 border-b border-sand-line">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-moss shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-ink">Free shipping</p>
              <p className="text-sm text-ink/55">On orders over Rs. 5,000</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-moss shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-ink">Secure checkout</p>
              <p className="text-sm text-ink/55">Your information is protected</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="h-5 w-5 text-moss shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-ink">Reasonable Price</p>
              <p className="text-sm text-ink/55">Affordable for everyone</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-12">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-display text-2xl text-ink">DesiPini</span>
            <p className="mt-3 text-sm text-ink/55 max-w-xs">Considered goods, made to last. Thoughtfully sourced, honestly priced.</p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://www.instagram.com/desipini.pk?igsh=MTNubzc2cHQ2dGN6NQ%3D%3D&utm_source=qr&wa_status_inline=true" aria-label="Instagram" className="h-7 w-7 rounded-full border border-sand-line flex items-center justify-center text-[10px] font-semibold text-ink/50 hover:text-ink hover:border-ink/40 transition-colors">IG</a>
              {/* <a href="#" aria-label="Twitter" className="h-7 w-7 rounded-full border border-sand-line flex items-center justify-center text-[10px] font-semibold text-ink/50 hover:text-ink hover:border-ink/40 transition-colors">X</a>
              <a href="#" aria-label="Facebook" className="h-7 w-7 rounded-full border border-sand-line flex items-center justify-center text-[10px] font-semibold text-ink/50 hover:text-ink hover:border-ink/40 transition-colors">FB</a> */}
            </div>
          </div>
          <FooterCol title="Shop" links={[
            { label: 'All Products', to: '/products' },
            { label: 'New Arrivals', to: '/products?sort=newest' },
            { label: 'Featured', to: '/products?featured=true' },
          ]} />
          <FooterCol title="Account" links={[
            { label: 'My Orders', to: '/account/orders' },
            { label: 'Wishlist', to: '/account/wishlist' },
            { label: 'Addresses', to: '/account/addresses' },
          ]} />
          <FooterCol title="Support" links={[
            { label: 'Shipping Info', to: '/shipping' },
            // { label: 'Returns', to: '/returns' },
            { label: 'Contact Us', to: '/contact' },
          ]} />
        </div>

        <div className="pt-6 border-t border-sand-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink/40">© {new Date().getFullYear()} DesiPini. All rights reserved.</p>
          <p className="text-xs text-ink/40">Cash on Delivery available nationwide</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-3">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-ink/60 hover:text-ink transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

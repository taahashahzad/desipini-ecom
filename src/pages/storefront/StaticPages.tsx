import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function ShippingInfoPage() {
  return (
    <StaticPage title="Shipping Information">
      <p>Orders are processed within 1–2 business days. Delivery typically takes 3–7 business days depending on your location.</p>
      <p>Free shipping is available on orders over Rs. 5,000. A flat shipping rate applies below this threshold.</p>
      <p>Cash on Delivery is available nationwide. You'll pay when your order arrives at your door.</p>
    </StaticPage>
  )
}

export function ReturnsPage() {
  return (
    <StaticPage title="Returns & Exchanges">
      <p>We accept returns within 14 days of delivery, provided items are unused, unworn, and in their original packaging.</p>
      <p>To start a return, reach out to our support team with your order number and we'll guide you through the process.</p>
      <p>Refunds are processed within 5–7 business days of us receiving your returned item.</p>
    </StaticPage>
  )
}

export function ContactPage() {
  return (
    <StaticPage title="Contact Us">
      <p>We'd love to hear from you. Reach out with any questions about your order, our products, or anything else.</p>
      <p>Email: hello@meridian.store</p>
      <p>We aim to respond within 24 hours on business days.</p>
    </StaticPage>
  )
}

function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-6">{title}</h1>
      <div className="flex flex-col gap-4 text-ink/65 leading-relaxed">{children}</div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <p className="font-display text-6xl text-ink/20 mb-4">404</p>
      <h1 className="font-display text-2xl text-ink mb-2">Page not found</h1>
      <p className="text-ink/55 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/"><Button>Return Home</Button></Link>
    </div>
  )
}

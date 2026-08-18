import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Truck, MapPin } from 'lucide-react'
import { fetchOrderById } from '@/services/orders'
import type { Order } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { addDays } from 'date-fns'

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchOrderById(id).then(setOrder).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-2">Order not found</h1>
        <Link to="/"><Button className="mt-4">Return Home</Button></Link>
      </div>
    )
  }

  const estimatedDelivery = addDays(new Date(order.created_at), 5)

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center mb-10"
      >
        <div className="h-16 w-16 rounded-full bg-moss/10 flex items-center justify-center mb-5">
          <CheckCircle2 className="h-9 w-9 text-moss" />
        </div>
        <h1 className="font-display text-3xl text-ink">Order Confirmed</h1>
        <p className="text-ink/55 mt-2">Thank you — your order has been placed successfully.</p>
        <p className="mt-3 text-sm text-ink/60">Order Number: <span className="font-semibold text-ink">{order.order_number}</span></p>
      </motion.div>

      <div className="rounded-lg border border-sand-line bg-white/50 p-6 mb-6">
        <h2 className="font-display text-lg text-ink mb-4">Order Summary</h2>
        <div className="flex flex-col gap-3 mb-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden bg-sand/50">
                {item.product_image && <img src={item.product_image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">{item.product_name}</p>
                <p className="text-xs text-ink/45">Qty {item.quantity}</p>
              </div>
              <span className="text-sm text-ink tabular-nums">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 pt-4 border-t border-sand-line text-sm">
          <div className="flex justify-between text-ink/60"><span>Subtotal</span><span className="tabular-nums">{formatCurrency(order.subtotal)}</span></div>
          {order.discount_amount > 0 && <div className="flex justify-between text-moss-dark"><span>Discount</span><span className="tabular-nums">-{formatCurrency(order.discount_amount)}</span></div>}
          <div className="flex justify-between text-ink/60"><span>Shipping</span><span className="tabular-nums">{order.shipping_amount === 0 ? 'Free' : formatCurrency(order.shipping_amount)}</span></div>
          {order.tax_amount > 0 && <div className="flex justify-between text-ink/60"><span>Tax</span><span className="tabular-nums">{formatCurrency(order.tax_amount)}</span></div>}
          <div className="flex justify-between text-ink font-semibold text-base pt-2 mt-1 border-t border-sand-line"><span>Total</span><span className="tabular-nums">{formatCurrency(order.total_amount)}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg border border-sand-line bg-white/50 p-5">
          <div className="flex items-center gap-2 text-ink mb-2"><MapPin className="h-4 w-4 text-moss" /><span className="text-sm font-medium">Shipping To</span></div>
          <p className="text-sm text-ink/60 leading-relaxed">
            {order.shipping_address.full_name}<br />
            {order.shipping_address.address_line1}<br />
            {order.shipping_address.city}, {order.shipping_address.country}
          </p>
        </div>
        <div className="rounded-lg border border-sand-line bg-white/50 p-5">
          <div className="flex items-center gap-2 text-ink mb-2"><Truck className="h-4 w-4 text-moss" /><span className="text-sm font-medium">Estimated Delivery</span></div>
          <p className="text-sm text-ink/60">{formatDate(estimatedDelivery)}</p>
          <p className="text-xs text-ink/40 mt-1">Payment: Cash on Delivery</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/products" className="flex-1"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
        <Link to={`/account/orders/${order.id}`} className="flex-1"><Button className="w-full"><Package className="h-4 w-4" /> Track Order</Button></Link>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { fetchOrderById } from '@/services/orders'
import type { Order } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { OrderTimeline } from '@/components/shared/OrderTimeline'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchOrderById(id).then(setOrder).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />
  if (!order) return <p className="text-ink/55">Order not found.</p>

  return (
    <div>
      <Link to="/account/orders" className="inline-flex items-center gap-1 text-sm text-ink/55 hover:text-ink mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">{order.order_number}</h1>
          <p className="text-sm text-ink/45 mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>
        {order.tracking_number && (
          <div className="text-right">
            <p className="text-xs text-ink/45">Tracking Number</p>
            <p className="text-sm font-mono text-ink">{order.tracking_number}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <h2 className="font-display text-lg text-ink mb-5">Order Status</h2>
          <OrderTimeline order={order} />

          <h2 className="font-display text-lg text-ink mb-4 mt-4">Items</h2>
          <div className="flex flex-col divide-y divide-sand-line">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-3 py-4 first:pt-0">
                <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden bg-sand/50">
                  {item.product_image && <img src={item.product_image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{item.product_name}</p>
                  {item.variant_info && (
                    <p className="text-xs text-ink/45 mt-0.5">{Object.entries(item.variant_info).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                  )}
                  <p className="text-xs text-ink/45 mt-0.5">Qty {item.quantity} × {formatCurrency(item.unit_price)}</p>
                </div>
                <span className="text-sm font-medium text-ink tabular-nums">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-sand-line bg-white/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-3">Shipping Address</p>
            <p className="text-sm text-ink/70 leading-relaxed">
              {order.shipping_address.full_name}<br />
              {order.shipping_address.address_line1}<br />
              {order.shipping_address.city}, {order.shipping_address.country}<br />
              {order.shipping_address.phone}
            </p>
          </div>

          <div className="rounded-lg border border-sand-line bg-white/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-3">Payment</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">Method</span>
              <span className="text-ink font-medium uppercase">{order.payment_method}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-ink/60">Status</span>
              <Badge tone={order.payment_status === 'paid' ? 'success' : 'neutral'}>{order.payment_status}</Badge>
            </div>
          </div>

          <div className="rounded-lg border border-sand-line bg-white/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-3">Order Total</p>
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-ink/60"><span>Subtotal</span><span className="tabular-nums">{formatCurrency(order.subtotal)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-moss-dark"><span>Discount</span><span className="tabular-nums">-{formatCurrency(order.discount_amount)}</span></div>}
              <div className="flex justify-between text-ink/60"><span>Shipping</span><span className="tabular-nums">{formatCurrency(order.shipping_amount)}</span></div>
              <div className="flex justify-between text-ink font-semibold pt-2 mt-1 border-t border-sand-line"><span>Total</span><span className="tabular-nums">{formatCurrency(order.total_amount)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

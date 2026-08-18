import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchMyOrders } from '@/services/orders'
import type { Order } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { STATUS_LABELS, STATUS_TONE } from '@/components/shared/OrderTimeline'
import { Skeleton } from '@/components/ui/Skeleton'

export default function MyOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    if (!user) return
    fetchMyOrders(user.id).then(setOrders)
  }, [user])

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">My Orders</h1>

      {!orders ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="You haven't placed any orders yet"
          description="Once you place an order, it'll show up here."
          action={<Link to="/products"><Button>Start Shopping</Button></Link>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-sand-line bg-white/50 hover:border-ink/20 transition-colors p-5"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 shrink-0 rounded-md bg-sand/60 flex items-center justify-center overflow-hidden">
                  {order.items?.[0]?.product_image ? (
                    <img src={order.items[0].product_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-5 w-5 text-ink/30" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{order.order_number}</p>
                  <p className="text-xs text-ink/45 mt-0.5">{formatDate(order.created_at)} · {order.items?.length ?? 0} item(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                <span className="text-sm font-semibold text-ink tabular-nums hidden sm:block">{formatCurrency(order.total_amount)}</span>
                <ChevronRight className="h-4 w-4 text-ink/30" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

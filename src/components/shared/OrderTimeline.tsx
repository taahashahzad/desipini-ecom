import { Check, X } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { Order, OrderStatus, OrderStatusHistoryEntry } from '@/types/database'

const TIMELINE_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered']

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export { STATUS_LABELS }

export const STATUS_TONE: Record<OrderStatus, any> = {
  pending: 'neutral', confirmed: 'moss', processing: 'moss', packed: 'moss',
  shipped: 'gold', out_for_delivery: 'gold', delivered: 'success', cancelled: 'danger', returned: 'warning',
}

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'cancelled' || order.status === 'returned') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3.5">
        <div className="h-8 w-8 rounded-full bg-danger/15 flex items-center justify-center shrink-0">
          <X className="h-4 w-4 text-danger" />
        </div>
        <div>
          <p className="text-sm font-medium text-danger">Order {STATUS_LABELS[order.status]}</p>
          {order.status_history?.find((h) => h.status === order.status)?.note && (
            <p className="text-xs text-danger/70 mt-0.5">{order.status_history.find((h) => h.status === order.status)?.note}</p>
          )}
        </div>
      </div>
    )
  }

  const currentIndex = TIMELINE_STEPS.indexOf(order.status)
  const historyByStatus = new Map<OrderStatus, OrderStatusHistoryEntry>()
  for (const h of order.status_history ?? []) historyByStatus.set(h.status, h)

  return (
    <div className="flex flex-col">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentIndex
        const isLast = i === TIMELINE_STEPS.length - 1
        const entry = historyByStatus.get(step)
        return (
          <div key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                  done ? 'bg-moss text-bone' : 'bg-sand text-ink/30'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </div>
              {!isLast && <div className={cn('w-px flex-1 min-h-8', done && i < currentIndex ? 'bg-moss' : 'bg-sand-line')} />}
            </div>
            <div className="pb-8">
              <p className={cn('text-sm font-medium', done ? 'text-ink' : 'text-ink/40')}>{STATUS_LABELS[step]}</p>
              {entry && <p className="text-xs text-ink/40 mt-0.5">{formatDate(entry.created_at)}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingCart } from 'lucide-react'
import { adminFetchOrders, type AdminOrderFilters } from '@/services/orders'
import type { Order, OrderStatus } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { STATUS_LABELS, STATUS_TONE } from '@/components/shared/OrderTimeline'
import { useDebouncedValue } from '@/hooks/useCommon'

const ALL_STATUSES: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AdminOrderFilters['status']>('all')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 300)
  const pageSize = 15

  useEffect(() => {
    setLoading(true)
    adminFetchOrders({ status, search: debouncedSearch, page, pageSize })
      .then((r) => { setOrders(r.orders); setTotal(r.total) })
      .finally(() => setLoading(false))
  }, [status, debouncedSearch, page])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />
          <Input placeholder="Search order #, name, email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <div className="w-full sm:w-56">
          <Select value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1) }}>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-sand-line bg-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-sand-line">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-line">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : orders.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={<ShoppingCart className="h-6 w-6" />} title="No orders found" /></td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-sand/20">
                    <td className="px-5 py-3.5"><Link to={`/admin/orders/${o.id}`} className="font-medium text-ink hover:underline">{o.order_number}</Link></td>
                    <td className="px-5 py-3.5">
                      <p className="text-ink/80">{o.customer_name}</p>
                      <p className="text-xs text-ink/40">{o.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink/50">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-3.5 text-ink tabular-nums">{formatCurrency(o.total_amount)}</td>
                    <td className="px-5 py-3.5"><Badge tone={STATUS_TONE[o.status]}>{STATUS_LABELS[o.status]}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`h-9 w-9 rounded-md text-sm font-medium ${page === i + 1 ? 'bg-ink text-bone' : 'text-ink/60 hover:bg-sand/50'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

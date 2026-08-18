import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, Package } from 'lucide-react'
import { adminFetchCustomerDetail, adminSetCustomerDisabled } from '@/services/customers'
import { formatCurrency, formatDate, initials } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { STATUS_LABELS, STATUS_TONE } from '@/components/shared/OrderTimeline'

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Awaited<ReturnType<typeof adminFetchCustomerDetail>> | null>(null)
  const [toggling, setToggling] = useState(false)

  function load() {
    if (!id) return
    adminFetchCustomerDetail(id).then(setData)
  }
  useEffect(load, [id])

  async function handleToggleDisabled() {
    if (!data) return
    setToggling(true)
    try {
      await adminSetCustomerDisabled(data.profile.id, !data.profile.is_disabled)
      toast.success(data.profile.is_disabled ? 'Customer re-enabled' : 'Customer disabled')
      load()
    } catch (e: any) {
      toast.error('Could not update customer', { description: e.message })
    } finally {
      setToggling(false)
    }
  }

  if (!data) return <Skeleton className="h-96 w-full rounded-lg" />

  const { profile, orders, totalOrders, totalSpending } = data

  return (
    <div className="max-w-4xl">
      <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm text-ink/55 hover:text-ink mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to customers
      </Link>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-moss text-bone flex items-center justify-center font-display text-lg overflow-hidden shrink-0">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(profile.full_name)}
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink">{profile.full_name || 'Unnamed Customer'}</h1>
            <p className="text-sm text-ink/45 mt-0.5">Joined {formatDate(profile.created_at)}</p>
          </div>
        </div>
        <Button variant={profile.is_disabled ? 'outline' : 'danger'} size="sm" loading={toggling} onClick={handleToggleDisabled}>
          {profile.is_disabled ? 'Re-enable Account' : 'Disable Account'}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-4"><p className="text-xs text-ink/45 mb-1">Total Orders</p><p className="font-display text-xl text-ink">{totalOrders}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-ink/45 mb-1">Total Spending</p><p className="font-display text-xl text-ink">{formatCurrency(totalSpending)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-ink/45 mb-1">Phone</p><p className="text-sm text-ink mt-1.5">{profile.phone || '—'}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-ink/45 mb-1">Status</p><Badge tone={profile.is_disabled ? 'danger' : 'success'} className="mt-1.5">{profile.is_disabled ? 'Disabled' : 'Active'}</Badge></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="text-sm text-ink/45 px-5 py-6 flex items-center gap-2"><Package className="h-4 w-4" /> No orders yet</p>
          ) : (
            <div className="divide-y divide-sand-line">
              {orders.map((o) => (
                <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-sand/20">
                  <div>
                    <p className="text-sm font-medium text-ink">{o.order_number}</p>
                    <p className="text-xs text-ink/40">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge tone={STATUS_TONE[o.status as keyof typeof STATUS_TONE]}>{STATUS_LABELS[o.status as keyof typeof STATUS_LABELS]}</Badge>
                    <span className="text-sm font-medium text-ink tabular-nums">{formatCurrency(o.total_amount)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

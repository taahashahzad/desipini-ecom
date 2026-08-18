import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, Save } from 'lucide-react'
import { fetchOrderById, adminUpdateOrderStatus, adminUpdateOrder, adminCancelOrder } from '@/services/orders'
import type { Order, OrderStatus } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Select } from '@/components/ui/Select'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { OrderTimeline, STATUS_LABELS } from '@/components/shared/OrderTimeline'

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<OrderStatus>('pending')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  function load() {
    if (!id) return
    setLoading(true)
    fetchOrderById(id).then((o) => {
      setOrder(o)
      setStatus(o.status)
      setTrackingNumber(o.tracking_number ?? '')
    }).finally(() => setLoading(false))
  }
  useEffect(load, [id])

  async function handleSaveStatus() {
    if (!order) return
    setSaving(true)
    try {
      if (status !== order.status) {
        await adminUpdateOrderStatus(order.id, status)
      }
      if (trackingNumber !== (order.tracking_number ?? '')) {
        await adminUpdateOrder(order.id, { tracking_number: trackingNumber || null })
      }
      toast.success('Order updated')
      load()
    } catch (e: any) {
      toast.error('Could not update order', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel() {
    if (!order) return
    await adminCancelOrder(order.id)
    toast.success('Order cancelled')
    setCancelOpen(false)
    load()
  }

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />
  if (!order) return <p className="text-ink/55">Order not found.</p>

  return (
    <div className="max-w-5xl">
      <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-ink/55 hover:text-ink mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">{order.order_number}</h1>
          <p className="text-sm text-ink/45 mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>Cancel Order</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="flex flex-col divide-y divide-sand-line">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-3 py-3.5 first:pt-0">
                  <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden bg-sand/50">
                    {item.product_image && <img src={item.product_image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink">{item.product_name}</p>
                    <p className="text-xs text-ink/45">Qty {item.quantity} × {formatCurrency(item.unit_price)}</p>
                  </div>
                  <span className="text-sm font-medium text-ink tabular-nums">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Order Timeline</CardTitle></CardHeader>
            <CardContent><OrderTimeline order={order} /></CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label>Order Status</Label>
                <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </Select>
              </div>
              <div>
                <Label>Tracking Number</Label>
                <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Optional" />
              </div>
              <Button onClick={handleSaveStatus} loading={saving}><Save className="h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="text-sm flex flex-col gap-1.5">
              <p className="text-ink font-medium">{order.customer_name}</p>
              <p className="text-ink/60">{order.customer_email}</p>
              <p className="text-ink/60">{order.customer_phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="text-sm text-ink/70 leading-relaxed">
              {order.shipping_address.address_line1}<br />
              {order.shipping_address.city}, {order.shipping_address.country}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-ink/60">Method</span><span className="uppercase font-medium text-ink">{order.payment_method}</span></div>
              <div className="flex justify-between items-center"><span className="text-ink/60">Status</span><Badge tone={order.payment_status === 'paid' ? 'success' : 'neutral'}>{order.payment_status}</Badge></div>
              <div className="flex justify-between pt-2 mt-1 border-t border-sand-line font-semibold text-ink"><span>Total</span><span className="tabular-nums">{formatCurrency(order.total_amount)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        description="The customer will be notified and this cannot be undone."
        confirmLabel="Cancel Order"
        danger
      />
    </div>
  )
}

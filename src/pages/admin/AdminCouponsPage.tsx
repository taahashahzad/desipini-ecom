import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react'
import * as couponService from '@/services/coupons'
import type { Coupon } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableRowSkeleton } from '@/components/ui/Skeleton'

const emptyForm = {
  code: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: '10',
  min_order_amount: '0', max_discount_amount: '', expires_at: '', usage_limit: '', is_active: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  function load() {
    couponService.adminFetchCoupons().then(setCoupons)
  }
  useEffect(load, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(c: Coupon) {
    setEditing(c)
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value),
      min_order_amount: String(c.min_order_amount), max_discount_amount: c.max_discount_amount ? String(c.max_discount_amount) : '',
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '', usage_limit: c.usage_limit ? String(c.usage_limit) : '',
      is_active: c.is_active,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.code) {
      toast.error('Coupon code is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount || 0),
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        is_active: form.is_active,
      }
      if (editing) {
        await couponService.adminUpdateCoupon(editing.id, payload)
        toast.success('Coupon updated')
      } else {
        await couponService.adminCreateCoupon(payload)
        toast.success('Coupon created')
      }
      setDialogOpen(false)
      load()
    } catch (e: any) {
      toast.error('Could not save coupon', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await couponService.adminDeleteCoupon(deleteTarget.id)
    toast.success('Coupon deleted')
    setDeleteTarget(null)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Coupons</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add Coupon</Button>
      </div>

      <div className="rounded-lg border border-sand-line bg-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-sand-line">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Min. Order</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Expires</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-line">
              {!coupons ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={<Ticket className="h-6 w-6" />} title="No coupons yet" action={<Button onClick={openNew}>Add Coupon</Button>} /></td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-sand/20">
                    <td className="px-5 py-3.5 font-mono font-medium text-ink">{c.code}</td>
                    <td className="px-5 py-3.5 text-ink/70">{c.discount_type === 'percentage' ? `${c.discount_value}%` : formatCurrency(c.discount_value)}</td>
                    <td className="px-5 py-3.5 text-ink/60">{formatCurrency(c.min_order_amount)}</td>
                    <td className="px-5 py-3.5 text-ink/60">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                    <td className="px-5 py-3.5 text-ink/60">{c.expires_at ? formatDate(c.expires_at) : 'Never'}</td>
                    <td className="px-5 py-3.5"><Badge tone={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-ink/40 hover:text-ink"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-ink/40 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Coupon' : 'New Coupon'}>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Coupon Code</Label>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Type</Label>
              <Select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as any }))}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </Select>
            </div>
            <div>
              <Label>{form.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount'}</Label>
              <Input type="number" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min. Order Amount</Label>
              <Input type="number" value={form.min_order_amount} onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))} />
            </div>
            <div>
              <Label>Max Discount Cap</Label>
              <Input type="number" value={form.max_discount_amount} onChange={(e) => setForm((f) => ({ ...f, max_discount_amount: e.target.value }))} placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expiration Date</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
            </div>
            <div>
              <Label>Usage Limit</Label>
              <Input type="number" value={form.usage_limit} onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))} placeholder="Unlimited" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 accent-moss" />
            Active
          </label>
          <Button onClick={handleSave} loading={saving} className="mt-2">Save Coupon</Button>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete this coupon?" confirmLabel="Delete" danger />
    </div>
  )
}

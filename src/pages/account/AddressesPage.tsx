import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as addressService from '@/services/addresses'
import type { Address } from '@/types/database'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog'
import { Input, Label } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'

const emptyForm = {
  full_name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', postal_code: '', country: 'Pakistan', is_default: false,
}

export default function AddressesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null)

  function load() {
    if (!user) return
    addressService.fetchAddresses(user.id).then(setAddresses)
  }

  useEffect(load, [user])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(a: Address) {
    setEditing(a)
    setForm({
      full_name: a.full_name, phone: a.phone ?? '', address_line1: a.address_line1,
      address_line2: a.address_line2 ?? '', city: a.city, state: a.state ?? '',
      postal_code: a.postal_code ?? '', country: a.country, is_default: a.is_default,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      if (editing) {
        await addressService.updateAddress(editing.id, user.id, form)
        toast.success('Address updated')
      } else {
        await addressService.createAddress(user.id, form)
        toast.success('Address added')
      }
      setDialogOpen(false)
      load()
    } catch (e: any) {
      toast.error('Could not save address', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await addressService.deleteAddress(deleteTarget.id)
    toast.success('Address removed')
    setDeleteTarget(null)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Saved Addresses</h1>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Add Address</Button>
      </div>

      {!addresses ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState icon={<MapPin className="h-6 w-6" />} title="No saved addresses" description="Add an address to speed up checkout." action={<Button onClick={openNew}>Add Address</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-lg border border-sand-line bg-white/50 p-5 relative">
              {a.is_default && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-xs font-medium text-moss-dark">
                  <Star className="h-3 w-3 fill-moss text-moss" /> Default
                </span>
              )}
              <p className="text-sm font-semibold text-ink">{a.full_name}</p>
              <p className="text-sm text-ink/60 mt-1 leading-relaxed">
                {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}<br />
                {a.city}{a.state ? `, ${a.state}` : ''} {a.postal_code}<br />
                {a.country}
              </p>
              {a.phone && <p className="text-sm text-ink/45 mt-1">{a.phone}</p>}
              <div className="flex items-center gap-3 mt-4">
                <button onClick={() => openEdit(a)} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/60 hover:text-ink"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                <button onClick={() => setDeleteTarget(a)} className="inline-flex items-center gap-1.5 text-xs font-medium text-danger/70 hover:text-danger"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Address' : 'Add Address'}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Address Line 1</Label>
            <Input value={form.address_line1} onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))} />
          </div>
          <div>
            <Label>Address Line 2</Label>
            <Input value={form.address_line2} onChange={(e) => setForm((f) => ({ ...f, address_line2: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))} className="h-4 w-4 accent-moss" />
            Set as default address
          </label>
          <Button onClick={handleSave} loading={saving} className="mt-2">Save Address</Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this address?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}

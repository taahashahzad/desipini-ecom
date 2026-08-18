import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchStoreSettings, updateStoreSetting } from '@/services/settings'
import type { StoreSettings } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ImageUploader, type ImageItem } from '@/components/admin/ImageUploader'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [logo, setLogo] = useState<ImageItem[]>([])
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchStoreSettings().then((s) => {
      setSettings(s)
      if (s.store_info.logo_url) setLogo([{ url: s.store_info.logo_url, is_primary: true, sort_order: 0 }])
    })
  }, [])

  if (!settings) return <Skeleton className="h-96 w-full rounded-lg" />

  async function save(key: keyof StoreSettings, value: any, label: string) {
    setSaving(key)
    try {
      await updateStoreSetting(key, value)
      toast.success(`${label} settings saved`)
    } catch (e: any) {
      toast.error('Could not save settings', { description: e.message })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-6">Settings</h1>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Store Name</Label>
              <Input value={settings.store_info.name} onChange={(e) => setSettings({ ...settings, store_info: { ...settings.store_info, name: e.target.value } })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={settings.store_info.description} onChange={(e) => setSettings({ ...settings, store_info: { ...settings.store_info, description: e.target.value } })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input value={settings.store_info.contact_email} onChange={(e) => setSettings({ ...settings, store_info: { ...settings.store_info, contact_email: e.target.value } })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={settings.store_info.phone} onChange={(e) => setSettings({ ...settings, store_info: { ...settings.store_info, phone: e.target.value } })} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={settings.store_info.address} onChange={(e) => setSettings({ ...settings, store_info: { ...settings.store_info, address: e.target.value } })} />
            </div>
            <div>
              <Label>Store Logo</Label>
              <ImageUploader images={logo} onChange={(imgs) => {
                const next = imgs.slice(-1)
                setLogo(next)
                setSettings({ ...settings, store_info: { ...settings.store_info, logo_url: next[0]?.url ?? '' } })
              }} bucket="category-images" />
            </div>
            <Button className="w-fit" loading={saving === 'store_info'} onClick={() => save('store_info', settings.store_info, 'Store')}>Save Store Info</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Flat Shipping Rate</Label>
                <Input type="number" value={settings.shipping.flat_rate} onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, flat_rate: Number(e.target.value) } })} />
              </div>
              <div>
                <Label>Free Shipping Threshold</Label>
                <Input type="number" value={settings.shipping.free_shipping_threshold} onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, free_shipping_threshold: Number(e.target.value) } })} />
              </div>
            </div>
            <Button className="w-fit" loading={saving === 'shipping'} onClick={() => save('shipping', settings.shipping, 'Shipping')}>Save Shipping</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tax</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Tax Percentage (%)</Label>
              <Input type="number" value={settings.tax.percentage} onChange={(e) => setSettings({ ...settings, tax: { percentage: Number(e.target.value) } })} />
            </div>
            <Button className="w-fit" loading={saving === 'tax'} onClick={() => save('tax', settings.tax, 'Tax')}>Save Tax</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import {
  createProduct, updateProduct, fetchProductById,
  setProductImages, setProductVariants,
} from '@/services/products'
import { useCategories } from '@/hooks/useCommon'
import { slugify } from '@/lib/utils'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ImageUploader, type ImageItem } from '@/components/admin/ImageUploader'
import { VariantEditor, type VariantItem } from '@/components/admin/VariantEditor'
import { SpecEditor } from '@/components/admin/SpecEditor'

const emptyForm = {
  name: '', slug: '', description: '', short_description: '',
  category_id: '', brand: '', price: '', sale_price: '', sku: '',
  stock_quantity: '0', low_stock_threshold: '5', tags: '',
  is_featured: false, is_published: true,
}

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { categories } = useCategories(false)

  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [variants, setVariants] = useState<VariantItem[]>([])
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchProductById(id).then((p) => {
      setForm({
        name: p.name, slug: p.slug, description: p.description ?? '', short_description: p.short_description ?? '',
        category_id: p.category_id ?? '', brand: p.brand ?? '', price: String(p.price), sale_price: p.sale_price ? String(p.sale_price) : '',
        sku: p.sku ?? '', stock_quantity: String(p.stock_quantity), low_stock_threshold: String(p.low_stock_threshold),
        tags: p.tags.join(', '), is_featured: p.is_featured, is_published: p.is_published,
      })
      setImages((p.images ?? []).map((img) => ({ url: img.url, is_primary: img.is_primary, sort_order: img.sort_order, alt: img.alt ?? undefined })))
      setVariants((p.variants ?? []).map((v) => ({ variant_type: v.variant_type, variant_value: v.variant_value, price_adjustment: v.price_adjustment, stock_quantity: v.stock_quantity, sku: v.sku ?? undefined, sort_order: v.sort_order })))
      setSpecs(p.specifications ?? {})
      setSlugTouched(true)
      setLoading(false)
    })
  }, [id])

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (key === 'name' && !slugTouched) next.slug = slugify(value as string)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        short_description: form.short_description,
        category_id: form.category_id || null,
        brand: form.brand || null,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        sku: form.sku || null,
        stock_quantity: Number(form.stock_quantity),
        low_stock_threshold: Number(form.low_stock_threshold),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        specifications: specs,
        is_featured: form.is_featured,
        is_published: form.is_published,
      }

      const product = isEdit ? await updateProduct(id!, payload) : await createProduct(payload)
      await setProductImages(product.id, images)
      await setProductVariants(product.id, variants)

      toast.success(isEdit ? 'Product updated' : 'Product created')
      navigate('/admin/products')
    } catch (e: any) {
      toast.error('Could not save product', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-ink/50">Loading…</p>

  return (
    <div className="max-w-4xl">
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm text-ink/55 hover:text-ink mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="font-display text-2xl text-ink mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Product Name</Label>
              <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => { setSlugTouched(true); updateField('slug', e.target.value) }} />
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Short Description</Label>
              <Input value={form.short_description} onChange={(e) => updateField('short_description', e.target.value)} placeholder="One line summary shown on product cards" />
            </div>
            <div>
              <Label>Full Description</Label>
              <Textarea rows={5} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="ceramic, handmade, minimal" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <Label>Price</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => updateField('price', e.target.value)} required />
            </div>
            <div>
              <Label>Sale Price</Label>
              <Input type="number" step="0.01" value={form.sale_price} onChange={(e) => updateField('sale_price', e.target.value)} />
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => updateField('sku', e.target.value)} />
            </div>
            <div>
              <Label>Stock Quantity</Label>
              <Input type="number" value={form.stock_quantity} onChange={(e) => updateField('stock_quantity', e.target.value)} />
            </div>
            <div>
              <Label>Low Stock Threshold</Label>
              <Input type="number" value={form.low_stock_threshold} onChange={(e) => updateField('low_stock_threshold', e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}>
                <option value="">Uncategorized</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
          <CardContent>
            <ImageUploader images={images} onChange={setImages} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
          <CardContent>
            <VariantEditor variants={variants} onChange={setVariants} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
          <CardContent>
            <SpecEditor specs={specs} onChange={setSpecs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label className="flex items-center gap-2.5 text-sm text-ink/75">
              <input type="checkbox" checked={form.is_published} onChange={(e) => updateField('is_published', e.target.checked)} className="h-4 w-4 accent-moss" />
              Published (visible in store)
            </label>
            <label className="flex items-center gap-2.5 text-sm text-ink/75">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => updateField('is_featured', e.target.checked)} className="h-4 w-4 accent-moss" />
              Featured product
            </label>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 sticky bottom-4 bg-bone-dim/90 backdrop-blur-sm py-3 -mx-1 px-1 rounded-lg">
          <Button type="submit" size="lg" loading={saving}>{isEdit ? 'Save Changes' : 'Create Product'}</Button>
          <Link to="/admin/products"><Button type="button" variant="outline" size="lg">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}

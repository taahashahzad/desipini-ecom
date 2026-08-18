import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react'
import * as categoryService from '@/services/categories'
import type { Category } from '@/types/database'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ImageUploader, type ImageItem } from '@/components/admin/ImageUploader'

const emptyForm = { name: '', slug: '', description: '', sort_order: '0', is_active: true }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [image, setImage] = useState<ImageItem[]>([])
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  function load() {
    categoryService.adminFetchCategories().then(setCategories)
  }
  useEffect(load, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setImage([])
    setSlugTouched(false)
    setDialogOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', sort_order: String(c.sort_order), is_active: c.is_active })
    setImage(c.image_url ? [{ url: c.image_url, is_primary: true, sort_order: 0 }] : [])
    setSlugTouched(true)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name) {
      toast.error('Category name is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        sort_order: Number(form.sort_order),
        is_active: form.is_active,
        image_url: image[0]?.url ?? null,
      }
      if (editing) {
        await categoryService.updateCategory(editing.id, payload)
        toast.success('Category updated')
      } else {
        await categoryService.createCategory(payload)
        toast.success('Category created')
      }
      setDialogOpen(false)
      load()
    } catch (e: any) {
      toast.error('Could not save category', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await categoryService.deleteCategory(deleteTarget.id)
      toast.success('Category deleted')
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      toast.error('Could not delete category', { description: 'Make sure no products are still assigned to it.' })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Categories</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      {!categories ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon={<FolderTree className="h-6 w-6" />} title="No categories yet" action={<Button onClick={openNew}>Add Category</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="rounded-lg border border-sand-line bg-white/50 overflow-hidden">
              <div className="aspect-[16/9] bg-sand/50">
                {c.image_url && <img src={c.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink">{c.name}</p>
                  <Badge tone={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Active' : 'Hidden'}</Badge>
                </div>
                <p className="text-xs text-ink/45 mt-1">{c.product_count ?? 0} products</p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => openEdit(c)} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/60 hover:text-ink"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => setDeleteTarget(c)} className="inline-flex items-center gap-1.5 text-xs font-medium text-danger/70 hover:text-danger"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Category' : 'New Category'} className="max-w-xl">
        <div className="flex flex-col gap-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => {
              const v = e.target.value
              setForm((f) => ({ ...f, name: v, slug: slugTouched ? f.slug : slugify(v) }))
            }} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: e.target.value })) }} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <Label>Category Image</Label>
            <ImageUploader images={image} onChange={(imgs) => setImage(imgs.slice(-1))} bucket="category-images" />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 accent-moss" />
            Active (visible in store)
          </label>
          <Button onClick={handleSave} loading={saving} className="mt-2">Save Category</Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this category?"
        description="Products in this category will become uncategorized."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}

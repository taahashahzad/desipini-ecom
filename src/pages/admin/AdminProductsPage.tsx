import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Copy, Package, Eye, EyeOff } from 'lucide-react'
import { adminFetchProducts, deleteProduct, duplicateProduct, updateProduct } from '@/services/products'
import type { Product } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { useDebouncedValue } from '@/hooks/useCommon'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const debouncedSearch = useDebouncedValue(search, 300)
  const pageSize = 15

  function load() {
    setLoading(true)
    adminFetchProducts({ search: debouncedSearch, page, pageSize })
      .then((r) => {
        setProducts(r.products)
        setTotal(r.total)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [debouncedSearch, page])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteProduct(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      toast.error('Could not delete product', { description: e.message })
    }
  }

  async function handleDuplicate(p: Product) {
    try {
      await duplicateProduct(p)
      toast.success('Product duplicated')
      load()
    } catch (e: any) {
      toast.error('Could not duplicate product', { description: e.message })
    }
  }

  async function togglePublish(p: Product) {
    try {
      await updateProduct(p.id, { is_published: !p.is_published })
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_published: !x.is_published } : x)))
    } catch (e: any) {
      toast.error('Could not update product', { description: e.message })
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Products</h1>
        <Link to="/admin/products/new"><Button><Plus className="h-4 w-4" /> Add Product</Button></Link>
      </div>

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />
        <Input placeholder="Search by name or SKU…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
      </div>

      <div className="rounded-lg border border-sand-line bg-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-sand-line">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-line">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : products.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={<Package className="h-6 w-6" />} title="No products found" /></td></tr>
              ) : (
                products.map((p) => {
                  const image = p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url
                  const lowStock = p.stock_quantity <= p.low_stock_threshold
                  return (
                    <tr key={p.id} className="hover:bg-sand/20">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 shrink-0 rounded-md bg-sand/60 overflow-hidden">
                            {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate max-w-[220px]">{p.name}</p>
                            <p className="text-xs text-ink/40">{p.sku || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink/60">{p.category?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-ink tabular-nums">
                        {formatCurrency(p.sale_price ?? p.price)}
                        {p.sale_price && <span className="block text-xs text-ink/35 line-through">{formatCurrency(p.price)}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={lowStock ? 'text-warning font-medium' : 'text-ink/70'}>{p.stock_quantity}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => togglePublish(p)}>
                          <Badge tone={p.is_published ? 'success' : 'neutral'}>{p.is_published ? 'Published' : 'Draft'}</Badge>
                        </button>
                        {p.is_featured && <Badge tone="gold" className="ml-1.5">Featured</Badge>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => togglePublish(p)} className="p-1.5 text-ink/40 hover:text-ink" title={p.is_published ? 'Unpublish' : 'Publish'}>
                            {p.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button onClick={() => handleDuplicate(p)} className="p-1.5 text-ink/40 hover:text-ink" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </button>
                          <Link to={`/admin/products/${p.id}/edit`} className="p-1.5 text-ink/40 hover:text-ink" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-ink/40 hover:text-danger" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-md text-sm font-medium ${page === i + 1 ? 'bg-ink text-bone' : 'text-ink/60 hover:bg-sand/50'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this product?"
        description={`"${deleteTarget?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}

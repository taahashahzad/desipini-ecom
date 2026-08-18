import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Boxes, Search, Check, X } from 'lucide-react'
import { adminFetchProducts, updateProduct } from '@/services/products'
import type { Product } from '@/types/database'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { useDebouncedValue } from '@/hooks/useCommon'

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  function load() {
    setLoading(true)
    adminFetchProducts({ search: debouncedSearch, pageSize: 100 })
      .then((r) => setProducts(r.products))
      .finally(() => setLoading(false))
  }
  useEffect(load, [debouncedSearch])

  function startEdit(p: Product) {
    setEditingId(p.id)
    setEditValue(String(p.stock_quantity))
  }

  async function saveEdit(p: Product) {
    const value = Number(editValue)
    if (Number.isNaN(value) || value < 0) {
      toast.error('Enter a valid stock quantity')
      return
    }
    try {
      await updateProduct(p.id, { stock_quantity: value })
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock_quantity: value } : x)))
      toast.success('Stock updated')
    } catch (e: any) {
      toast.error('Could not update stock', { description: e.message })
    } finally {
      setEditingId(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Inventory</h1>

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />
        <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border border-sand-line bg-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-sand-line">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Current Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-line">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
              ) : products.length === 0 ? (
                <tr><td colSpan={4}><EmptyState icon={<Boxes className="h-6 w-6" />} title="No products found" /></td></tr>
              ) : (
                products.map((p) => {
                  const lowStock = p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
                  const outOfStock = p.stock_quantity <= 0
                  return (
                    <tr key={p.id} className="hover:bg-sand/20">
                      <td className="px-5 py-3.5 font-medium text-ink">{p.name}</td>
                      <td className="px-5 py-3.5 text-ink/50 font-mono text-xs">{p.sku || '—'}</td>
                      <td className="px-5 py-3.5">
                        {editingId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8 w-24"
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(p)}
                            />
                            <button onClick={() => saveEdit(p)} className="p-1 text-moss hover:bg-moss/10 rounded"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-ink/40 hover:bg-sand/50 rounded"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(p)} className="tabular-nums text-ink hover:underline">
                            {p.stock_quantity}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {outOfStock ? <Badge tone="danger">Out of stock</Badge> : lowStock ? <Badge tone="warning">Low stock</Badge> : <Badge tone="success">In stock</Badge>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

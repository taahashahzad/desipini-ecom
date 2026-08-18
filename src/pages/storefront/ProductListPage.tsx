import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X, Package } from 'lucide-react'
import { fetchProducts, type ProductFilters } from '@/services/products'
import type { Product } from '@/types/database'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFiltersPanel } from '@/components/product/ProductFiltersPanel'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const PAGE_SIZE = 12

const SORT_OPTIONS: { value: NonNullable<ProductFilters['sort']>; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
]

export default function ProductListPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<ProductFilters>({
    sort: (searchParams.get('sort') as ProductFilters['sort']) ?? 'featured',
    search: searchParams.get('q') ?? undefined,
    featuredOnly: searchParams.get('featured') === 'true' || undefined,
    page: 1,
    pageSize: PAGE_SIZE,
  })
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const activeFilters = useMemo(() => ({ ...filters, categoryId }), [filters, categoryId])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchProducts(activeFilters)
      .then(({ products, total }) => {
        if (!mounted) return
        setProducts(products)
        setTotal(total)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(activeFilters)])

  function patchFilters(patch: Partial<ProductFilters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }))
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">
            {filters.search ? `Results for "${filters.search}"` : 'All Products'}
          </h1>
          <p className="text-sm text-ink/50 mt-1">{loading ? 'Searching…' : `${total} product${total === 1 ? '' : 's'}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block">
          <ProductFiltersPanel filters={filters} onChange={patchFilters} selectedCategoryId={categoryId} onCategoryChange={setCategoryId} />
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6 gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 h-10 px-4 rounded-md border border-sand-line text-sm font-medium text-ink"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <div className="ml-auto w-48">
              <Select value={filters.sort} onChange={(e) => patchFilters({ sort: e.target.value as ProductFilters['sort'] })}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10">
              {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Package className="h-6 w-6" />}
              title="No products found"
              description="Try adjusting your filters or search terms."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                      className={`h-9 w-9 rounded-md text-sm font-medium transition-colors ${
                        (filters.page ?? 1) === i + 1 ? 'bg-ink text-bone' : 'text-ink/60 hover:bg-sand/50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/40" onClick={() => setMobileFiltersOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-xs bg-bone p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-xl text-ink">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5 text-ink/60" /></button>
              </div>
              <ProductFiltersPanel filters={filters} onChange={patchFilters} selectedCategoryId={categoryId} onCategoryChange={setCategoryId} />
              <Button className="w-full mt-8" onClick={() => setMobileFiltersOpen(false)}>Show Results</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

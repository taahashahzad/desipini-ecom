import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Package } from 'lucide-react'
import { fetchCategoryBySlug } from '@/services/categories'
import { fetchProducts, type ProductFilters } from '@/services/products'
import type { Category, Product } from '@/types/database'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<ProductFilters['sort']>('featured')

  useEffect(() => {
    if (!slug) return
    let mounted = true
    setLoading(true)
    fetchCategoryBySlug(slug)
      .then((cat) => {
        if (!mounted) return
        setCategory(cat)
        return fetchProducts({ categorySlug: slug, sort, pageSize: 24 })
      })
      .then((res) => mounted && res && setProducts(res.products))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [slug, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{category?.name ?? 'Category'}</h1>
          {category?.description && <p className="text-sm text-ink/55 mt-1 max-w-xl">{category.description}</p>}
        </div>
        <div className="w-48">
          <Select value={sort} onChange={(e) => setSort(e.target.value as ProductFilters['sort'])}>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={<Package className="h-6 w-6" />} title="No products found" description="This category doesn't have any products yet." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

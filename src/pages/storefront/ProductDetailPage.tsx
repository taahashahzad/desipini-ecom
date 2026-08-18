import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Heart, Minus, Plus, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronRight } from 'lucide-react'
import { fetchProductBySlug, fetchRelatedProducts } from '@/services/products'
import type { Product, ProductVariant } from '@/types/database'
import { cn, formatCurrency } from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { ProductReviews } from '@/components/product/ProductReviews'
import { ProductCard } from '@/components/product/ProductCard'
import { trackRecentlyViewed } from '@/utils/recents'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<'description' | 'specs' | 'shipping'>('description')

  const { user } = useAuth()
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product?.id ?? ''))

  useEffect(() => {
    if (!slug) return
    let mounted = true
    setLoading(true)
    setActiveImage(0)
    setQuantity(1)
    setSelectedVariants({})
    fetchProductBySlug(slug)
      .then((p) => {
        if (!mounted) return
        setProduct(p)
        trackRecentlyViewed(p.id)
        return fetchRelatedProducts(p.category_id, p.id)
      })
      .then((r) => mounted && r && setRelated(r))
      .catch(() => mounted && setProduct(null))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [slug])

  const variantGroups = useMemo(() => {
    if (!product?.variants) return {}
    const groups: Record<string, ProductVariant[]> = {}
    for (const v of product.variants) {
      groups[v.variant_type] = groups[v.variant_type] ?? []
      groups[v.variant_type].push(v)
    }
    return groups
  }, [product])

  const matchedVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    return product.variants.find((v) =>
      Object.entries(selectedVariants).every(([type, value]) => !(type in variantGroups) || (v.variant_type === type ? v.variant_value === value : true))
    ) ?? product.variants.find((v) => selectedVariants[v.variant_type] === v.variant_value)
  }, [product, selectedVariants, variantGroups])

  if (loading) return <ProductDetailSkeleton />
  if (!product) return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl text-ink mb-2">Product not found</h1>
      <p className="text-ink/55 mb-6">This product may have been removed or is no longer available.</p>
      <Link to="/products"><Button>Browse Products</Button></Link>
    </div>
  )

  const hasDiscount = product.sale_price != null && product.sale_price < product.price
  const basePrice = hasDiscount ? product.sale_price! : product.price
  const finalPrice = basePrice + (matchedVariant?.price_adjustment ?? 0)
  const stock = matchedVariant ? matchedVariant.stock_quantity : product.stock_quantity
  const outOfStock = stock <= 0
  const allVariantTypesSelected = Object.keys(variantGroups).every((type) => selectedVariants[type])
  const images = product.images?.length ? product.images : [{ id: 'placeholder', url: '', alt: '', is_primary: true, sort_order: 0, product_id: product.id, created_at: '' }]

  function requireAuth(action: () => void) {
    if (!user) {
      toast.info('Please sign in first', { description: 'Create an account to add items to your cart.' })
      return
    }
    action()
  }

  function handleAddToCart() {
    if (Object.keys(variantGroups).length > 0 && !allVariantTypesSelected) {
      toast.error('Please select all options first')
      return
    }
    requireAuth(() => addItem(user!.id, product!.id, quantity, matchedVariant?.id))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-ink/45 mb-6">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-ink">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/categories/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-sand/40 mb-3">
            {images[activeImage]?.url ? (
              <motion.img
                key={images[activeImage].url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                src={images[activeImage].url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-ink/25 font-display">No image available</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'h-16 w-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors',
                    activeImage === i ? 'border-moss' : 'border-transparent'
                  )}
                >
                  {img.url && <img src={img.url} alt="" className="h-full w-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category && (
            <span className="text-xs uppercase tracking-wide text-ink/40 font-medium">{product.category.name}</span>
          )}
          <h1 className="font-display text-3xl sm:text-4xl text-ink mt-1.5 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            {product.rating_count > 0 && <StarRating value={product.rating_avg} count={product.rating_count} showValue />}
            {product.brand && <span className="text-sm text-ink/45">by {product.brand}</span>}
          </div>

          <div className="flex items-center gap-3 mt-5">
            <span className="font-display text-3xl text-ink tabular-nums">{formatCurrency(finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-ink/40 line-through tabular-nums">{formatCurrency(product.price)}</span>
                <Badge tone="clay">
                  -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
                </Badge>
              </>
            )}
          </div>

          <div className="mt-3">
            {outOfStock ? (
              <Badge tone="danger">Out of stock</Badge>
            ) : stock <= product.low_stock_threshold ? (
              <Badge tone="warning">Only {stock} left in stock</Badge>
            ) : (
              <Badge tone="success">In stock</Badge>
            )}
          </div>

          {product.short_description && (
            <p className="text-ink/65 mt-5 leading-relaxed">{product.short_description}</p>
          )}

          {/* Variants */}
          {Object.entries(variantGroups).map(([type, options]) => (
            <div key={type} className="mt-6">
              <p className="text-sm font-medium text-ink mb-2.5">{type}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={opt.stock_quantity <= 0}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [type]: opt.variant_value }))}
                    className={cn(
                      'h-10 min-w-10 px-3.5 rounded-md border text-sm font-medium transition-colors',
                      selectedVariants[type] === opt.variant_value
                        ? 'border-ink bg-ink text-bone'
                        : 'border-sand-line text-ink/70 hover:border-ink/40',
                      opt.stock_quantity <= 0 && 'opacity-35 cursor-not-allowed line-through'
                    )}
                  >
                    {opt.variant_value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity + actions */}
          <div className="flex items-center gap-3 mt-7">
            <div className="flex items-center border border-sand-line rounded-md h-12">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-11 h-full flex items-center justify-center text-ink/60 hover:text-ink" aria-label="Decrease quantity">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center tabular-nums">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))} className="w-11 h-full flex items-center justify-center text-ink/60 hover:text-ink" aria-label="Increase quantity">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button size="lg" className="flex-1" disabled={outOfStock} onClick={handleAddToCart}>
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </Button>
            <button
              onClick={() => requireAuth(() => toggleWishlist(user!.id, product.id))}
              aria-label="Toggle wishlist"
              className="h-12 w-12 shrink-0 rounded-md border border-sand-line flex items-center justify-center hover:border-ink/40 transition-colors"
            >
              <Heart className={cn('h-5 w-5', isWishlisted ? 'fill-clay text-clay' : 'text-ink/60')} />
            </button>
          </div>
          <Button size="lg" variant="outline" className="w-full mt-3" disabled={outOfStock} onClick={handleAddToCart}>
            Buy Now
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-8 border-t border-sand-line">
            <TrustItem icon={<Truck className="h-4 w-4" />} label="Fast shipping" />
            <TrustItem icon={<RotateCcw className="h-4 w-4" />} label="14-day returns" />
            <TrustItem icon={<ShieldCheck className="h-4 w-4" />} label="Secure checkout" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-6 border-b border-sand-line">
          {(['description', 'specs', 'shipping'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'py-3.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
                tab === t ? 'border-ink text-ink' : 'border-transparent text-ink/45 hover:text-ink'
              )}
            >
              {t === 'specs' ? 'Specifications' : t === 'shipping' ? 'Shipping & Returns' : 'Description'}
            </button>
          ))}
        </div>
        <div className="py-8 max-w-3xl">
          {tab === 'description' && (
            <p className="text-ink/70 leading-relaxed whitespace-pre-line">{product.description || 'No description available.'}</p>
          )}
          {tab === 'specs' && (
            Object.keys(product.specifications ?? {}).length ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-sand-line/70">
                    <dt className="text-sm text-ink/50">{k}</dt>
                    <dd className="text-sm text-ink font-medium">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-ink/50">No specifications listed for this product.</p>
            )
          )}
          {tab === 'shipping' && (
            <div className="text-ink/70 leading-relaxed flex flex-col gap-3">
              <p>Orders are processed within 1–2 business days and typically arrive within 3–7 business days depending on your location.</p>
              <p>Not the right fit? Returns are accepted within 14 days of delivery, provided the item is unused and in its original packaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-4 pt-8 border-t border-sand-line max-w-3xl">
        <ProductReviews productId={product.id} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl text-ink mb-8">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-ink/60">
      <span className="text-moss">{icon}</span>
      {label}
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <Skeleton className="aspect-square rounded-lg" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-40 mt-3" />
        <Skeleton className="h-24 w-full mt-4" />
        <Skeleton className="h-12 w-full mt-6" />
      </div>
    </div>
  )
}

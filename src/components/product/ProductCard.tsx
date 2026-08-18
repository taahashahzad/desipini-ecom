import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import type { Product } from '@/types/database'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { toast } from 'sonner'

export function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (p: Product) => void }) {
  const { user } = useAuth()
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id))

  const primaryImage = product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url
  const secondaryImage = product.images?.[1]?.url
  const hasDiscount = product.sale_price != null && product.sale_price < product.price
  const discountPct = hasDiscount ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0
  const outOfStock = product.stock_quantity <= 0
  const lowStock = !outOfStock && product.stock_quantity <= product.low_stock_threshold

  function requireAuth(action: () => void) {
    if (!user) {
      toast.info('Please sign in first', { description: 'Create an account to save items and check out.' })
      return
    }
    action()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col"
    >
      <div className="relative overflow-hidden rounded-lg bg-sand/40 aspect-[4/5]">
        <Link to={`/products/${product.slug}`} className="block h-full w-full">
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                loading="lazy"
                className={cn(
                  'h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]',
                  secondaryImage && 'group-hover:opacity-0'
                )}
              />
              {secondaryImage && (
                <img
                  src={secondaryImage}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 scale-[1.06] transition-opacity duration-700 ease-out group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-ink/20 font-display text-sm">No image</div>
          )}
        </Link>

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && <Badge tone="clay">-{discountPct}%</Badge>}
          {product.is_featured && <Badge tone="gold">Featured</Badge>}
          {lowStock && <Badge tone="warning">Low stock</Badge>}
          {outOfStock && <Badge tone="danger">Out of stock</Badge>}
        </div>

        <button
          onClick={() => requireAuth(() => toggleWishlist(user!.id, product.id))}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={cn(
            'absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all',
            'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
            isWishlisted && 'opacity-100 translate-y-0'
          )}
        >
          <Heart className={cn('h-4 w-4', isWishlisted ? 'fill-clay text-clay' : 'text-ink')} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-2.5 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            disabled={outOfStock}
            onClick={() => requireAuth(() => addItem(user!.id, product.id, 1))}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-md bg-ink text-bone text-xs font-semibold tracking-wide uppercase hover:bg-moss-dark transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              aria-label="Quick view"
              className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-white/95 text-ink hover:bg-white transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Link to={`/products/${product.slug}`} className="mt-3 flex flex-col gap-1">
        {product.category && (
          <span className="text-[11px] uppercase tracking-wide text-ink/40 font-medium">{product.category.name}</span>
        )}
        <h3 className="font-medium text-[15px] text-ink leading-snug line-clamp-1">{product.name}</h3>
        {product.rating_count > 0 && <StarRating value={product.rating_avg} count={product.rating_count} />}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-semibold text-ink tabular-nums">
            {formatCurrency(hasDiscount ? product.sale_price! : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-ink/40 line-through tabular-nums">{formatCurrency(product.price)}</span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

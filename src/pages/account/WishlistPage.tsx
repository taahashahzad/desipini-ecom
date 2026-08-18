import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import * as wishlistService from '@/services/wishlist'

export default function WishlistPage() {
  const { user } = useAuth()
  const items = useWishlistStore((s) => s.items)
  const loading = useWishlistStore((s) => s.loading)
  const loadWishlist = useWishlistStore((s) => s.loadWishlist)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (user) loadWishlist(user.id)
  }, [user, loadWishlist])

  async function handleRemove(itemId: string) {
    await wishlistService.removeWishlistItem(itemId)
    if (user) loadWishlist(user.id)
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Your wishlist is empty"
          description="Save products you love to find them here later."
          action={<Link to="/products"><Button>Browse Products</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {items.map((item) => {
            const p = item.product
            if (!p) return null
            const image = p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url
            return (
              <div key={item.id} className="group relative">
                <Link to={`/products/${p.slug}`} className="block aspect-[4/5] rounded-lg overflow-hidden bg-sand/40 mb-3">
                  {image && <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                </Link>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-ink/50 hover:text-danger transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Link to={`/products/${p.slug}`} className="text-sm font-medium text-ink hover:underline line-clamp-1">{p.name}</Link>
                <p className="text-sm text-ink/60 mt-0.5">{formatCurrency(p.sale_price ?? p.price)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => user && addItem(user.id, p.id, 1)}
                  disabled={p.stock_quantity <= 0}
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

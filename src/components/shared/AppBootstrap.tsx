import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

export function AppBootstrap() {
  const { user } = useAuth()
  const loadCart = useCartStore((s) => s.loadCart)
  const resetCart = useCartStore((s) => s.reset)
  const loadWishlist = useWishlistStore((s) => s.loadWishlist)
  const resetWishlist = useWishlistStore((s) => s.reset)

  useEffect(() => {
    if (user) {
      loadCart(user.id)
      loadWishlist(user.id)
    } else {
      resetCart()
      resetWishlist()
    }
  }, [user, loadCart, loadWishlist, resetCart, resetWishlist])

  return null
}

import { create } from 'zustand'
import { toast } from 'sonner'
import * as wishlistService from '@/services/wishlist'
import type { WishlistItem } from '@/types/database'

interface WishlistState {
  items: WishlistItem[]
  loading: boolean
  loadWishlist: (userId: string) => Promise<void>
  toggle: (userId: string, productId: string) => Promise<void>
  isWishlisted: (productId: string) => boolean
  reset: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  loadWishlist: async (userId) => {
    set({ loading: true })
    try {
      const items = await wishlistService.fetchWishlist(userId)
      set({ items })
    } finally {
      set({ loading: false })
    }
  },

  toggle: async (userId, productId) => {
    const wasWishlisted = get().isWishlisted(productId)
    try {
      await wishlistService.toggleWishlistItem(userId, productId)
      await get().loadWishlist(userId)
      toast.success(wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    } catch (e: any) {
      toast.error('Could not update wishlist', { description: e.message })
    }
  },

  isWishlisted: (productId) => get().items.some((i) => i.product_id === productId),

  reset: () => set({ items: [] }),
}))

import { create } from 'zustand'
import { toast } from 'sonner'
import * as cartService from '@/services/cart'
import type { CartItem } from '@/types/database'

interface CartState {
  items: CartItem[]
  loading: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  loadCart: (userId: string) => Promise<void>
  addItem: (userId: string, productId: string, quantity: number, variantId?: string | null) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clear: (userId: string) => Promise<void>
  reset: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  loadCart: async (userId) => {
    set({ loading: true })
    try {
      const items = await cartService.fetchCart(userId)
      set({ items })
    } catch (e: any) {
      toast.error('Could not load your cart', { description: e.message })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (userId, productId, quantity, variantId) => {
    try {
      await cartService.addToCart(userId, productId, quantity, variantId)
      await get().loadCart(userId)
      toast.success('Added to cart')
      set({ isOpen: true })
    } catch (e: any) {
      toast.error('Could not add to cart', { description: e.message })
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const prev = get().items
    set({ items: prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)) })
    try {
      await cartService.updateCartItemQuantity(itemId, quantity)
    } catch (e: any) {
      set({ items: prev })
      toast.error('Could not update quantity', { description: e.message })
    }
  },

  removeItem: async (itemId) => {
    const prev = get().items
    set({ items: prev.filter((i) => i.id !== itemId) })
    try {
      await cartService.removeCartItem(itemId)
      toast.success('Removed from cart')
    } catch (e: any) {
      set({ items: prev })
      toast.error('Could not remove item', { description: e.message })
    }
  },

  clear: async (userId) => {
    await cartService.clearCart(userId)
    set({ items: [] })
  },

  reset: () => set({ items: [], isOpen: false }),
}))

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => {
    const base = item.product?.sale_price ?? item.product?.price ?? 0
    const adj = item.variant?.price_adjustment ?? 0
    return sum + (base + adj) * item.quantity
  }, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  return { subtotal, itemCount }
}

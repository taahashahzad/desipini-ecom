import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore, cartTotals } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import { formatCurrency, cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const { subtotal, itemCount } = cartTotals(items)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-bone shadow-[var(--shadow-pop)] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-sand-line shrink-0">
              <h2 className="font-display text-xl text-ink">Your Cart {itemCount > 0 && <span className="text-ink/40 text-base">({itemCount})</span>}</h2>
              <button onClick={closeCart} aria-label="Close cart" className="p-1.5 text-ink/50 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={<ShoppingBag className="h-6 w-6" />}
                  title="Your cart is empty"
                  description="Looks like you haven't added anything yet."
                  action={
                    <Link to="/products" onClick={closeCart}>
                      <Button>Continue Shopping</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
                  {items.map((item) => {
                    const price = (item.product?.sale_price ?? item.product?.price ?? 0) + (item.variant?.price_adjustment ?? 0)
                    const image = item.product?.images?.find((i) => i.is_primary)?.url ?? item.product?.images?.[0]?.url
                    return (
                      <div key={item.id} className="flex gap-3">
                        <Link to={`/products/${item.product?.slug}`} onClick={closeCart} className="h-20 w-20 shrink-0 rounded-md overflow-hidden bg-sand/50">
                          {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link to={`/products/${item.product?.slug}`} onClick={closeCart} className="text-sm font-medium text-ink line-clamp-2 hover:underline">
                              {item.product?.name}
                            </Link>
                            <button onClick={() => removeItem(item.id)} aria-label="Remove item" className="text-ink/35 hover:text-danger shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.variant && (
                            <p className="text-xs text-ink/50 mt-0.5">{item.variant.variant_type}: {item.variant.variant_value}</p>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center border border-sand-line rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="p-1.5 text-ink/60 hover:text-ink"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 text-ink/60 hover:text-ink"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-ink tabular-nums">{formatCurrency(price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="px-6 py-5 border-t border-sand-line shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-ink/60">Subtotal</span>
                    <span className="font-display text-xl text-ink tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                  <p className="text-xs text-ink/45 mb-4">Shipping and taxes calculated at checkout.</p>
                  <Link to="/checkout" onClick={closeCart}>
                    <Button className="w-full" size="lg">Proceed to Checkout</Button>
                  </Link>
                  <button onClick={closeCart} className={cn('w-full text-center text-sm text-ink/60 hover:text-ink mt-3')}>
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

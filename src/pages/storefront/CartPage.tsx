import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore, cartTotals } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const { subtotal, itemCount } = cartTotals(items)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Let's fix that."
          action={<Link to="/products"><Button>Continue Shopping</Button></Link>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">Shopping Cart <span className="text-ink/35 text-xl">({itemCount})</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div className="flex flex-col divide-y divide-sand-line">
          {items.map((item) => {
            const price = (item.product?.sale_price ?? item.product?.price ?? 0) + (item.variant?.price_adjustment ?? 0)
            const image = item.product?.images?.find((i) => i.is_primary)?.url ?? item.product?.images?.[0]?.url
            return (
              <div key={item.id} className="flex gap-4 py-6 first:pt-0">
                <Link to={`/products/${item.product?.slug}`} className="h-24 w-24 shrink-0 rounded-lg overflow-hidden bg-sand/50">
                  {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/products/${item.product?.slug}`} className="font-medium text-ink hover:underline">{item.product?.name}</Link>
                      {item.variant && <p className="text-sm text-ink/50 mt-0.5">{item.variant.variant_type}: {item.variant.variant_value}</p>}
                    </div>
                    <button onClick={() => removeItem(item.id)} aria-label="Remove item" className="text-ink/35 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center border border-sand-line rounded-md">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 text-ink/60 hover:text-ink" aria-label="Decrease quantity">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-ink/60 hover:text-ink" aria-label="Increase quantity">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-semibold text-ink tabular-nums">{formatCurrency(price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-fit rounded-lg border border-sand-line bg-white/50 p-6 sticky top-24">
          <h2 className="font-display text-lg text-ink mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm text-ink/65 py-1.5">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-xs text-ink/40 mt-1 mb-4">Shipping and taxes calculated at checkout</p>
          <Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Button>
          <Link to="/products" className="block text-center text-sm text-ink/60 hover:text-ink mt-4">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

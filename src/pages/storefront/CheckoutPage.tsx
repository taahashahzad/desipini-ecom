import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Tag, Truck, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCartStore, cartTotals } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { fetchAddresses } from '@/services/addresses'
import { fetchStoreSettings } from '@/services/settings'
import { validateCoupon } from '@/services/coupons'
import { placeOrder } from '@/services/orders'
import type { Address, Coupon, StoreSettings } from '@/types/database'
import { EmptyState } from '@/components/ui/EmptyState'

export default function CheckoutPage() {
  const { user, profile } = useAuth()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const { subtotal } = cartTotals(items)
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [placing, setPlacing] = useState(false)

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    email: user?.email ?? '',
    phone: profile?.phone ?? '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Pakistan',
  })

  useEffect(() => {
    if (!user) return
    fetchAddresses(user.id).then((list) => {
      setAddresses(list)
      const def = list.find((a) => a.is_default) ?? list[0]
      if (def) {
        setSelectedAddressId(def.id)
        applyAddress(def)
      }
    })
    fetchStoreSettings().then(setSettings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function applyAddress(a: Address) {
    setForm((f) => ({
      ...f,
      full_name: a.full_name,
      phone: a.phone ?? '',
      address_line1: a.address_line1,
      address_line2: a.address_line2 ?? '',
      city: a.city,
      state: a.state ?? '',
      postal_code: a.postal_code ?? '',
      country: a.country,
    }))
  }

  const shippingAmount = settings
    ? subtotal >= settings.shipping.free_shipping_threshold
      ? 0
      : settings.shipping.flat_rate
    : 0
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.min(
          Math.round((subtotal * appliedCoupon.discount_value) / 100),
          appliedCoupon.max_discount_amount ?? Infinity
        )
      : Math.min(appliedCoupon.discount_value, subtotal)
    : 0
  const taxAmount = settings ? Math.round(((subtotal - discountAmount) * settings.tax.percentage) / 100) : 0
  const total = subtotal - discountAmount + shippingAmount + taxAmount

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const coupon = await validateCoupon(couponCode.trim(), subtotal)
      setAppliedCoupon(coupon)
      toast.success('Coupon applied')
    } catch (e: any) {
      toast.error(e.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  async function handlePlaceOrder() {
    if (!user) return
    if (!form.full_name || !form.address_line1 || !form.city || !form.phone) {
      toast.error('Please fill in all required shipping details')
      return
    }
    setPlacing(true)
    try {
      const order = await placeOrder({
        items,
        shipping: {
          full_name: form.full_name,
          phone: form.phone,
          address_line1: form.address_line1,
          address_line2: form.address_line2 || undefined,
          city: form.city,
          state: form.state || undefined,
          postal_code: form.postal_code || undefined,
          country: form.country,
        },
        customerName: form.full_name,
        customerEmail: form.email,
        customerPhone: form.phone,
        paymentMethod: 'cod',
        shippingAmount,
        taxAmount,
        couponCode: appliedCoupon?.code,
      })
      useCartStore.getState().reset()
      navigate(`/order-confirmation/${order.id}`)
    } catch (e: any) {
      toast.error('Could not place order', { description: e.message })
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState title="Your cart is empty" description="Add some products before checking out." action={<Link to="/products"><Button>Browse Products</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-display text-lg text-ink mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-ink">Shipping Address</h2>
            </div>

            {addresses.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelectedAddressId(a.id)
                      applyAddress(a)
                    }}
                    className={`text-left px-3.5 py-2.5 rounded-md border text-sm max-w-xs ${
                      selectedAddressId === a.id ? 'border-ink bg-ink/[0.03]' : 'border-sand-line hover:border-ink/30'
                    }`}
                  >
                    <p className="font-medium text-ink">{a.full_name}</p>
                    <p className="text-ink/50 text-xs truncate">{a.address_line1}, {a.city}</p>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectedAddressId('')
                    setForm((f) => ({ ...f, address_line1: '', address_line2: '', city: '', state: '', postal_code: '' }))
                  }}
                  className={`px-3.5 py-2.5 rounded-md border border-dashed text-sm text-ink/50 hover:border-ink/40 ${!selectedAddressId ? 'border-ink text-ink' : 'border-sand-line'}`}
                >
                  + New Address
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Input value={form.address_line1} onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))} placeholder="Street address" required />
              </div>
              <div className="sm:col-span-2">
                <Input value={form.address_line2} onChange={(e) => setForm((f) => ({ ...f, address_line2: e.target.value }))} placeholder="Apartment, suite, etc. (optional)" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
              </div>
              <div>
                <Label>State / Province</Label>
                <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} required />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-4">Payment</h2>
            <div className="flex items-center gap-3 rounded-md border border-moss/30 bg-moss/5 px-4 py-3.5">
              <Truck className="h-5 w-5 text-moss-dark shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">Cash on Delivery</p>
                <p className="text-xs text-ink/50">Pay with cash when your order arrives.</p>
              </div>
            </div>
            <p className="text-xs text-ink/40 mt-3">Additional payment methods can be enabled by the store admin at any time.</p>
          </section>
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-lg border border-sand-line bg-white/50 p-6 sticky top-24">
          <h2 className="font-display text-lg text-ink mb-4">Order Summary</h2>

          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-4 pr-1">
            {items.map((item) => {
              const price = (item.product?.sale_price ?? item.product?.price ?? 0) + (item.variant?.price_adjustment ?? 0)
              const image = item.product?.images?.find((i) => i.is_primary)?.url ?? item.product?.images?.[0]?.url
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-sand/50">
                    {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-ink text-bone text-[10px] flex items-center justify-center font-semibold">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{item.product?.name}</p>
                    {item.variant && <p className="text-xs text-ink/45">{item.variant.variant_value}</p>}
                  </div>
                  <span className="text-sm text-ink tabular-nums shrink-0">{formatCurrency(price * item.quantity)}</span>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="h-10"
            />
            <Button variant="outline" size="sm" className="h-10 shrink-0" loading={couponLoading} onClick={handleApplyCoupon}>
              Apply
            </Button>
          </div>
          {appliedCoupon && (
            <div className="flex items-center justify-between text-sm bg-moss/10 text-moss-dark rounded-md px-3 py-2 mb-4">
              <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}</span>
              <button onClick={() => { setAppliedCoupon(null); setCouponCode('') }} aria-label="Remove coupon"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}

          <div className="flex flex-col gap-2 py-4 border-t border-sand-line text-sm">
            <div className="flex justify-between text-ink/65">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-moss-dark">
                <span>Discount</span>
                <span className="tabular-nums">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/65">
              <span>Shipping</span>
              <span className="tabular-nums">{shippingAmount === 0 ? 'Free' : formatCurrency(shippingAmount)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between text-ink/65">
                <span>Tax</span>
                <span className="tabular-nums">{formatCurrency(taxAmount)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center py-4 border-t border-sand-line">
            <span className="font-medium text-ink">Total</span>
            <span className="font-display text-2xl text-ink tabular-nums">{formatCurrency(total)}</span>
          </div>

          <Button size="lg" className="w-full" loading={placing} onClick={handlePlaceOrder}>
            Place Order
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink/40 mt-3">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout, encrypted end to end
          </p>
        </div>
      </div>
    </div>
  )
}

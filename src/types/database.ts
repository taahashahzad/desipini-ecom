// Hand-authored types mirroring supabase_schema.sql.
// If you prefer generated types, run:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
// and merge the domain helper types below back in.

export type UserRole = 'customer' | 'admin'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type DiscountType = 'percentage' | 'fixed'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_disabled: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  product_count?: number
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt: string | null
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  variant_type: string
  variant_value: string
  price_adjustment: number
  stock_quantity: number
  sku: string | null
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  category_id: string | null
  brand: string | null
  price: number
  sale_price: number | null
  sku: string | null
  stock_quantity: number
  reserved_quantity: number
  low_stock_threshold: number
  tags: string[]
  specifications: Record<string, string>
  rating_avg: number
  rating_count: number
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string
  // joined relations (populated by services, not raw columns)
  category?: Category | null
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string | null
  address_line1: string
  address_line2: string | null
  city: string
  state: string | null
  postal_code: string | null
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
  variant?: ProductVariant | null
}

export interface WishlistItem {
  id: string
  wishlist_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Coupon {
  id: string
  code: string
  discount_type: DiscountType
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  expires_at: string | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  variant_info: Record<string, string> | null
  unit_price: number
  quantity: number
  subtotal: number
  created_at: string
}

export interface OrderStatusHistoryEntry {
  id: string
  order_id: string
  status: OrderStatus
  note: string | null
  created_at: string
}

export interface ShippingAddressSnapshot {
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code?: string
  country: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  status: OrderStatus
  payment_method: string
  payment_status: PaymentStatus
  subtotal: number
  discount_amount: number
  shipping_amount: number
  tax_amount: number
  total_amount: number
  coupon_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: ShippingAddressSnapshot
  tracking_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  status_history?: OrderStatusHistoryEntry[]
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_id: string | null
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  reviewer_name?: string | null
}

export interface StoreSettings {
  store_info: {
    name: string
    description: string
    contact_email: string
    phone: string
    address: string
    logo_url: string
    favicon_url: string
  }
  shipping: {
    flat_rate: number
    free_shipping_threshold: number
  }
  tax: {
    percentage: number
  }
  order: {
    default_status: OrderStatus
  }
}

// Minimal Database type so the Supabase client stays type-aware without
// requiring codegen. We intentionally type it as `any` here: Supabase's
// generic client uses this type to infer insert/update/select shapes per
// table, and without generated types that inference would otherwise
// collapse every table to `never`. Swap in `supabase gen types` output
// for full compile-time safety on table operations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any

import { supabase } from '@/lib/supabase'
import type { CartItem, Order, OrderStatus, ShippingAddressSnapshot } from '@/types/database'

const ORDER_SELECT = `*, items:order_items(*), status_history:order_status_history(*)`

export interface PlaceOrderInput {
  items: CartItem[]
  shipping: ShippingAddressSnapshot
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentMethod: string
  shippingAmount: number
  taxAmount: number
  couponCode?: string
}

export async function placeOrder(input: PlaceOrderInput) {
  const items = input.items.map((item) => {
    const unitPrice = item.variant
      ? (item.product?.sale_price ?? item.product?.price ?? 0) + item.variant.price_adjustment
      : item.product?.sale_price ?? item.product?.price ?? 0
    return {
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      product_name: item.product?.name ?? 'Product',
      product_image: item.product?.images?.find((i) => i.is_primary)?.url ?? item.product?.images?.[0]?.url ?? null,
      variant_info: item.variant ? { [item.variant.variant_type]: item.variant.variant_value } : null,
    }
  })

  const { data, error } = await supabase.rpc('place_order', {
    p_items: items,
    p_shipping: input.shipping,
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_customer_phone: input.customerPhone,
    p_payment_method: input.paymentMethod,
    p_shipping_amount: input.shippingAmount,
    p_tax_amount: input.taxAmount,
    p_coupon_code: input.couponCode || null,
  })

  if (error) throw error
  return data as unknown as Order
}

export async function fetchMyOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Order[]
}

export async function fetchOrderById(id: string) {
  const { data, error } = await supabase.from('orders').select(ORDER_SELECT).eq('id', id).single()
  if (error) throw error
  return data as unknown as Order
}

// ---------------- Admin ----------------

export interface AdminOrderFilters {
  status?: OrderStatus | 'all'
  search?: string
  page?: number
  pageSize?: number
}

export async function adminFetchOrders(filters: AdminOrderFilters = {}) {
  const { status, search, page = 1, pageSize = 20 } = filters
  let query = supabase.from('orders').select(ORDER_SELECT, { count: 'exact' }).order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  if (search) query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)
  const { data, error, count } = await query
  if (error) throw error
  return { orders: (data ?? []) as unknown as Order[], total: count ?? 0 }
}

const STATUS_LABELS_INTERNAL: Record<OrderStatus, string> = {
  pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing', packed: 'Packed',
  shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
  cancelled: 'Cancelled', returned: 'Returned',
}

export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  if (error) throw error
  // The DB trigger only auto-logs the initial "pending" row on order
  // creation, so every subsequent status change is logged here exactly once.
  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({ order_id: orderId, status, note: note ?? `Status updated to ${STATUS_LABELS_INTERNAL[status]}` })
  if (historyError) throw historyError
}

export async function adminUpdateOrder(orderId: string, payload: Partial<Order>) {
  const { error } = await supabase.from('orders').update(payload).eq('id', orderId)
  if (error) throw error
}

export async function adminCancelOrder(orderId: string, note?: string) {
  await adminUpdateOrderStatus(orderId, 'cancelled', note ?? 'Cancelled by admin')
}
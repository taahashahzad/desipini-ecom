import { supabase } from '@/lib/supabase'
import { subDays, format } from 'date-fns'

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  lowStockProducts: number
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [ordersRes, productsRes, customersRes, pendingRes, lowStockRes] = await Promise.all([
    supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('low_stock_products').select('id', { count: 'exact', head: true }),
  ])

  const totalRevenue = (ordersRes.data ?? []).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0)

  return {
    totalRevenue,
    totalOrders: ordersRes.data?.length ?? 0,
    totalProducts: productsRes.count ?? 0,
    totalCustomers: customersRes.count ?? 0,
    pendingOrders: pendingRes.count ?? 0,
    lowStockProducts: lowStockRes.count ?? 0,
  }
}

export async function fetchRevenueSeries(range: '7d' | '30d' | '6m' | '1y') {
  const days = { '7d': 7, '30d': 30, '6m': 182, '1y': 365 }[range]
  const since = subDays(new Date(), days).toISOString()

  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .neq('status', 'cancelled')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
  if (error) throw error

  const bucketFmt = days <= 30 ? 'MMM d' : 'MMM yyyy'
  const buckets = new Map<string, { revenue: number; orders: number }>()
  for (const row of data ?? []) {
    const key = format(new Date((row as any).created_at), bucketFmt)
    const existing = buckets.get(key) ?? { revenue: 0, orders: 0 }
    existing.revenue += Number((row as any).total_amount)
    existing.orders += 1
    buckets.set(key, existing)
  }
  return Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }))
}

export async function fetchTopProducts(limit = 5) {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, product_name, quantity, subtotal')
  if (error) throw error

  const map = new Map<string, { name: string; units: number; revenue: number }>()
  for (const row of data ?? []) {
    const key = (row as any).product_id ?? (row as any).product_name
    const existing = map.get(key) ?? { name: (row as any).product_name, units: 0, revenue: 0 }
    existing.units += (row as any).quantity
    existing.revenue += Number((row as any).subtotal)
    map.set(key, existing)
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

export async function fetchBestSellingCategories(limit = 5) {
  const { data, error } = await supabase
    .from('order_items')
    .select('subtotal, product:products(category:categories(name))')
  if (error) throw error

  const map = new Map<string, number>()
  for (const row of data ?? []) {
    const name = (row as any).product?.category?.name ?? 'Uncategorized'
    map.set(name, (map.get(name) ?? 0) + Number((row as any).subtotal))
  }
  return Array.from(map.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

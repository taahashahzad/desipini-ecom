import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export async function adminFetchCustomers(search?: string) {
  let query = supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })
  if (search) query = query.ilike('full_name', `%${search}%`)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function adminFetchCustomerDetail(userId: string) {
  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('orders').select('*, items:order_items(*)').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  const totalSpending = (orders ?? [])
    .filter((o: any) => o.status !== 'cancelled')
    .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0)

  return {
    profile: profile as unknown as Profile,
    orders: (orders ?? []) as any[],
    totalOrders: orders?.length ?? 0,
    totalSpending,
  }
}

export async function adminSetCustomerDisabled(userId: string, disabled: boolean) {
  const { error } = await supabase.from('profiles').update({ is_disabled: disabled }).eq('id', userId)
  if (error) throw error
}

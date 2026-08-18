import { supabase } from '@/lib/supabase'
import type { Coupon } from '@/types/database'

export async function validateCoupon(code: string, orderAmount: number) {
  const { data, error } = await supabase.rpc('validate_coupon', { p_code: code, p_order_amount: orderAmount })
  if (error) throw new Error(error.message.replace(/^.*?:\s*/, ''))
  return data as unknown as Coupon
}

export async function adminFetchCoupons() {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Coupon[]
}

export async function adminCreateCoupon(payload: Partial<Coupon>) {
  const { data, error } = await supabase
    .from('coupons')
    .insert({ ...payload, code: payload.code?.toUpperCase() })
    .select()
    .single()
  if (error) throw error
  return data as unknown as Coupon
}

export async function adminUpdateCoupon(id: string, payload: Partial<Coupon>) {
  const { data, error } = await supabase
    .from('coupons')
    .update({ ...payload, code: payload.code ? payload.code.toUpperCase() : undefined })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as unknown as Coupon
}

export async function adminDeleteCoupon(id: string) {
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) throw error
}

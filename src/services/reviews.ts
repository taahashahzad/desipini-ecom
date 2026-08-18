import { supabase } from '@/lib/supabase'
import type { Review } from '@/types/database'

export async function fetchProductReviews(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles(full_name)')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({ ...r, reviewer_name: r.reviewer?.full_name })) as Review[]
}

export async function fetchMyReviewForProduct(userId: string, productId: string) {
  const { data } = await supabase.from('reviews').select('*').eq('user_id', userId).eq('product_id', productId).maybeSingle()
  return data as unknown as Review | null
}

export async function canReviewProduct(userId: string, productId: string) {
  const { data } = await supabase
    .from('order_items')
    .select('id, order:orders!inner(user_id, status)')
    .eq('product_id', productId)
    .eq('orders.user_id', userId)
  return (data ?? []).length > 0
}

export async function submitReview(userId: string, productId: string, rating: number, comment: string) {
  const { data, error } = await supabase
    .from('reviews')
    .upsert({ user_id: userId, product_id: productId, rating, comment, is_approved: false }, { onConflict: 'product_id,user_id' })
    .select()
    .single()
  if (error) throw error
  return data as unknown as Review
}

// ---------------- Admin ----------------

export async function adminFetchReviews(filter: 'all' | 'pending' | 'approved' = 'all') {
  let query = supabase
    .from('reviews')
    .select('*, product:products(name, slug), reviewer:profiles(full_name)')
    .order('created_at', { ascending: false })
  if (filter === 'pending') query = query.eq('is_approved', false)
  if (filter === 'approved') query = query.eq('is_approved', true)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as any[]
}

export async function adminSetReviewApproval(id: string, approved: boolean) {
  const { error } = await supabase.from('reviews').update({ is_approved: approved }).eq('id', id)
  if (error) throw error
}

export async function adminDeleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
}

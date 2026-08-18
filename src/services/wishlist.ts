import { supabase } from '@/lib/supabase'
import type { WishlistItem } from '@/types/database'

const ITEM_SELECT = `*, product:products(*, images:product_images(*))`

async function getOrCreateWishlistId(userId: string) {
  const { data } = await supabase.from('wishlists').select('id').eq('user_id', userId).single()
  if (data) return (data as { id: string }).id
  const { data: created, error } = await supabase.from('wishlists').insert({ user_id: userId }).select('id').single()
  if (error) throw error
  return (created as { id: string }).id
}

export async function fetchWishlist(userId: string) {
  const wishlistId = await getOrCreateWishlistId(userId)
  const { data, error } = await supabase.from('wishlist_items').select(ITEM_SELECT).eq('wishlist_id', wishlistId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as WishlistItem[]
}

export async function toggleWishlistItem(userId: string, productId: string) {
  const wishlistId = await getOrCreateWishlistId(userId)
  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlistId)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', (existing as any).id)
    return false
  }
  await supabase.from('wishlist_items').insert({ wishlist_id: wishlistId, product_id: productId })
  return true
}

export async function removeWishlistItem(itemId: string) {
  const { error } = await supabase.from('wishlist_items').delete().eq('id', itemId)
  if (error) throw error
}

import { supabase } from '@/lib/supabase'
import type { CartItem } from '@/types/database'

const ITEM_SELECT = `*, product:products(*, images:product_images(*)), variant:product_variants(*)`

async function getOrCreateCartId(userId: string) {
  const { data } = await supabase.from('carts').select('id').eq('user_id', userId).single()
  if (data) return (data as { id: string }).id
  const { data: created, error } = await supabase.from('carts').insert({ user_id: userId }).select('id').single()
  if (error) throw error
  return (created as { id: string }).id
}

export async function fetchCart(userId: string) {
  const cartId = await getOrCreateCartId(userId)
  const { data, error } = await supabase.from('cart_items').select(ITEM_SELECT).eq('cart_id', cartId).order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as CartItem[]
}

export async function addToCart(userId: string, productId: string, quantity: number, variantId?: string | null) {
  const cartId = await getOrCreateCartId(userId)
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .eq('variant_id', variantId ?? null)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: (existing as any).quantity + quantity })
      .eq('id', (existing as any).id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('cart_items').insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId ?? null,
      quantity,
    })
    if (error) throw error
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
  if (error) throw error
}

export async function removeCartItem(itemId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
  if (error) throw error
}

export async function clearCart(userId: string) {
  const cartId = await getOrCreateCartId(userId)
  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId)
  if (error) throw error
}

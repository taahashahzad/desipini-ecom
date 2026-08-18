import { supabase } from '@/lib/supabase'
import type { Address } from '@/types/database'

export async function fetchAddresses(userId: string) {
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Address[]
}

export async function createAddress(userId: string, payload: Partial<Address>) {
  if (payload.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
  }
  const { data, error } = await supabase.from('addresses').insert({ ...payload, user_id: userId }).select().single()
  if (error) throw error
  return data as unknown as Address
}

export async function updateAddress(id: string, userId: string, payload: Partial<Address>) {
  if (payload.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
  }
  const { data, error } = await supabase.from('addresses').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as unknown as Address
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from('addresses').delete().eq('id', id)
  if (error) throw error
}

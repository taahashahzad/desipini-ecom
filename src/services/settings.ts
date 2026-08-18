import { supabase } from '@/lib/supabase'
import type { StoreSettings } from '@/types/database'

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase.from('store_settings').select('key, value')
  if (error) throw error
  const map: any = {}
  for (const row of data ?? []) map[(row as any).key] = (row as any).value
  return map as StoreSettings
}

export async function updateStoreSetting(key: keyof StoreSettings, value: unknown) {
  const { error } = await supabase.from('store_settings').upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
}

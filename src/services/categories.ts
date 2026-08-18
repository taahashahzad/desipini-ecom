import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'

export async function fetchCategories(activeOnly = true) {
  let query = supabase.from('categories').select('*, products:products(count)').order('sort_order', { ascending: true })
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((c: any) => ({
    ...c,
    product_count: c.products?.[0]?.count ?? 0,
  })) as Category[]
}

export async function fetchCategoryBySlug(slug: string) {
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (error) throw error
  return data as unknown as Category
}

export async function adminFetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, products:products(count)')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((c: any) => ({ ...c, product_count: c.products?.[0]?.count ?? 0 })) as Category[]
}

export async function createCategory(payload: Partial<Category>) {
  const { data, error } = await supabase.from('categories').insert(payload).select().single()
  if (error) throw error
  return data as unknown as Category
}

export async function updateCategory(id: string, payload: Partial<Category>) {
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as unknown as Category
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

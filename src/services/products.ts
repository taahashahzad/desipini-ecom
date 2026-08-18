import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'

export interface ProductFilters {
  categorySlug?: string
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStockOnly?: boolean
  onSaleOnly?: boolean
  featuredOnly?: boolean
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular'
  page?: number
  pageSize?: number
}

const PRODUCT_SELECT = `*, category:categories(id,name,slug), images:product_images(*), variants:product_variants(*)`

export async function fetchProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    categoryId,
    search,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    onSaleOnly,
    featuredOnly,
    sort = 'featured',
    page = 1,
    pageSize = 12,
  } = filters

  let query = supabase.from('products').select(PRODUCT_SELECT, { count: 'exact' }).eq('is_published', true)

  if (categoryId) query = query.eq('category_id', categoryId)
  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) query = query.eq('category_id', (cat as { id: string }).id)
  }
  if (search) query = query.textSearch('name', search, { type: 'websearch', config: 'english' }).or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  if (minPrice !== undefined) query = query.gte('price', minPrice)
  if (maxPrice !== undefined) query = query.lte('price', maxPrice)
  if (minRating !== undefined) query = query.gte('rating_avg', minRating)
  if (inStockOnly) query = query.gt('stock_quantity', 0)
  if (onSaleOnly) query = query.not('sale_price', 'is', null)
  if (featuredOnly) query = query.eq('is_featured', true)

  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating_avg', { ascending: false })
      break
    case 'popular':
      query = query.order('rating_count', { ascending: false })
      break
    default:
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { products: (data ?? []) as unknown as Product[], total: count ?? 0 }
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('slug', slug).single()
  if (error) throw error
  return data as unknown as Product
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).single()
  if (error) throw error
  return data as unknown as Product
}

export async function fetchRelatedProducts(categoryId: string | null, excludeId: string, limit = 4) {
  if (!categoryId) return []
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', categoryId)
    .eq('is_published', true)
    .neq('id', excludeId)
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as Product[]
}

export async function fetchFeaturedProducts(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as Product[]
}

export async function fetchNewArrivals(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as Product[]
}

export async function fetchBestSellers(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_published', true)
    .order('rating_count', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as Product[]
}

// ---------------- Admin CRUD ----------------

export async function adminFetchProducts(opts: { search?: string; page?: number; pageSize?: number } = {}) {
  const { search, page = 1, pageSize = 20 } = opts
  let query = supabase.from('products').select(PRODUCT_SELECT, { count: 'exact' }).order('created_at', { ascending: false })
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)
  const { data, error, count } = await query
  if (error) throw error
  return { products: (data ?? []) as unknown as Product[], total: count ?? 0 }
}

export async function createProduct(payload: Partial<Product>) {
  const { images, variants, category, ...rest } = payload
  const { data, error } = await supabase.from('products').insert(rest).select().single()
  if (error) throw error
  return data as unknown as Product
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { images, variants, category, ...rest } = payload
  const { data, error } = await supabase.from('products').update(rest).eq('id', id).select().single()
  if (error) throw error
  return data as unknown as Product
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function duplicateProduct(product: Product) {
  const copy = {
    ...product,
    id: undefined,
    name: `${product.name} (Copy)`,
    slug: `${product.slug}-copy-${Date.now().toString(36)}`,
    sku: product.sku ? `${product.sku}-copy` : null,
    is_published: false,
    created_at: undefined,
    updated_at: undefined,
  }
  delete (copy as any).id
  delete (copy as any).created_at
  delete (copy as any).updated_at
  delete (copy as any).category
  delete (copy as any).images
  delete (copy as any).variants
  const { data, error } = await supabase.from('products').insert(copy).select().single()
  if (error) throw error
  return data as unknown as Product
}

export async function setProductImages(productId: string, images: { url: string; is_primary: boolean; sort_order: number; alt?: string }[]) {
  await supabase.from('product_images').delete().eq('product_id', productId)
  if (images.length === 0) return
  const { error } = await supabase.from('product_images').insert(images.map((img) => ({ ...img, product_id: productId })))
  if (error) throw error
}

export async function setProductVariants(productId: string, variants: { variant_type: string; variant_value: string; price_adjustment: number; stock_quantity: number; sku?: string; sort_order: number }[]) {
  await supabase.from('product_variants').delete().eq('product_id', productId)
  if (variants.length === 0) return
  const { error } = await supabase.from('product_variants').insert(variants.map((v) => ({ ...v, product_id: productId })))
  if (error) throw error
}

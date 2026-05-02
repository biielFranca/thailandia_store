import { createClient } from '@/lib/supabase/server'
import type { ProductWithImages, ProductWithCategory } from '@/core/types'

export async function getProducts(storeSlug = 'thailandia') {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (*),
      categories (*)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProductWithCategory[]
}

export async function getFeaturedProducts(storeSlug = 'thailandia') {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`*, product_images (*)`)
    .eq('active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProductWithImages[]
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`*, product_images (*), categories (*)`)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) return null
  return data as ProductWithCategory
}

export async function getProductsByCategory(categorySlug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`*, product_images (*), categories!inner (*)`)
    .eq('active', true)
    .eq('categories.slug', categorySlug)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProductWithCategory[]
}

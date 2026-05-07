import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/core/types'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) return null
  return data
}

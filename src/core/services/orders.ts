import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'
import type { OrderWithItems, CartItem, Address } from '@/core/types'

type CreateOrderInput = {
  storeId: string
  profileId?: string
  items: CartItem[]
  shippingAddress: Address | Record<string, Json>
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  shippingCost?: number
  notes?: string
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient()

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const total = subtotal + (input.shippingCost ?? 0)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      store_id: input.storeId,
      profile_id: input.profileId ?? null,
      subtotal,
      shipping_cost: input.shippingCost ?? 0,
      total,
      shipping_address: input.shippingAddress,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      notes: input.notes,
    })
    .select()
    .single()

  if (orderError) throw orderError

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_snapshot: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      slug: item.product.slug,
      image: item.product.product_images?.[0]?.url ?? null,
    },
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw itemsError

  return order
}

export async function getOrderById(orderId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*, products (*)), payments (*)`)
    .eq('id', orderId)
    .single()

  if (error) return null
  return data as OrderWithItems
}

export async function getOrdersByProfile(profileId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*, products (*)), payments (*)`)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as OrderWithItems[]
}

import type { Tables, Enums } from '@/lib/supabase/database.types'

export type Store = Tables<'stores'>
export type Profile = Tables<'profiles'>
export type Address = Tables<'addresses'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type ProductImage = Tables<'product_images'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Payment = Tables<'payments'>
export type OrderStatusHistory = Tables<'order_status_history'>

export type OrderStatus = Enums<'order_status'>
export type PaymentStatus = Enums<'payment_status'>

export type ProductWithImages = Product & {
  product_images: ProductImage[]
}

export type ProductWithCategory = Product & {
  categories: Category | null
  product_images: ProductImage[]
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { products: Product | null })[]
  payments: Payment[]
}

export type ProductReview = Tables<'product_reviews'>
export type Wishlist = Tables<'wishlists'>

export type ReviewWithProfile = ProductReview & {
  profiles: { full_name: string | null } | null
}

export type CartItem = {
  product: ProductWithImages
  quantity: number
}

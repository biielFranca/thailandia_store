"use server";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { storeConfig } from "@/config/store";
import {
  applyPaymentTotal,
  round2,
  validatePlaceOrderInput,
  type PlaceOrderInput,
} from "@/core/validators/checkout";

interface ProductLookup {
  id: string;
  slug: string;
  name: string;
  price: number;
  active: boolean;
  stock_quantity: number;
  metadata: { sizes?: string[]; status?: string | null } | null;
  product_images: { url: string; position: number }[];
  categories: { slug: string } | null;
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; total: number; paymentMethod: "pix" | "card" }
  | { ok: false; error: string };

// One row in `stores` is expected — looked up by slug. Cached per request.
async function resolveStoreId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeConfig.slug)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Server Action: turn a sanitized cart into a real `orders` + `order_items`
 * pair. Trusts NOTHING from the client beyond {slug, size, quantity}: prices,
 * subtotals, and totals are recomputed here against the catalog.
 *
 * Guests are allowed (orders.profile_id stays null). Authenticated users get
 * profile_id set via auth.uid() so RLS lets them read the order back.
 *
 * Note: the static catalog is the source of truth for product price/stock
 * until P1 #5 migrates the catalog to Supabase. The contract here doesn't
 * change when that swap happens.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const validationError = validatePlaceOrderInput(input);
  if (validationError) return { ok: false, error: validationError };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const profileId = authData.user?.id ?? null;

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };

  // Resolve every cart item against the catalog; reject anything missing or
  // with an unknown size.
  type ResolvedItem = {
    slug: string;
    size: string;
    quantity: number;
    name: string;
    unitPrice: number;
    image: string | null;
    productId: string;
    snapshot: Json;
  };

  // Re-fetch every product the cart references in a single query. Trust nothing
  // that came from the client — pricing, availability and size validation all
  // happen here against the database row.
  const slugs = Array.from(new Set(input.items.map((i) => i.slug)));
  const { data: rows } = await supabase
    .from("products")
    .select("id, slug, name, price, active, stock_quantity, metadata, product_images (url, position), categories (slug)")
    .eq("store_id", storeId)
    .in("slug", slugs);
  const productBySlug = new Map<string, ProductLookup>(
    ((rows ?? []) as unknown as ProductLookup[]).map((r) => [r.slug, r])
  );

  const resolved: ResolvedItem[] = [];
  // Aggregate quantity per slug to enforce stock against the line totals,
  // not just the individual lines.
  const totalQtyBySlug = new Map<string, number>();
  for (const it of input.items) {
    totalQtyBySlug.set(it.slug, (totalQtyBySlug.get(it.slug) ?? 0) + it.quantity);
  }

  for (const it of input.items) {
    const product = productBySlug.get(it.slug);
    if (!product || !product.active) {
      return { ok: false, error: `Produto indisponível: ${it.slug}` };
    }
    const sizes = product.metadata?.sizes ?? [];
    if (sizes.length > 0 && !sizes.includes(it.size)) {
      return { ok: false, error: `Tamanho ${it.size} indisponível para ${product.name}.` };
    }
    if (product.metadata?.status === "Sob encomenda") {
      return { ok: false, error: `${product.name} está sob encomenda; não pode ser finalizado pelo site agora.` };
    }
    const totalQty = totalQtyBySlug.get(it.slug) ?? it.quantity;
    if (product.stock_quantity < totalQty) {
      return {
        ok: false,
        error: `Estoque insuficiente para ${product.name} (${product.stock_quantity} disponíveis).`,
      };
    }

    const sortedImages = [...product.product_images].sort((a, b) => a.position - b.position);
    const image = sortedImages[0]?.url ?? null;
    const unitPrice = Number(product.price);

    resolved.push({
      slug: product.slug,
      size: it.size,
      quantity: it.quantity,
      name: product.name,
      unitPrice,
      image,
      productId: product.id,
      snapshot: {
        slug: product.slug,
        name: product.name,
        size: it.size,
        unit_price: unitPrice,
        image,
        category_slug: product.categories?.slug ?? null,
      },
    });
  }

  const subtotal = round2(resolved.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0));
  const total = applyPaymentTotal(subtotal, input.paymentMethod);
  const shippingCost = 0; // P2 #9 will plug real shipping calc.

  const shippingAddress = {
    cep: input.address.cep.replace(/\D/g, ""),
    street: input.address.street.trim(),
    number: input.address.number.trim(),
    complement: input.address.complement?.trim() || null,
    neighborhood: input.address.neighborhood?.trim() || null,
    city: input.address.city.trim(),
    state: input.address.state.trim().toUpperCase(),
    country: "BR",
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      store_id: storeId,
      profile_id: profileId,
      subtotal,
      shipping_cost: shippingCost,
      total,
      shipping_address: shippingAddress,
      customer_name: input.customer.name.trim(),
      customer_email: input.customer.email.trim().toLowerCase(),
      customer_phone: input.customer.phone?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { ok: false, error: "Não foi possível criar o pedido. Tente novamente." };
  }

  const itemsPayload = resolved.map((r) => ({
    order_id: order.id,
    product_id: r.productId,
    quantity: r.quantity,
    unit_price: r.unitPrice,
    total_price: round2(r.unitPrice * r.quantity),
    product_snapshot: r.snapshot,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
  if (itemsError) {
    // Best-effort cleanup so we don't leak orphan orders.
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "Falha ao salvar itens do pedido. Tente novamente." };
  }

  return { ok: true, orderId: order.id, total, paymentMethod: input.paymentMethod };
}

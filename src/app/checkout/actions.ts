"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMpPaymentClient } from "@/lib/mercadopago";
import { decrementStockForOrder } from "@/lib/stock";
import { sendOrderReceivedEmail, sendPaymentConfirmedEmail } from "@/lib/email/send";
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

/** PIX data returned after order creation. */
export interface PixPaymentData {
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; total: number; paymentMethod: "pix"; pixData: PixPaymentData }
  | { ok: true; orderId: string; total: number; paymentMethod: "card" }
  | { ok: false; error: string };

export type CardPaymentResult =
  | { ok: true; orderId: string }
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
 * pair, then immediately create the Mercado Pago payment:
 *   - PIX  → returns QR code data; order stays in pending_payment until webhook fires.
 *   - Card → returns orderId only; payment happens via the Checkout Brick on the
 *            next page calling processCardPayment().
 *
 * Trusts NOTHING from the client beyond {slug, size, quantity}: prices,
 * subtotals, and totals are recomputed here against the catalog.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const validationError = validatePlaceOrderInput(input);
  if (validationError) return { ok: false, error: validationError };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const profileId = authData.user?.id ?? null;

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };

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
  const shippingCost = 0;

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
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "Falha ao salvar itens do pedido. Tente novamente." };
  }

  // ── PIX: create payment immediately and return QR code data ─────────────────
  if (input.paymentMethod === "pix") {
    try {
      const mp = getMpPaymentClient();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      const mpResult = await mp.create({
        body: {
          transaction_amount: total,
          payment_method_id: "pix",
          payer: {
            email: input.customer.email.trim().toLowerCase(),
            first_name: input.customer.name.trim().split(" ")[0],
            last_name: input.customer.name.trim().split(" ").slice(1).join(" ") || undefined,
            identification: input.customer.cpf
              ? { type: "CPF", number: input.customer.cpf.replace(/\D/g, "") }
              : undefined,
          },
          description: `Pedido #${order.id.slice(0, 8).toUpperCase()} — Thailandia Store`,
          external_reference: order.id,
          date_of_expiration: expiresAt,
        },
      });

      const txData = mpResult.point_of_interaction?.transaction_data;
      const qrCode = txData?.qr_code ?? "";
      const qrCodeBase64 = txData?.qr_code_base64 ?? "";

      await supabase.from("payments").insert({
        order_id: order.id,
        provider: "mercadopago",
        method: "pix",
        amount: total,
        status: "pending",
        provider_payment_id: String(mpResult.id),
        metadata: { qr_code: qrCode, qr_code_base64: qrCodeBase64, expires_at: expiresAt } as Json,
      });

      // Fire-and-forget email confirmation (never blocks the flow).
      void sendOrderReceivedEmail(order.id, "pix");

      return {
        ok: true,
        orderId: order.id,
        total,
        paymentMethod: "pix",
        pixData: { qrCode, qrCodeBase64, expiresAt },
      };
    } catch {
      // MP failed — clean up the order so the user can retry cleanly.
      await supabase.from("order_items").delete().eq("order_id", order.id);
      await supabase.from("orders").delete().eq("id", order.id);
      return { ok: false, error: "Não foi possível gerar o PIX. Tente novamente em instantes." };
    }
  }

  // ── Card: order created; payment happens on the next page via Brick ──────────
  void sendOrderReceivedEmail(order.id, "card");
  return { ok: true, orderId: order.id, total, paymentMethod: "card" };
}

/**
 * Called by the Checkout Brick after the user fills in card data.
 * Receives the tokenized card + installments from Mercado Pago's SDK and
 * creates the actual payment server-side.
 */
export async function processCardPayment(
  orderId: string,
  token: string,
  installments: number,
  paymentMethodId: string,
  issuerId: string | undefined,
  payerEmail: string,
): Promise<CardPaymentResult> {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, status, customer_email")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "Pedido não encontrado." };
  if (order.status !== "pending_payment") {
    return { ok: false, error: "Este pedido já foi processado." };
  }

  try {
    const mp = getMpPaymentClient();
    const mpResult = await mp.create({
      body: {
        transaction_amount: Number(order.total),
        token,
        installments,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId ? Number(issuerId) : undefined,
        payer: { email: payerEmail || order.customer_email },
        description: `Pedido #${orderId.slice(0, 8).toUpperCase()} — Thailandia Store`,
        external_reference: orderId,
      },
    });

    const mpStatus = mpResult.status; // "approved" | "in_process" | "rejected"
    const paymentStatus = mpStatus === "approved" ? "confirmed" : mpStatus === "rejected" ? "failed" : "pending";

    await supabase.from("payments").insert({
      order_id: orderId,
      provider: "mercadopago",
      method: "credit_card",
      amount: Number(order.total),
      status: paymentStatus,
      provider_payment_id: String(mpResult.id),
      paid_at: mpStatus === "approved" ? new Date().toISOString() : null,
      metadata: {
        installments,
        payment_method_id: paymentMethodId,
        status_detail: mpResult.status_detail ?? null,
      } as Json,
    });

    if (mpStatus === "approved") {
      await supabase.from("orders").update({ status: "payment_confirmed" }).eq("id", orderId);
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: "payment_confirmed",
        note: `Cartão aprovado — ${installments}x (MP #${mpResult.id})`,
      });
      await decrementStockForOrder(orderId);
      void sendPaymentConfirmedEmail(orderId);
      revalidatePath("/admin/pedidos");
      revalidatePath(`/admin/pedidos/${orderId}`);
      return { ok: true, orderId };
    }

    if (mpStatus === "rejected") {
      return { ok: false, error: "Pagamento recusado. Verifique os dados do cartão e tente novamente." };
    }

    // in_process — e.g. debit with 3DS
    return { ok: true, orderId };
  } catch {
    return { ok: false, error: "Erro ao processar o pagamento. Tente novamente." };
  }
}

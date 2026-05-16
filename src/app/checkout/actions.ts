"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getMpPaymentClient } from "@/lib/mercadopago";
import { sendOrderReceivedEmail, sendPaymentConfirmedEmail } from "@/lib/email/send";
import type { Json } from "@/lib/supabase/database.types";
import { storeConfig } from "@/config/store";
import {
  applyPaymentTotal,
  round2,
  validatePlaceOrderInput,
  type PlaceOrderInput,
} from "@/core/validators/checkout";

// ─── Coupon validation ────────────────────────────────────────────────────────

export interface CouponPreview {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  discountValue: number | null;
  discountAmount: number;   // computed against the subtotal
  minOrderValue: number;
}

export type ValidateCouponResult =
  | { ok: true; coupon: CouponPreview }
  | { ok: false; error: string };

/** Called client-side before submitting — returns a preview of the discount. */
export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<ValidateCouponResult> {
  if (!code.trim()) return { ok: false, error: "Informe o código do cupom." };

  const supabase = await createClient();
  const storeId  = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };

  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, code, type, discount_value, min_order_value, max_uses, uses_count, active, expires_at")
    .eq("store_id", storeId)
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!coupon) return { ok: false, error: "Cupom inválido." };
  if (!coupon.active) return { ok: false, error: "Este cupom está inativo." };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return { ok: false, error: "Este cupom está expirado." };
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses)
    return { ok: false, error: "Este cupom atingiu o limite de usos." };
  if (subtotal < Number(coupon.min_order_value))
    return {
      ok: false,
      error: `Pedido mínimo de ${Number(coupon.min_order_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para este cupom.`,
    };

  let discountAmount = 0;
  const type = coupon.type as "percentage" | "fixed" | "free_shipping";
  if (type === "percentage" && coupon.discount_value) {
    discountAmount = round2(subtotal * (Number(coupon.discount_value) / 100));
  } else if (type === "fixed" && coupon.discount_value) {
    discountAmount = Math.min(round2(Number(coupon.discount_value)), subtotal);
  }

  return {
    ok: true,
    coupon: {
      code: coupon.code,
      type,
      discountValue: coupon.discount_value !== null ? Number(coupon.discount_value) : null,
      discountAmount,
      minOrderValue: Number(coupon.min_order_value),
    },
  };
}

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
  const shippingCost = 0;

  // ── Coupon discount ───────────────────────────────────────────────────────
  let discountAmount = 0;
  let appliedCouponCode: string | null = null;

  if (input.couponCode?.trim()) {
    const couponResult = await validateCoupon(input.couponCode.trim(), subtotal);
    if (!couponResult.ok) return { ok: false, error: couponResult.error };
    discountAmount = couponResult.coupon.discountAmount;
    appliedCouponCode = couponResult.coupon.code;
  }

  const discountedSubtotal = round2(subtotal - discountAmount);
  const total = applyPaymentTotal(discountedSubtotal, input.paymentMethod);

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

  const itemsPayload = resolved.map((r) => ({
    product_id: r.productId,
    quantity: r.quantity,
    unit_price: r.unitPrice,
    total_price: round2(r.unitPrice * r.quantity),
    product_snapshot: r.snapshot,
  }));

  const installments = (input.paymentMethod === "card" && input.installments && input.installments > 1)
    ? input.installments
    : 1;

  // Use the service client so the SECURITY DEFINER RPC (execute revoked from
  // anon/authenticated) can be reached from a trusted server context. The
  // RPC runs in a single transaction: SELECT FOR UPDATE → stock check →
  // INSERT order → INSERT order_items → UPDATE stock. This eliminates the
  // race condition where two concurrent requests both pass the stock check
  // before either decrements.
  const service = createServiceClient();
  const { data: rpcResult, error: rpcError } = await service.rpc(
    "create_order_atomic",
    {
      p_store_id:         storeId,
      p_profile_id:       profileId ?? "",
      p_subtotal:         discountedSubtotal,
      p_shipping_cost:    shippingCost,
      p_total:            total,
      p_shipping_address: shippingAddress as unknown as Json,
      p_customer_name:    input.customer.name.trim(),
      p_customer_email:   input.customer.email.trim().toLowerCase(),
      p_customer_phone:   input.customer.phone?.trim() ?? "",
      p_notes:            input.notes?.trim() ?? "",
      p_items:            itemsPayload as unknown as Json,
    },
  );

  if (rpcError || !rpcResult) {
    // Surface stock-related messages to the user; mask internal errors.
    const msg = rpcError?.message ?? "";
    if (msg.includes("Estoque insuficiente")) return { ok: false, error: msg };
    return { ok: false, error: "Não foi possível criar o pedido. Tente novamente." };
  }

  const order = { id: (rpcResult as { order_id: string }).order_id };

  // ── Persist coupon usage ──────────────────────────────────────────────────
  if (appliedCouponCode && discountAmount > 0) {
    // Save discount on the order
    await service
      .from("orders")
      .update({ coupon_code: appliedCouponCode, discount: discountAmount })
      .eq("id", order.id);
    // Increment uses_count (read-then-write; acceptable given low concurrency)
    const { data: cp } = await service
      .from("coupons")
      .select("id, uses_count")
      .eq("code", appliedCouponCode)
      .eq("store_id", storeId)
      .maybeSingle();
    if (cp) {
      await service
        .from("coupons")
        .update({ uses_count: cp.uses_count + 1 })
        .eq("id", cp.id);
    }
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
      // Use service client because RLS may block deletes for the caller's role.
      await service.from("order_items").delete().eq("order_id", order.id);
      await service.from("orders").delete().eq("id", order.id);
      return { ok: false, error: "Não foi possível gerar o PIX. Tente novamente em instantes." };
    }
  }

  // ── Card: order created; payment happens on the next page via Brick ──────────
  // Store installments in order notes so the payment page can pre-configure the Brick.
  if (installments > 1) {
    await service.from("orders").update({ notes: `installments:${installments}` }).eq("id", order.id);
  }
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

  // ── Task 5: ownership check ───────────────────────────────────────────────
  const { data: authData } = await supabase.auth.getUser();
  const callerId = authData.user?.id ?? null;

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, status, customer_email, profile_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, error: "Pedido não encontrado." };

  // Allow payment if: logged-in user owns the order, OR it's a guest order
  // (profile_id is null). Deny if another authenticated user tries to pay.
  if (order.profile_id !== null && order.profile_id !== callerId) {
    return { ok: false, error: "Acesso negado." };
  }

  if (order.status !== "pending_payment") {
    return { ok: false, error: "Este pedido já foi processado." };
  }

  // ── Task 6: atomic status transition to prevent double-charge ────────────
  // UPDATE returns the row only if status is still 'pending_payment'.
  // A concurrent request will see 0 rows and abort before reaching MP.
  const { data: locked } = await supabase
    .from("orders")
    .update({ status: "payment_processing" })
    .eq("id", orderId)
    .eq("status", "pending_payment")
    .select("id")
    .maybeSingle();

  if (!locked) {
    // Another request already moved this order out of pending_payment.
    return { ok: false, error: "Este pedido já está sendo processado." };
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
        payer: { email: payerEmail || order.customer_email || "" },
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
      // Stock was already decremented atomically at order creation (create_order_atomic RPC).
      void sendPaymentConfirmedEmail(orderId);
      revalidatePath("/admin/pedidos");
      revalidatePath(`/admin/pedidos/${orderId}`);
      return { ok: true, orderId };
    }

    if (mpStatus === "rejected") {
      // Roll back so the user can retry with different card details.
      await supabase
        .from("orders")
        .update({ status: "pending_payment" })
        .eq("id", orderId);
      return { ok: false, error: "Pagamento recusado. Verifique os dados do cartão e tente novamente." };
    }

    // in_process — e.g. debit with 3DS
    return { ok: true, orderId };
  } catch {
    // MP threw an unexpected error — roll back to pending_payment so the user
    // can retry. This does NOT restore stock (already pre-decremented at
    // order creation) — that requires an admin action or a cancellation flow.
    await supabase
      .from("orders")
      .update({ status: "pending_payment" })
      .eq("id", orderId)
      .eq("status", "payment_processing");
    return { ok: false, error: "Erro ao processar o pagamento. Tente novamente." };
  }
}

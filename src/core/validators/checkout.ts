// Server-side validation for the checkout payload. Hand-rolled because the
// project doesn't pull in Zod yet — keep it simple and explicit.

export type PaymentMethod = "pix" | "card";

export interface CheckoutCustomizationInput {
  name: string | null;
  number: number | null;
}

export interface CheckoutItemInput {
  slug: string;
  size: string;
  quantity: number;
  customization?: CheckoutCustomizationInput | null;
}

export interface CheckoutCustomerInput {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
}

export interface CheckoutAddressInput {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
}

export interface PlaceOrderInput {
  items: CheckoutItemInput[];
  customer: CheckoutCustomerInput;
  address: CheckoutAddressInput;
  paymentMethod: PaymentMethod;
  installments?: number;
  notes?: string;
  couponCode?: string;
  /** Anonymous identifier from localStorage — used to mark the matching
   *  cart_sessions row as converted. Optional. */
  anonCartId?: string;
}

const BR_STATES = new Set([
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEP_RE = /^\d{5}-?\d{3}$/;

function trim(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

/**
 * Returns null on success or the first validation error message it finds.
 * Mutates nothing — callers should re-build a sanitized object from the
 * validated raw input.
 */
export function validatePlaceOrderInput(input: PlaceOrderInput): string | null {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return "Carrinho vazio.";
  }
  if (input.items.length > 50) return "Carrinho com itens demais.";

  for (const it of input.items) {
    if (!trim(it.slug)) return "Item inválido (slug).";
    if (!trim(it.size)) return "Selecione o tamanho de cada item.";
    if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > 20) {
      return "Quantidade inválida (1 a 20 por item).";
    }
  }

  const c = input.customer ?? ({} as CheckoutCustomerInput);
  if (trim(c.name).length < 2) return "Informe seu nome completo.";
  if (!EMAIL_RE.test(trim(c.email))) return "E-mail inválido.";

  const a = input.address ?? ({} as CheckoutAddressInput);
  if (!CEP_RE.test(trim(a.cep))) return "CEP inválido.";
  if (trim(a.street).length < 2) return "Informe o endereço.";
  if (!trim(a.number)) return "Informe o número do endereço.";
  if (trim(a.city).length < 2) return "Informe a cidade.";
  if (!BR_STATES.has(trim(a.state).toUpperCase())) return "Estado inválido.";

  if (input.paymentMethod !== "pix" && input.paymentMethod !== "card") {
    return "Método de pagamento inválido.";
  }

  return null;
}

/** Money rounded to 2 decimals. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** PIX and card both use the subtotal as transaction_amount sent to Mercado Pago.
 *  Interest for installments is handled by MP based on the merchant's configured plan —
 *  the merchant always receives `subtotal` minus MDR, regardless of installments chosen. */
export function applyPaymentTotal(subtotal: number, _method: PaymentMethod): number {
  return round2(subtotal);
}

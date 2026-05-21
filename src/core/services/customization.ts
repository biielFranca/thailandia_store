import { createStaticClient } from "@/lib/supabase/static";
import { storeConfig } from "@/config/store";

/**
 * Resolves the store-wide default customization price.
 *
 * Reads `stores.config->>defaultCustomizationPrice` first so the value can
 * be overridden per-environment without a code deploy (admin UI for editing
 * `stores.config` is still a TODO — see ONBOARDING). Falls back to the
 * compile-time `storeConfig.defaultCustomizationPrice` constant when the
 * column isn't set or doesn't parse to a non-negative number.
 */
export async function getDefaultCustomizationPrice(): Promise<number> {
  const fallback = storeConfig.defaultCustomizationPrice;
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("stores")
      .select("config")
      .eq("slug", storeConfig.slug)
      .maybeSingle();
    const cfg = (data?.config ?? null) as { defaultCustomizationPrice?: unknown } | null;
    const raw = cfg?.defaultCustomizationPrice;
    const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
    if (Number.isFinite(n) && n >= 0) return n;
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Resolves the effective customization price for a product:
 * product-specific price wins, otherwise the store default.
 */
export function resolveCustomizationPrice(
  productPrice: number | null | undefined,
  storeDefault: number,
): number {
  if (typeof productPrice === "number" && Number.isFinite(productPrice) && productPrice >= 0) {
    return productPrice;
  }
  return storeDefault;
}

// ── Validation shared by client (PDP) and server (placeOrder) ────────────────

export const MAX_CUSTOMIZATION_NAME_LENGTH = 15;
export const MAX_CUSTOMIZATION_NUMBER = 999;
export const MIN_CUSTOMIZATION_NUMBER = 0;

export interface CustomizationInput {
  name: string | null;
  number: number | null;
}

/**
 * Returns null when valid, or a localized error message describing the first
 * problem found. Treats both fields as optional individually — at least one
 * must be present when customization is enabled by the user.
 */
export function validateCustomizationInput(input: CustomizationInput): string | null {
  const hasName = typeof input.name === "string" && input.name.trim().length > 0;
  const hasNumber = typeof input.number === "number" && Number.isFinite(input.number);

  if (!hasName && !hasNumber) {
    return "Preencha nome ou número da customização.";
  }

  if (hasName) {
    const trimmed = (input.name ?? "").trim();
    if (trimmed.length > MAX_CUSTOMIZATION_NAME_LENGTH) {
      return `O nome deve ter no máximo ${MAX_CUSTOMIZATION_NAME_LENGTH} caracteres.`;
    }
  }

  if (hasNumber) {
    const n = input.number as number;
    if (!Number.isInteger(n) || n < MIN_CUSTOMIZATION_NUMBER || n > MAX_CUSTOMIZATION_NUMBER) {
      return `O número deve estar entre ${MIN_CUSTOMIZATION_NUMBER} e ${MAX_CUSTOMIZATION_NUMBER}.`;
    }
  }

  return null;
}

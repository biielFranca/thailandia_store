"use server";

import type { CatalogProduct } from "@/themes/thailandia/content/catalog";
import { searchCatalogProducts } from "@/core/services/catalog";

/**
 * Public search action used by the live header overlay. The underlying
 * service is server-only; this thin wrapper exposes it to the client.
 */
export async function searchProductsAction(query: string): Promise<CatalogProduct[]> {
  return searchCatalogProducts(query);
}

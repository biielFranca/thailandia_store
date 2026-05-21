export const storeConfig = {
  name: "Thailandia Store",
  slug: "thailandia",
  description: "Moda importada e streetwear direto da Tailandia",
  currency: "BRL",
  locale: "pt-BR",
  contact: {
    email: "contato@thailandiastore.com",
    whatsapp: "+55 (11) 99999-9999",
    instagram: "@thailandiastore",
  },
  /**
   * Fallback used when a product has customization enabled but no
   * product-specific customization_price set. Mirrored on the
   * `stores.config->defaultCustomizationPrice` JSON if/when an admin UI
   * is built — `getDefaultCustomizationPrice()` reads that first and
   * falls back to this constant.
   */
  defaultCustomizationPrice: 20,
} as const;

export type StoreConfig = typeof storeConfig;

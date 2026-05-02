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
} as const;

export type StoreConfig = typeof storeConfig;

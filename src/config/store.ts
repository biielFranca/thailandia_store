export const storeConfig = {
  name: 'Thailandia Store',
  slug: 'thailandia',
  description: 'Moda importada e streetwear direto da Tailândia',
  currency: 'BRL',
  locale: 'pt-BR',
  contact: {
    email: '',
    whatsapp: '',
    instagram: '',
  },
} as const

export type StoreConfig = typeof storeConfig

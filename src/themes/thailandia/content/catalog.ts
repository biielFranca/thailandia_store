export type CatalogCategory = {
  slug: string;
  name: string;
  accent: string;
  description: string;
  href: string;
  coverImage?: string;
  comingSoon?: boolean;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  shortName: string;
  cardTitle: string;
  categorySlug: string;
  categoryName: string;
  image: string;
  gallery: string[];
  priceLabel: string;
  displayPrice: string;
  sizes: string;
  badge: string;
  description: string;
  // Extended fields for football store UX
  line?: string;       // "Linha Torcedor" | "Linha Jogador" | "Linha Retrô"
  status?: string;     // "Novo" | "Pronta entrega" | "Últimas unidades" | "Sob encomenda"
  season?: string;     // "24/25" | "25/26"
  isFeatured?: boolean;
  isBestseller?: boolean;
};

export const catalogCategories: CatalogCategory[] = [
  {
    slug: "europeus",
    name: "Europeus",
    accent: "Clubes europeus",
    description: "Real Madrid, Barcelona, PSG, Milan, Arsenal, City, United e mais.",
    href: "/categorias/europeus",
    coverImage: "/catalog/real-madrid-home-25-26/1.png",
  },
  {
    slug: "selecoes",
    name: "Seleções",
    accent: "Edições especiais",
    description: "Brasil, Argentina, França, Alemanha, Portugal, Japão e outras.",
    href: "/categorias/selecoes",
    coverImage: "/catalog/brazil-white-parrot-25-26/1.jpg",
  },
  {
    slug: "brasileiros",
    name: "Brasileiros",
    accent: "Clubes nacionais",
    description: "Flamengo, Corinthians, Palmeiras, São Paulo, Santos, Vasco e outros.",
    href: "/categorias/brasileiros",
    comingSoon: true,
  },
  {
    slug: "kit-adulto",
    name: "Kit Adulto",
    accent: "Conjuntos completos",
    description: "Camisa + short com visual fechado e compra no impulso.",
    href: "/categorias/kit-adulto",
    coverImage: "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
  },
  {
    slug: "fifa-world-cup-2026",
    name: "World Cup 2026",
    accent: "Cápsula de Copa",
    description: "Edições comemorativas e colecionáveis da Copa do Mundo 2026.",
    href: "/categorias/fifa-world-cup-2026",
    coverImage: "/catalog/spain-home-2026/1.jpg",
  },
  {
    slug: "retro",
    name: "Retrô",
    accent: "Clássicos do futebol",
    description: "Relíquias do futebol mundial. Peças históricas com alma de colecionador.",
    href: "/categorias/retro",
    comingSoon: true,
  },
];

// Keep legacy slug for existing routes
export const catalogCategoriesLegacy: Record<string, string> = {
  "times-espanhois": "europeus",
};

export const catalogProducts: CatalogProduct[] = [
  {
    slug: "real-madrid-home-25-26",
    name: "25-26 Real Madrid Home Jersey S-XXL",
    shortName: "Real Madrid Home 25-26",
    cardTitle: "Real Madrid Home",
    categorySlug: "europeus",
    categoryName: "Europeus",
    image: "/catalog/real-madrid-home-25-26/1.png",
    gallery: [
      "/catalog/real-madrid-home-25-26/1.png",
      "/catalog/real-madrid-home-25-26/2.png",
      "/catalog/real-madrid-home-25-26/3.png",
      "/catalog/real-madrid-home-25-26/4.png",
      "/catalog/real-madrid-home-25-26/5.png",
    ],
    priceLabel: "R$ 129,90",
    displayPrice: "R$ 129,90",
    sizes: "S, M, G, GG, XGG",
    badge: "Mais vendido",
    line: "Linha Torcedor",
    status: "Pronta entrega",
    season: "25/26",
    isFeatured: true,
    isBestseller: true,
    description:
      "A camisa do Real Madrid 25/26 com qualidade de importado, tecido respirável e acabamento premium. Pronta entrega.",
  },
  {
    slug: "brazil-white-parrot-25-26",
    name: "25-26 Brazil White Parrot Edition S-XXL",
    shortName: "Brasil White Parrot",
    cardTitle: "Brasil White Parrot",
    categorySlug: "selecoes",
    categoryName: "Seleções",
    image: "/catalog/brazil-white-parrot-25-26/1.jpg",
    gallery: [
      "/catalog/brazil-white-parrot-25-26/1.jpg",
      "/catalog/brazil-white-parrot-25-26/2.jpg",
      "/catalog/brazil-white-parrot-25-26/3.jpg",
      "/catalog/brazil-white-parrot-25-26/4.jpg",
      "/catalog/brazil-white-parrot-25-26/5.jpg",
    ],
    priceLabel: "R$ 119,90",
    displayPrice: "R$ 119,90",
    sizes: "S, M, G, GG, XGG",
    badge: "Lançamento",
    line: "Linha Torcedor",
    status: "Novo",
    season: "25/26",
    isFeatured: true,
    isBestseller: false,
    description:
      "Edição especial White Parrot da Seleção Brasileira. Design exclusivo, peça de colecionador com entrega imediata.",
  },
  {
    slug: "south-korea-home-25-26",
    name: "25-26 South Korea Home S-4XL",
    shortName: "Coreia do Sul Home",
    cardTitle: "Coreia do Sul Home",
    categorySlug: "selecoes",
    categoryName: "Seleções",
    image: "/catalog/south-korea-home-25-26/1.png",
    gallery: [
      "/catalog/south-korea-home-25-26/1.png",
      "/catalog/south-korea-home-25-26/2.png",
      "/catalog/south-korea-home-25-26/3.png",
      "/catalog/south-korea-home-25-26/4.png",
      "/catalog/south-korea-home-25-26/5.png",
    ],
    priceLabel: "R$ 129,90",
    displayPrice: "R$ 129,90",
    sizes: "S, M, G, GG, XGG, 3XG, 4XG",
    badge: "Edição quente",
    line: "Linha Torcedor",
    status: "Pronta entrega",
    season: "25/26",
    isFeatured: false,
    isBestseller: true,
    description:
      "Camisa da Coreia do Sul 25/26 disponível até 4XL. Design clean, qualidade importada e tamanhos amplos.",
  },
  {
    slug: "kit-adulto-arsenal-vermelho-25-26",
    name: "25-26 Kit Adulto Arsenal Vermelho S-XXL",
    shortName: "Kit Arsenal 25/26",
    cardTitle: "Kit Arsenal Vermelho",
    categorySlug: "kit-adulto",
    categoryName: "Kit Adulto",
    image: "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
    gallery: [
      "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
      "/catalog/kit-adulto-arsenal-vermelho-25-26/2.jpg",
      "/catalog/kit-adulto-arsenal-vermelho-25-26/3.jpg",
    ],
    priceLabel: "R$ 119,90",
    displayPrice: "R$ 119,90",
    sizes: "S, M, G, GG, XGG",
    badge: "Kit completo",
    line: "Linha Torcedor",
    status: "Últimas unidades",
    season: "25/26",
    isFeatured: true,
    isBestseller: false,
    description:
      "Kit completo Arsenal 25/26 com camisa + short. Visual fechado, compra direta. Estoque limitado.",
  },
  {
    slug: "spain-home-2026",
    name: "Spain 2026 Home Jersey S-XXL",
    shortName: "Espanha Home 2026",
    cardTitle: "Espanha Home 2026",
    categorySlug: "fifa-world-cup-2026",
    categoryName: "World Cup 2026",
    image: "/catalog/spain-home-2026/1.jpg",
    gallery: [
      "/catalog/spain-home-2026/1.jpg",
      "/catalog/spain-home-2026/2.jpg",
      "/catalog/spain-home-2026/3.jpg",
      "/catalog/spain-home-2026/4.jpg",
      "/catalog/spain-home-2026/5.jpg",
    ],
    priceLabel: "R$ 129,90",
    displayPrice: "R$ 129,90",
    sizes: "S, M, G, GG, XGG",
    badge: "Copa 2026",
    line: "Linha Torcedor",
    status: "Novo",
    season: "2026",
    isFeatured: true,
    isBestseller: false,
    description:
      "Camisa oficial da Espanha para a Copa do Mundo 2026. Peça comemorativa de colecionador, importada.",
  },
  {
    slug: "spain-away-shorts-2026",
    name: "Spain 2026 Away Shorts S-XXL",
    shortName: "Short Espanha 2026",
    cardTitle: "Short Espanha Away",
    categorySlug: "fifa-world-cup-2026",
    categoryName: "World Cup 2026",
    image: "/catalog/spain-away-shorts-2026/1.jpg",
    gallery: [
      "/catalog/spain-away-shorts-2026/1.jpg",
      "/catalog/spain-away-shorts-2026/2.jpg",
      "/catalog/spain-away-shorts-2026/3.jpg",
      "/catalog/spain-away-shorts-2026/4.jpg",
      "/catalog/spain-away-shorts-2026/5.jpg",
    ],
    priceLabel: "R$ 99,90",
    displayPrice: "R$ 99,90",
    sizes: "S, M, G, GG, XGG",
    badge: "Copa 2026",
    line: "Linha Torcedor",
    status: "Pronta entrega",
    season: "2026",
    isFeatured: false,
    isBestseller: false,
    description:
      "Short Away da Espanha para Copa 2026. Composição perfeita com a camisa home ou como peça avulsa.",
  },
];

export function getProductBySlug(slug: string) {
  return catalogProducts.find((p) => p.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return catalogCategories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return catalogProducts.filter((p) => p.categorySlug === slug);
}

export function getFeaturedProducts() {
  return catalogProducts.filter((p) => p.isFeatured);
}

export function getBestsellerProducts() {
  return catalogProducts.filter((p) => p.isBestseller);
}

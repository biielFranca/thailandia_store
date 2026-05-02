export type CatalogCategory = {
  slug: string;
  name: string;
  accent: string;
  description: string;
  href: string;
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
};

export const catalogCategories: CatalogCategory[] = [
  {
    slug: "kit-adulto",
    name: "Kit Adulto",
    accent: "Conjuntos completos",
    description:
      "Combos de camisa e short para quem quer visual fechado, leitura forte e compra rapida.",
    href: "/categorias/kit-adulto",
  },
  {
    slug: "selecoes",
    name: "Selecoes",
    accent: "Edicoes especiais",
    description:
      "Camisas de selecoes com visual marcante, boa saida comercial e apelo de lancamento.",
    href: "/categorias/selecoes",
  },
  {
    slug: "times-espanhois",
    name: "Times Espanhois",
    accent: "Linha de clubes",
    description:
      "Pecas inspiradas nos gigantes espanhois, pensadas para destaque de vitrine e alto clique.",
    href: "/categorias/times-espanhois",
  },
  {
    slug: "fifa-world-cup-2026",
    name: "World Cup 2026",
    accent: "Capsula de copa",
    description:
      "Modelos e pecas avulsas com cara de evento, ideais para criar urgencia e novidade.",
    href: "/categorias/fifa-world-cup-2026",
  },
];

export const catalogProducts: CatalogProduct[] = [
  {
    slug: "real-madrid-home-25-26",
    name: "25-26 Real Madrid Home Jersey S-XXL",
    shortName: "Real Madrid Home 25-26",
    cardTitle: "Camiseta Real Madrid",
    categorySlug: "times-espanhois",
    categoryName: "Times Espanhois",
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
    sizes: "S ao XXL",
    badge: "Mais vendido",
    description:
      "Camisa de impacto visual forte, perfeita para abrir colecao, campanha ou bloco principal da home.",
  },
  {
    slug: "brazil-white-parrot-25-26",
    name: "25-26 Brazil White Parrot Edition S-XXL",
    shortName: "Brazil White Parrot",
    cardTitle: "Camiseta White Parrot",
    categorySlug: "selecoes",
    categoryName: "Selecoes",
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
    sizes: "S ao XXL",
    badge: "Lancamento",
    description:
      "Modelo com leitura premium e pegada fashion, feito para sustentar carrossel e secao de novidade.",
  },
  {
    slug: "south-korea-home-25-26",
    name: "25-26 South Korea Home S-4XL",
    shortName: "South Korea Home 25-26",
    cardTitle: "Camiseta South Korea",
    categorySlug: "selecoes",
    categoryName: "Selecoes",
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
    sizes: "S ao 4XL",
    badge: "Edicao quente",
    description:
      "Peca com shape limpo e leitura forte para campanhas de selecoes e vitrine mobile.",
  },
  {
    slug: "kit-adulto-arsenal-vermelho-25-26",
    name: "25-26 Kit Adulto Arsenal Vermelho S-XXL",
    shortName: "Kit Adulto Arsenal",
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
    sizes: "S ao XXL",
    badge: "Combo",
    description:
      "Conjunto com cara de compra imediata, ideal para bloco de oferta e ticket medio mais forte.",
  },
  {
    slug: "spain-home-2026",
    name: "Spain 2026 Home Jersey S-XXL",
    shortName: "Spain Home 2026",
    cardTitle: "Camiseta Spain Home",
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
    sizes: "S ao XXL",
    badge: "Capsula 2026",
    description:
      "Camisa pensada para bloco de novidade com linguagem de evento e giro de atencao rapido.",
  },
  {
    slug: "spain-away-shorts-2026",
    name: "Spain 2026 Away Shorts S-XXL",
    shortName: "Spain Away Shorts 2026",
    cardTitle: "Short Spain Away",
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
    sizes: "S ao XXL",
    badge: "Peca avulsa",
    description:
      "Item complementar para composicao de look, oferta cruzada e bloco de lancamentos.",
  },
];

export function getProductBySlug(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return catalogCategories.find((category) => category.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return catalogProducts.filter((product) => product.categorySlug === slug);
}

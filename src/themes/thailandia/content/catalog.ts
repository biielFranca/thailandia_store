export type CatalogCategory = {
  slug: string;
  name: string;
  tag: string;
  description: string;
  source: string;
  href: string;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  shortName: string;
  cardTitle: string;
  categorySlug: string;
  categoryName: string;
  source: string;
  sourceUrl: string;
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
    tag: "Hsquan",
    description:
      "Conjuntos completos com apelo casual e esportivo, vindos da secao Kit Adulto do catalogo hsquan996.",
    source: "https://hsquan996.x.yupoo.com/albums",
    href: "/categorias/kit-adulto",
  },
  {
    slug: "selecoes",
    name: "Selecoes",
    tag: "Hsquan",
    description:
      "Camisas e edicoes especiais de selecoes nacionais, puxadas da secao Selecoes do hsquan996.",
    source: "https://hsquan996.x.yupoo.com/collections/4262413",
    href: "/categorias/selecoes",
  },
  {
    slug: "times-espanhois",
    name: "Times Espanhois",
    tag: "Hsquan",
    description:
      "Camisas de clubes espanhois com foco em Real Madrid e outras linhas fortes do catalogo hsquan996.",
    source: "https://hsquan996.x.yupoo.com/albums",
    href: "/categorias/times-espanhois",
  },
  {
    slug: "fifa-world-cup-2026",
    name: "2026 FIFA World Cup",
    tag: "Minkang",
    description:
      "Linha de selecoes, shorts e pecas de Copa 2026 baseada na categoria World Cup do catalogo minkang.",
    source: "https://minkang.x.yupoo.com/categories/5062328",
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
    source: "Hsquan Yupoo",
    sourceUrl:
      "https://hsquan996.x.yupoo.com/albums/203392532?isSubCate=false&referrercate=4262420&uid=1",
    image: "/catalog/real-madrid-home-25-26/1.png",
    gallery: [
      "/catalog/real-madrid-home-25-26/1.png",
      "/catalog/real-madrid-home-25-26/2.png",
      "/catalog/real-madrid-home-25-26/3.png",
      "/catalog/real-madrid-home-25-26/4.png",
      "/catalog/real-madrid-home-25-26/5.png",
    ],
    priceLabel: "Sob consulta",
    displayPrice: "R$ 129,90",
    sizes: "S ao XXL",
    badge: "Clube europeu",
    description:
      "Camisa principal do Real Madrid 25-26, usada aqui como exemplo real puxado do album hsquan996.",
  },
  {
    slug: "brazil-white-parrot-25-26",
    name: "25-26 Brazil White Parrot Edition S-XXL",
    shortName: "Brazil White Parrot",
    cardTitle: "Camiseta White Parrot",
    categorySlug: "selecoes",
    categoryName: "Selecoes",
    source: "Hsquan Yupoo",
    sourceUrl:
      "https://hsquan996.x.yupoo.com/albums/205302007?isSubCate=false&referrercate=4262413&uid=1",
    image: "/catalog/brazil-white-parrot-25-26/1.jpg",
    gallery: [
      "/catalog/brazil-white-parrot-25-26/1.jpg",
      "/catalog/brazil-white-parrot-25-26/2.jpg",
      "/catalog/brazil-white-parrot-25-26/3.jpg",
      "/catalog/brazil-white-parrot-25-26/4.jpg",
      "/catalog/brazil-white-parrot-25-26/5.jpg",
    ],
    priceLabel: "Sob consulta",
    displayPrice: "R$ 119,90",
    sizes: "S ao XXL",
    badge: "Edicao especial",
    description:
      "Edicao alternativa do Brasil com identidade visual mais forte, puxada da secao Selecoes do hsquan996.",
  },
  {
    slug: "south-korea-home-25-26",
    name: "25-26 South Korea Home S-4XL",
    shortName: "South Korea Home 25-26",
    cardTitle: "Camiseta South Korea",
    categorySlug: "selecoes",
    categoryName: "Selecoes",
    source: "Hsquan Yupoo",
    sourceUrl:
      "https://hsquan996.x.yupoo.com/albums/205428524?isSubCate=false&referrercate=4262413&uid=1",
    image: "/catalog/south-korea-home-25-26/1.png",
    gallery: [
      "/catalog/south-korea-home-25-26/1.png",
      "/catalog/south-korea-home-25-26/2.png",
      "/catalog/south-korea-home-25-26/3.png",
      "/catalog/south-korea-home-25-26/4.png",
      "/catalog/south-korea-home-25-26/5.png",
    ],
    priceLabel: "Sob consulta",
    displayPrice: "R$ 129,90",
    sizes: "S ao 4XL",
    badge: "Selecao asiatica",
    description:
      "Camisa home da Coreia do Sul, usada para dar variedade real de selecoes no catalogo de exemplo.",
  },
  {
    slug: "kit-adulto-arsenal-vermelho-25-26",
    name: "25-26 Kit Adulto Arsenal Vermelho S-XXL",
    shortName: "Kit Adulto Arsenal",
    cardTitle: "Kit Arsenal Vermelho",
    categorySlug: "kit-adulto",
    categoryName: "Kit Adulto",
    source: "Hsquan Yupoo",
    sourceUrl:
      "https://hsquan996.x.yupoo.com/albums/196891281?isSubCate=false&referrercate=4846547&uid=1",
    image: "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
    gallery: [
      "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
      "/catalog/kit-adulto-arsenal-vermelho-25-26/2.jpg",
      "/catalog/kit-adulto-arsenal-vermelho-25-26/3.jpg",
    ],
    priceLabel: "Sob consulta",
    displayPrice: "R$ 119,90",
    sizes: "S ao XXL",
    badge: "Conjunto",
    description:
      "Conjunto adulto do Arsenal, vindo da secao Kit Adulto e ideal para mostrar proposta de look completo.",
  },
  {
    slug: "spain-home-2026",
    name: "Spain 2026 Home Jersey S-XXL",
    shortName: "Spain Home 2026",
    cardTitle: "Camiseta Spain Home",
    categorySlug: "fifa-world-cup-2026",
    categoryName: "2026 FIFA World Cup",
    source: "Minkang Yupoo",
    sourceUrl:
      "https://minkang.x.yupoo.com/albums/223562013?isSubCate=false&referrercate=5062328&uid=1",
    image: "/catalog/spain-home-2026/1.jpg",
    gallery: [
      "/catalog/spain-home-2026/1.jpg",
      "/catalog/spain-home-2026/2.jpg",
      "/catalog/spain-home-2026/3.jpg",
      "/catalog/spain-home-2026/4.jpg",
      "/catalog/spain-home-2026/5.jpg",
    ],
    priceLabel: "Sob consulta",
    displayPrice: "R$ 129,90",
    sizes: "S ao XXL",
    badge: "World Cup 2026",
    description:
      "Camisa home da Espanha 2026 vinda da categoria 2026 FIFA World Cup do catalogo minkang.",
  },
  {
    slug: "spain-away-shorts-2026",
    name: "Spain 2026 Away Shorts S-XXL",
    shortName: "Spain Away Shorts 2026",
    cardTitle: "Short Spain Away",
    categorySlug: "fifa-world-cup-2026",
    categoryName: "2026 FIFA World Cup",
    source: "Minkang Yupoo",
    sourceUrl:
      "https://minkang.x.yupoo.com/albums/231426214?isSubCate=false&referrercate=5062328&uid=1",
    image: "/catalog/spain-away-shorts-2026/1.jpg",
    gallery: [
      "/catalog/spain-away-shorts-2026/1.jpg",
      "/catalog/spain-away-shorts-2026/2.jpg",
      "/catalog/spain-away-shorts-2026/3.jpg",
      "/catalog/spain-away-shorts-2026/4.jpg",
      "/catalog/spain-away-shorts-2026/5.jpg",
    ],
    priceLabel: "Sob consulta",
    displayPrice: "R$ 99,90",
    sizes: "S ao XXL",
    badge: "Peca avulsa",
    description:
      "Short oficial de linha Copa 2026, usado aqui para representar pecas avulsas e complementar kits.",
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

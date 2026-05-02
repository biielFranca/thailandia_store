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
  categorySlug: string;
  categoryName: string;
  source: string;
  sourceUrl: string;
  image: string;
  gallery: string[];
  priceLabel: string;
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
    categorySlug: "times-espanhois",
    categoryName: "Times Espanhois",
    source: "Hsquan Yupoo",
    sourceUrl:
      "https://hsquan996.x.yupoo.com/albums/203392532?isSubCate=false&referrercate=4262420&uid=1",
    image: "https://photo.yupoo.com/hsquan996/fe237f09/medium.png",
    gallery: [
      "https://photo.yupoo.com/hsquan996/fe237f09/medium.png",
      "https://photo.yupoo.com/hsquan996/08ab88ba/medium.png",
      "https://photo.yupoo.com/hsquan996/a60d1ff1/medium.png",
      "https://photo.yupoo.com/hsquan996/b775556e/medium.png",
      "https://photo.yupoo.com/hsquan996/6c064793/medium.png",
    ],
    priceLabel: "Sob consulta",
    sizes: "S ao XXL",
    badge: "Clube europeu",
    description:
      "Camisa principal do Real Madrid 25-26, usada aqui como exemplo real puxado do album hsquan996.",
  },
  {
    slug: "brazil-white-parrot-25-26",
    name: "25-26 Brazil White Parrot Edition S-XXL",
    shortName: "Brazil White Parrot",
    categorySlug: "selecoes",
    categoryName: "Selecoes",
    source: "Hsquan Yupoo",
    sourceUrl:
      "https://hsquan996.x.yupoo.com/albums/205302007?isSubCate=false&referrercate=4262413&uid=1",
    image: "https://photo.yupoo.com/hsquan996/2c3fe7d6/medium.jpg",
    gallery: [
      "https://photo.yupoo.com/hsquan996/2c3fe7d6/medium.jpg",
      "https://photo.yupoo.com/hsquan996/4d37c24f/medium.jpg",
      "https://photo.yupoo.com/hsquan996/fac5daa9/medium.jpg",
      "https://photo.yupoo.com/hsquan996/cbeb14f6/medium.jpg",
      "https://photo.yupoo.com/hsquan996/e2e73ceb/medium.jpg",
    ],
    priceLabel: "Sob consulta",
    sizes: "S ao XXL",
    badge: "Edicao especial",
    description:
      "Edicao alternativa do Brasil com identidade visual mais forte, puxada da secao Selecoes do hsquan996.",
  },
  {
    slug: "south-korea-home-25-26",
    name: "25-26 South Korea Home S-4XL",
    shortName: "South Korea Home 25-26",
    categorySlug: "selecoes",
    categoryName: "Selecoes",
    source: "Hsquan Yupoo",
    sourceUrl:
      "https://hsquan996.x.yupoo.com/albums/205428524?isSubCate=false&referrercate=4262413&uid=1",
    image: "https://photo.yupoo.com/hsquan996/37efaef9/medium.png",
    gallery: [
      "https://photo.yupoo.com/hsquan996/37efaef9/medium.png",
      "https://photo.yupoo.com/hsquan996/8e3c96fb/medium.png",
      "https://photo.yupoo.com/hsquan996/d060ba3b/medium.png",
      "https://photo.yupoo.com/hsquan996/2d2b6263/medium.png",
      "https://photo.yupoo.com/hsquan996/d3ee3c7c/medium.png",
    ],
    priceLabel: "Sob consulta",
    sizes: "S ao 4XL",
    badge: "Selecao asiatica",
    description:
      "Camisa home da Coreia do Sul, usada para dar variedade real de selecoes no catalogo de exemplo.",
  },
  {
    slug: "kit-adulto-arsenal-vermelho-25-26",
    name: "25-26 Kit Adulto Arsenal Vermelho S-XXL",
    shortName: "Kit Adulto Arsenal",
    categorySlug: "kit-adulto",
    categoryName: "Kit Adulto",
    source: "Hsquan Yupoo",
    sourceUrl:
      "https://hsquan996.x.yupoo.com/albums/196891281?isSubCate=false&referrercate=4846547&uid=1",
    image: "https://photo.yupoo.com/hsquan996/c6bfb7c3/medium.jpg",
    gallery: [
      "https://photo.yupoo.com/hsquan996/c6bfb7c3/medium.jpg",
      "https://photo.yupoo.com/hsquan996/6c5f3f79/medium.jpg",
      "https://photo.yupoo.com/hsquan996/d3411e14/medium.jpg",
    ],
    priceLabel: "Sob consulta",
    sizes: "S ao XXL",
    badge: "Conjunto",
    description:
      "Conjunto adulto do Arsenal, vindo da secao Kit Adulto e ideal para mostrar proposta de look completo.",
  },
  {
    slug: "spain-home-2026",
    name: "Spain 2026 Home Jersey S-XXL",
    shortName: "Spain Home 2026",
    categorySlug: "fifa-world-cup-2026",
    categoryName: "2026 FIFA World Cup",
    source: "Minkang Yupoo",
    sourceUrl:
      "https://minkang.x.yupoo.com/albums/223562013?isSubCate=false&referrercate=5062328&uid=1",
    image: "https://photo.yupoo.com/minkang/67dde73e/medium.jpg",
    gallery: [
      "https://photo.yupoo.com/minkang/67dde73e/medium.jpg",
      "https://photo.yupoo.com/minkang/8b59691f/medium.jpg",
      "https://photo.yupoo.com/minkang/ae96bd51/medium.jpg",
      "https://photo.yupoo.com/minkang/3bfeac39/medium.jpg",
      "https://photo.yupoo.com/minkang/82b84c75/medium.jpg",
    ],
    priceLabel: "Sob consulta",
    sizes: "S ao XXL",
    badge: "World Cup 2026",
    description:
      "Camisa home da Espanha 2026 vinda da categoria 2026 FIFA World Cup do catalogo minkang.",
  },
  {
    slug: "spain-away-shorts-2026",
    name: "Spain 2026 Away Shorts S-XXL",
    shortName: "Spain Away Shorts 2026",
    categorySlug: "fifa-world-cup-2026",
    categoryName: "2026 FIFA World Cup",
    source: "Minkang Yupoo",
    sourceUrl:
      "https://minkang.x.yupoo.com/albums/231426214?isSubCate=false&referrercate=5062328&uid=1",
    image: "https://photo.yupoo.com/minkang/4bf60cf2/medium.jpg",
    gallery: [
      "https://photo.yupoo.com/minkang/4bf60cf2/medium.jpg",
      "https://photo.yupoo.com/minkang/b3e30c1c/medium.jpg",
      "https://photo.yupoo.com/minkang/5292cf78/medium.jpg",
      "https://photo.yupoo.com/minkang/c43407b1/medium.jpg",
      "https://photo.yupoo.com/minkang/4981927b/medium.jpg",
    ],
    priceLabel: "Sob consulta",
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

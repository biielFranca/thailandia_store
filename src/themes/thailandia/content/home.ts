import {
  catalogCategories,
  catalogProducts,
} from "@/themes/thailandia/content/catalog";

export const homeContent = {
  announcement: "Drops internacionais com visual premium e giro semanal",
  navigation: [
    "Novidades",
    "Times",
    "Streetwear",
    "Conjuntos",
    "Rastreamento",
  ],
  hero: {
    eyebrow: "Thailandia Store",
    title: "STREETWEAR IMPORTADO COM ENERGIA DE QUADRA E ESTILO DE RUA",
    description:
      "Pecas selecionadas para quem quer vestir identidade. Camisas de time, kits esportivos e looks pesados com curadoria comercial e visual escuro.",
    primaryCta: "Explorar colecao",
    secondaryCta: "Ver mais vendidos",
    highlights: [
      "Drops limitados",
      "Pagamento seguro",
      "Rastreamento por pedido",
    ],
    stats: [
      { label: "Modelos em alta", value: "120+" },
      { label: "Categorias ativas", value: "08" },
      { label: "Atualizacao do drop", value: "Semanal" },
    ],
  },
  categories: catalogCategories,
  featuredProducts: catalogProducts,
  benefits: [
    {
      title: "Curadoria comercial",
      description:
        "Selecao de produtos com apelo de compra rapido e leitura visual forte para campanhas.",
    },
    {
      title: "Checkout direto",
      description:
        "Fluxo enxuto para reduzir atrito e levar o cliente do interesse ao pagamento sem ruido.",
    },
    {
      title: "Pos-venda rastreavel",
      description:
        "Pedido, status e pagamento preparados para acompanhamento claro no MVP.",
    },
  ],
  experience: [
    "Hero com chamada forte, prova visual e CTA acima da dobra",
    "Categorias apresentadas como atalhos de exploracao",
    "Grade de produtos destacando preco, categoria e impacto visual",
    "Faixa de confianca com pagamento, envio e rastreio",
  ],
} as const;

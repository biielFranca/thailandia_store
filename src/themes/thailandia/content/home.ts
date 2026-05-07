import {
  catalogCategories,
  catalogProducts,
} from "@/themes/thailandia/content/catalog";

export const homeContent = {
  announcement: "Drop da semana ativo: selecao importada, estoque enxuto e reposicao limitada",
  navigation: [
    "Oferta",
    "Categorias",
    "Destaques",
    "Confianca",
    "Comprar",
  ],
  hero: {
    eyebrow: "Thailandia Store",
    title: "CAMISAS IMPORTADAS E KITS PREMIUM PARA VENDER RAPIDO",
    description:
      "Catalogo com pecas de alta procura, visual forte e fotos reais. A proposta da Thailandia Store aqui e simples: mostrar produto, gerar desejo e levar o cliente para a compra sem friccao.",
    primaryCta: "Quero ver os produtos",
    secondaryCta: "Abrir destaque da semana",
    highlights: [
      "Fotos reais dos albuns",
      "Modelos em alta rotacao",
      "Atendimento direto",
    ],
    stats: [
      { label: "Produtos em destaque", value: "06" },
      { label: "Categorias quentes", value: "04" },
      { label: "Resposta comercial", value: "< 1h" },
    ],
  },
  categories: catalogCategories,
  featuredProducts: catalogProducts,
  offer: {
    label: "Oferta principal",
    title: "SELECAO DE PRODUTOS FEITA PARA CONVERTER NO PRIMEIRO IMPACTO",
    description:
      "A pagina foi organizada como vitrine de venda online: produto grande, narrativa curta, prova visual, categorias diretas e CTA forte para tirar o cliente da navegacao e levar para a decisao.",
    bullets: [
      "Imagens reais e navegacao curta",
      "Produtos com apelo de compra imediata",
      "Fluxo preparado para checkout ou atendimento direto",
    ],
  },
  trustBar: [
    "Pagamento seguro",
    "Produtos importados",
    "Atendimento humano",
    "Rastreio por pedido",
  ],
  sellingPoints: [
    {
      title: "Produtos que chamam clique",
      description:
        "Modelos com demanda visual forte para anuncio, vitrine e trafego organico.",
    },
    {
      title: "Vitrine pronta para compra",
      description:
        "A pagina prioriza desejo, imagem e CTA, sem excesso de explicacao antes da decisao.",
    },
    {
      title: "Escalavel para operacao real",
      description:
        "A base ja conversa com categorias, paginas de produto e evolucao futura para checkout.",
    },
  ],
  socialProof: [
    {
      quote:
        "As pecas com foto real tendem a converter melhor porque o cliente entende rapido o que esta comprando.",
      author: "Curadoria Thailandia",
    },
    {
      quote:
        "Categorias curtas e produtos em destaque ajudam a reduzir dispersao e aumentar clique em item quente.",
      author: "Estrutura comercial",
    },
    {
      quote:
        "Uma home de vendas precisa menos texto institucional e mais direcao de compra. E isso que esta pagina faz.",
      author: "Visao de vitrine",
    },
  ],
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
    "Hero com oferta central e CTA acima da dobra",
    "Barra de confianca para reduzir hesitacao inicial",
    "Grid de produtos com imagem real e acao de compra",
    "Fechamento com CTA final para levar o cliente ao pedido",
  ],
  finalCta: {
    title: "PRONTO PARA TRANSFORMAR TRAFEGO EM PEDIDO",
    description:
      "Use essa pagina como vitrine principal da loja, direcione o cliente para o produto e feche pelo fluxo que voce escolher: checkout, WhatsApp ou atendimento comercial.",
    primary: "Ver colecao completa",
    secondary: "Falar no Instagram",
  },
} as const;

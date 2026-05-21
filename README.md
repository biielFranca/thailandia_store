# Thailandia Store

Loja online de camisas de futebol importadas — Next.js 16 (App Router, Turbopack) + Supabase + Mercado Pago.

## Stack

- **Next.js 16** (App Router, React Server Components, Turbopack)
- **TypeScript**
- **Supabase** — Postgres, Auth, Storage, RLS, RPCs
- **Mercado Pago** — PIX e Cartão via Checkout Brick
- **Resend** — e-mails transacionais
- **Tailwind CSS** com sistema de tokens próprio
- **framer-motion** — micro-interações na navegação

## Estrutura

```
src/
├── app/                     # rotas (App Router)
│   ├── admin/               # painel administrativo
│   │   ├── produtos/        # CRUD de produtos
│   │   ├── pedidos/         # pedidos + status
│   │   ├── categorias/      # gestão de categorias
│   │   ├── cupons/          # cupons de desconto
│   │   ├── estoque/         # gestão de estoque
│   │   ├── vitrine/         # hero slides
│   │   ├── clientes/        # base de clientes
│   │   └── relatorios/      # 7 relatórios de analytics
│   ├── checkout/            # fluxo de finalização
│   ├── produtos/[slug]/     # PDP (Product Detail Page)
│   ├── categorias/[slug]/   # listagens
│   ├── conta/               # área do cliente logado
│   ├── api/                 # webhooks (Mercado Pago)
│   ├── auth/                # callbacks de autenticação
│   ├── actions/             # server actions globais
│   ├── loading.tsx          # loading state global (SVG animado)
│   └── icon.png             # favicon (auto pelo App Router)
├── components/
│   ├── storefront/          # UI da loja pública
│   ├── admin/               # UI do painel
│   ├── checkout/            # Brick do Mercado Pago
│   └── ui/                  # primitivos reutilizáveis (magnetic-nav, …)
├── core/
│   ├── services/            # camada de dados (catalog, customization, …)
│   ├── validators/          # validação de payloads
│   └── types/               # tipos compartilhados
├── contexts/                # React contexts (store, auth)
├── lib/
│   ├── supabase/            # clients (server, client, service, static)
│   ├── email/               # templates Resend + send.ts
│   ├── mercadopago/         # cliente MP
│   └── auth/                # helpers de autenticação
├── themes/thailandia/       # conteúdo desacoplado (brand, tokens, catálogo seed)
└── config/store.ts          # configuração da loja (slug, defaults)

supabase/migrations/         # migrations SQL aplicadas
public/                      # assets estáticos (logo, fontes, SVG do loader)
```

## Features

### Loja
- Catálogo dinâmico vindo do Supabase (com fallback resiliente)
- Hero carousel com tema "estádio" — desktop e mobile dedicados
- PDP com galeria, seleção de tamanho, comprar agora / adicionar
- **Customização de camisa** (nome + número, preço opcional por produto)
- Carrinho persistido em `localStorage` + mirror server-side para tracking
- Wishlist (logged users)
- Reviews / avaliações por produto
- Busca com escape de caracteres do PostgREST
- Tema claro/escuro persistente (script bloqueante, sem FOUC)
- Loading screen animado (SVG de campo de futebol)

### Checkout
- PIX via Mercado Pago (QR code em tempo real)
- Cartão de crédito via Checkout Brick + parcelamento
- Validação atômica server-side (estoque sob lock pessimista via RPC)
- Cupons de desconto (% / fixo / frete grátis)
- E-mails transacionais via Resend (pedido recebido / pagamento confirmado)

### Admin
- CRUD completo de produtos com upload de imagens (Supabase Storage)
- Toggle de customização por produto + valor override
- Gestão de pedidos com histórico de status
- Gestão de cupons, estoque, categorias, vitrine
- **7 relatórios de analytics:**
  1. Vendas por período (7/30/90/180 dias + 12 semanas + 6 meses)
  2. Produtos mais vendidos (por unidades e por receita)
  3. Times mais pedidos (agrupado por `products.metadata.team`)
  4. Formas de pagamento (PIX vs Cartão)
  5. Retenção de clientes (taxa de recompra, top por receita/frequência)
  6. Abandono de **checkout** (pedidos `pending_payment` > 30 min)
  7. Abandono de **carrinho** (tracking real via `cart_sessions` table)

### Segurança
- RLS em todas as tabelas
- RPC `create_order_atomic` com `SELECT FOR UPDATE` evita oversell
- Status de pedido com transição atômica para prevenir double-charge
- Service role apenas em server actions confiáveis
- CHECK constraints (preços, ranges, lengths)

## Desenvolvimento

### Pré-requisitos
- Node.js 20+
- Conta no Supabase + projeto criado
- Conta no Mercado Pago (PIX e cartão habilitados)
- Conta no Resend (e domínio verificado para envios reais)

### Instalação

```bash
npm install
cp .env.example .env  # se existir; senão crie .env manualmente
```

### Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

MP_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-...

RESEND_API_KEY=re_...
EMAIL_FROM=Thailandia Store <pedidos@seudominio.com>
```

### Banco de dados

Aplicar todas as migrations em `supabase/migrations/` na ordem do timestamp. Pelo MCP, painel Supabase, ou:

```bash
npx supabase db push
```

### Rodar

```bash
npm run dev      # dev server (Turbopack)
npm run build    # build de produção
npm run lint     # ESLint
```

Abra http://localhost:3000.

## Convenções do projeto

- **Não é o Next.js que você conhece** — APIs e convenções podem diferir do treinamento dos LLMs. Sempre consultar `node_modules/next/dist/docs/` antes de usar API nova (vide `AGENTS.md`).
- **Server-only via cookies** (`@/lib/supabase/server`) só para rotas autenticadas. Leituras públicas usam **cliente estático anônimo** (`@/lib/supabase/static`) — evita problemas com cookies expirados em SSG/ISR.
- **Validação dupla** — cliente para UX, servidor para segurança. Nunca confiar em preço/customização vindos do cliente.
- **Snapshots em order_items.product_snapshot** (JSON) — pedidos antigos não dependem do estado atual do catálogo.

## Roadmap

- [ ] Painel de settings da loja no admin (hoje `defaultCustomizationPrice` é editado em `stores.config` via SQL)
- [ ] Job de e-mail de recuperação de carrinho (24h-7d) — Resend já configurado
- [ ] Dashboard executivo combinando os 7 relatórios em uma tela
- [ ] Versão PWA + instalação na home

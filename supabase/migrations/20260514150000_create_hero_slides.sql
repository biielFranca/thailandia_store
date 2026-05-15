-- Hero carousel slides — managed via /admin/vitrine.
-- Replaces the hardcoded array previously in home-page.tsx so admins can
-- edit the homepage banner without redeploying.

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  position int not null default 0,
  title text not null,
  description text not null default '',
  button_label text not null default 'Comprar agora',
  image_url text not null,
  product_slug text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_slides_store_position_idx
  on public.hero_slides (store_id, position);

alter table public.hero_slides enable row level security;

create policy "hero_slides: public read"
  on public.hero_slides for select
  using (active = true or public.is_admin());

create policy "hero_slides: admin write"
  on public.hero_slides for all
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists hero_slides_updated_at on public.hero_slides;
create trigger hero_slides_updated_at
  before update on public.hero_slides
  for each row execute function public.set_updated_at();

-- Seed with the existing hardcoded slides so the home keeps rendering.
-- Idempotent: only inserts when the table is empty.
insert into public.hero_slides (store_id, position, title, description, button_label, image_url, product_slug)
select
  '24d7ba71-21c3-4d19-901a-dcef43aacd89'::uuid,
  x.position, x.title, x.description, x.button_label, x.image_url, x.product_slug
from (values
  (0, E'CAMISAS DOS\nMAIORES CLUBES', 'Produtos importados selecionados. Estoque limitado e novidades chegando toda semana.', 'Ver Lançamentos', '/catalog/flamengo-home-26-27/1.jpg', 'flamengo-home-26-27'),
  (1, E'COPA DO MUNDO\n2026', 'Coleção oficial da Copa. Camisas da Seleção, Argentina, Croácia e muito mais.', 'Ver Seleções', '/catalog/brazil-home-2026/1.jpg', 'brazil-home-2026'),
  (2, E'KIT COMPLETO\nCAMISA + SHORT', 'Conjuntos prontos, visual fechado. Estoque limitado — garanta o seu antes de acabar.', 'Ver Kits', '/catalog/kit-flamengo-adulto-25-26/1.jpg', 'kit-flamengo-adulto-25-26'),
  (3, E'EUROPEIAS\nDE PRIMEIRA', 'Real Madrid, Barcelona, Arsenal, Bayern e mais. Qualidade importada, entrega em todo o Brasil.', 'Ver Europeias', '/catalog/real-madrid-home-26-27/1.jpg', 'real-madrid-home-26-27')
) as x(position, title, description, button_label, image_url, product_slug)
where not exists (select 1 from public.hero_slides);

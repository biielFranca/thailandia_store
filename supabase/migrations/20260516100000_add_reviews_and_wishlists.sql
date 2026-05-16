-- ─── product_reviews ────────────────────────────────────────────────────────
create table if not exists public.product_reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  store_id     uuid not null references public.stores(id) on delete cascade,
  rating       smallint not null check (rating between 1 and 5),
  title        text,
  body         text,
  is_verified_purchase boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (profile_id, product_id)
);

alter table public.product_reviews enable row level security;

create policy "reviews_select_public"
  on public.product_reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.product_reviews for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "reviews_update_own"
  on public.product_reviews for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "reviews_delete_own_or_admin"
  on public.product_reviews for delete
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- ─── wishlists ───────────────────────────────────────────────────────────────
create table if not exists public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  store_id    uuid not null references public.stores(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (profile_id, product_id)
);

alter table public.wishlists enable row level security;

create policy "wishlists_select_own"
  on public.wishlists for select
  to authenticated
  using (profile_id = auth.uid());

create policy "wishlists_insert_own"
  on public.wishlists for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "wishlists_delete_own"
  on public.wishlists for delete
  to authenticated
  using (profile_id = auth.uid());

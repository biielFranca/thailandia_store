-- hero_slides was created in 20260514150000_create_hero_slides.sql using
-- public.is_admin() in its RLS policies, but the earlier migration
-- 20260514100500_security_private_admin_helper.sql moved the admin helper to
-- security.is_admin() and revoked EXECUTE on public.is_admin() from
-- anon/authenticated. That broke every INSERT/UPDATE/DELETE against
-- hero_slides made through the cookie-auth client (the admin panel).
--
-- This migration rewrites the two hero_slides policies to call the private
-- helper, matching the convention used by every other admin policy.

drop policy if exists "hero_slides: admin write" on public.hero_slides;
drop policy if exists "hero_slides: public read" on public.hero_slides;

create policy "hero_slides: public read"
  on public.hero_slides for select
  using (active = true or security.is_admin());

create policy "hero_slides: admin write"
  on public.hero_slides for all
  using (security.is_admin())
  with check (security.is_admin());

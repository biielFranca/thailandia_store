-- P0 #3 RLS hardening
--
-- 1. order_items: customers can insert items only for orders they own (or
--    guest orders). Required for the upcoming checkout Server Action to
--    persist line items under the caller's session.
-- 2. profiles: defensive self-insert policy in case the on_auth_user_created
--    trigger ever fails (trigger remains primary path).
-- 3. SECURITY DEFINER / trigger functions get pinned search_path and have
--    EXECUTE revoked from anon/authenticated where they should never be
--    called via PostgREST RPC. is_admin() keeps EXECUTE because RLS
--    policies reference it under the caller's role.

create policy "order_items: insert own"
  on public.order_items
  for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.profile_id = auth.uid() or o.profile_id is null)
    )
  );

create policy "profiles: own insert"
  on public.profiles
  for insert
  with check (auth.uid() = id);

alter function public.is_admin()                 set search_path = public, pg_temp;
alter function public.handle_new_user()          set search_path = public, pg_temp;
alter function public.set_updated_at()           set search_path = public, pg_temp;
alter function public.log_order_status_change()  set search_path = public, pg_temp;

revoke execute on function public.handle_new_user()         from public, anon, authenticated;
revoke execute on function public.set_updated_at()          from public, anon, authenticated;
revoke execute on function public.log_order_status_change() from public, anon, authenticated;

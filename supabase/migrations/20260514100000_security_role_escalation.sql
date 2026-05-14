-- Security: block role escalation via profiles.role
--
-- Replaces the old "profiles: own update" policy (which had no WITH CHECK
-- guarding the `role` column) with a new policy that keeps role immutable
-- for non-admins. A BEFORE UPDATE trigger adds a second, independent layer
-- of defence (defence in depth).

-- 1. Drop the old permissive update policy (may not exist yet in a fresh DB,
--    so we guard with a DO block to avoid failure on first deploy).
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename  = 'profiles'
      and policyname = 'profiles: own update'
  ) then
    execute 'drop policy "profiles: own update" on public.profiles';
  end if;
end
$$;

-- 2. New policy: users can update only their own row AND must not change role.
create policy "profiles: own update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- role must remain whatever it currently is in the DB
    and role = (
      select p.role
      from public.profiles p
      where p.id = auth.uid()
    )
  );

-- 3. Trigger function: secondary guard — raises at the DB level regardless of
--    how the update arrives (PostgREST, direct psql, service role acting on
--    behalf of a user, etc.). Admins are exempt so the admin panel can promote
--    users when needed.
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.role is distinct from new.role then
    if not public.is_admin() then
      raise exception 'Changing profile role is not allowed';
    end if;
  end if;
  return new;
end;
$$;

-- Revoke public execute — trigger functions should never be called via RPC.
revoke execute on function public.prevent_profile_role_escalation() from public, anon, authenticated;

drop trigger if exists prevent_profile_role_escalation on public.profiles;

create trigger prevent_profile_role_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_escalation();

-- 4. Optional: add CHECK constraint to limit valid role values.
--    Only adds the constraint if it doesn't already exist (idempotent).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname   = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'admin'));
  end if;
end
$$;

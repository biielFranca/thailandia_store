-- Security: ensure the profile role-escalation trigger exists.
--
-- Some remote databases already had the helper function but not the trigger
-- because their migration history predates the local P0 hardening files.
-- Keep this migration idempotent so it can safely run on both histories.

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, security, pg_temp
as $$
begin
  if old.role is distinct from new.role then
    if coalesce((select auth.role()), '') <> 'service_role' and not security.is_admin() then
      raise exception 'Changing profile role is not allowed';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_profile_role_escalation()
  from public, anon, authenticated;

drop trigger if exists prevent_profile_role_escalation on public.profiles;

create trigger prevent_profile_role_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_escalation();

-- Security: move the admin RLS helper out of the exposed public schema.
--
-- Supabase recommends keeping SECURITY DEFINER helper functions used by RLS in
-- a non-exposed schema. Policies can still call them by schema-qualified name,
-- while they are no longer available as public RPC functions.

create schema if not exists security;

revoke all on schema security from public;
grant usage on schema security to anon, authenticated, service_role;

create or replace function security.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on function security.is_admin() from public;
grant execute on function security.is_admin() to anon, authenticated, service_role;

-- Backwards-compatible wrapper for any old references. It stays non-callable
-- from anon/authenticated RPC because EXECUTE is revoked below.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = security, public, pg_temp
as $$
  select security.is_admin();
$$;

revoke execute on function public.is_admin() from public, anon, authenticated;

-- Rewrite existing policies that call public.is_admin() (or an older
-- unqualified is_admin()) to use the private helper.
do $$
declare
  policy_record record;
  using_expr text;
  check_expr text;
  alter_sql text;
begin
  for policy_record in
    select
      n.nspname as schema_name,
      c.relname as table_name,
      p.polname as policy_name,
      pg_get_expr(p.polqual, p.polrelid) as using_expr,
      pg_get_expr(p.polwithcheck, p.polrelid) as check_expr
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where coalesce(pg_get_expr(p.polqual, p.polrelid), '') like '%is_admin()%'
       or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') like '%is_admin()%'
  loop
    using_expr := policy_record.using_expr;
    check_expr := policy_record.check_expr;

    if using_expr is not null then
      using_expr := replace(using_expr, 'public.is_admin()', 'security.is_admin()');
      using_expr := regexp_replace(
        using_expr,
        '(^|[^.[:alnum:]_])is_admin\(\)',
        '\1security.is_admin()',
        'g'
      );
    end if;

    if check_expr is not null then
      check_expr := replace(check_expr, 'public.is_admin()', 'security.is_admin()');
      check_expr := regexp_replace(
        check_expr,
        '(^|[^.[:alnum:]_])is_admin\(\)',
        '\1security.is_admin()',
        'g'
      );
    end if;

    alter_sql := format(
      'alter policy %I on %I.%I',
      policy_record.policy_name,
      policy_record.schema_name,
      policy_record.table_name
    );

    if using_expr is not null then
      alter_sql := alter_sql || format(' using (%s)', using_expr);
    end if;

    if check_expr is not null then
      alter_sql := alter_sql || format(' with check (%s)', check_expr);
    end if;

    execute alter_sql;
  end loop;
end
$$;

-- Keep the role-escalation trigger strict for normal users, but allow
-- service-role maintenance scripts to promote the first/admin users.
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

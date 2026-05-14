-- Security: constrain payments.status to known valid values
--
-- Prevents a leaked service-role key from inserting arbitrary status strings.
-- Centralises the valid-state list at the DB layer so all callers (webhook,
-- server actions, admin) must use the same vocabulary.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.payments'::regclass
      and conname   = 'payments_status_check'
  ) then
    alter table public.payments
      add constraint payments_status_check
      check (status in ('pending', 'confirmed', 'failed', 'refunded'));
  end if;
end
$$;

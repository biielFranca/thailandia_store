-- Restore the two RPC functions the checkout code depends on. They previously
-- existed (see 20260510130000_decrement_stock_fn.sql) but were lost — the live
-- DB only had is_admin() left in the public schema. Without these, placeOrder
-- fails at runtime with 'function create_order_atomic does not exist' and
-- payment confirmation silently skips the stock decrement.

-- ─── create_order_atomic ──────────────────────────────────────────────────────
-- One atomic transaction:
--   1. Lock product rows referenced in p_items (FOR UPDATE) to prevent
--      concurrent overselling.
--   2. Re-check stock under the lock; raise 'Estoque insuficiente: <name>'
--      so the action surfaces the exact product to the user.
--   3. INSERT into orders, returning the new id.
--   4. INSERT all order_items in a single statement.
--   5. Return jsonb { order_id } so the caller can route the buyer to the
--      payment page.
-- Stock is NOT decremented here — that only happens after payment
-- confirmation via decrement_stock_for_order().
create or replace function public.create_order_atomic(
  p_store_id         uuid,
  p_profile_id       uuid,
  p_subtotal         numeric,
  p_shipping_cost    numeric,
  p_total            numeric,
  p_shipping_address jsonb,
  p_customer_name    text,
  p_customer_email   text,
  p_customer_phone   text,
  p_notes            text,
  p_items            jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_pid      uuid;
  v_qty      int;
  v_stock    int;
  v_name     text;
begin
  -- Lock & validate per-product (aggregated quantity per id)
  for v_pid, v_qty in
    select
      (i->>'product_id')::uuid,
      sum((i->>'quantity')::int)
    from jsonb_array_elements(p_items) as i
    group by 1
  loop
    select stock_quantity, name into v_stock, v_name
      from public.products
     where id = v_pid
     for update;

    if not found then
      raise exception 'Produto não encontrado (%).', v_pid;
    end if;
    if v_stock < v_qty then
      raise exception 'Estoque insuficiente para %.', v_name
        using errcode = 'P0001';
    end if;
  end loop;

  -- Create the order
  insert into public.orders (
    store_id, profile_id, subtotal, shipping_cost, total,
    shipping_address, customer_name, customer_email, customer_phone, notes
  ) values (
    p_store_id, p_profile_id, p_subtotal, p_shipping_cost, p_total,
    p_shipping_address, p_customer_name, p_customer_email, p_customer_phone, p_notes
  )
  returning id into v_order_id;

  -- Insert items
  insert into public.order_items (order_id, product_id, quantity, unit_price, total_price, product_snapshot)
  select
    v_order_id,
    (i->>'product_id')::uuid,
    (i->>'quantity')::int,
    (i->>'unit_price')::numeric,
    (i->>'total_price')::numeric,
    coalesce(i->'product_snapshot', '{}'::jsonb)
  from jsonb_array_elements(p_items) as i;

  return jsonb_build_object('order_id', v_order_id);
end;
$$;

revoke execute on function public.create_order_atomic(uuid, uuid, numeric, numeric, numeric, jsonb, text, text, text, text, jsonb) from public, anon, authenticated;
-- service_role automatically retains EXECUTE via default privileges.

-- ─── decrement_stock_for_order ────────────────────────────────────────────────
-- Called once per order after payment is confirmed. Idempotent at the caller
-- (status guards in processCardPayment + webhook), so a single UPDATE is enough.
create or replace function public.decrement_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.products as p
     set stock_quantity = greatest(0, p.stock_quantity - oi.quantity)
    from public.order_items as oi
   where oi.order_id = p_order_id
     and oi.product_id = p.id;
end;
$$;

revoke execute on function public.decrement_stock_for_order(uuid) from public, anon, authenticated;

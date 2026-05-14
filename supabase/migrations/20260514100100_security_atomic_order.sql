-- Security: atomic order creation with pessimistic stock locking
--
-- create_order_atomic() replaces the multi-step JS approach in placeOrder().
-- All writes happen inside ONE transaction with row-level locks so that
-- concurrent requests cannot oversell the same product.
--
-- Flow:
--   1. Lock every product row involved (SELECT … FOR UPDATE)
--   2. Validate stock — raise if insufficient (never silently clamp)
--   3. INSERT order + order_items
--   4. Decrement stock (hard fail if somehow negative — should never happen
--      because step 2 already checked)
--   5. Return the new order id and computed totals
--
-- The caller (placeOrder Server Action) no longer needs to call
-- decrementStockForOrder() after payment confirmation; stock is committed at
-- order creation time. The webhook and processCardPayment therefore skip
-- the decrement step for orders that went through this RPC.

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
  p_items            jsonb   -- array of {product_id, quantity, unit_price, total_price, product_snapshot}
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id  uuid;
  v_item      jsonb;
  v_product   record;
  v_qty       int;
begin
  -- ── 1. Lock all involved product rows in a consistent order (by id) to avoid
  --       deadlocks when concurrent calls arrive for overlapping products.
  for v_product in
    select p.id, p.stock_quantity, p.name
    from   public.products p
    where  p.id in (
             select (elem->>'product_id')::uuid
             from   jsonb_array_elements(p_items) elem
           )
    order by p.id
    for update
  loop
    -- Aggregate requested quantity for this product across all items
    select coalesce(sum((elem->>'quantity')::int), 0)
    into   v_qty
    from   jsonb_array_elements(p_items) elem
    where  (elem->>'product_id')::uuid = v_product.id;

    if v_product.stock_quantity < v_qty then
      raise exception 'Estoque insuficiente para % (disponível: %, solicitado: %)',
        v_product.name, v_product.stock_quantity, v_qty;
    end if;
  end loop;

  -- ── 2. Insert order
  insert into public.orders (
    store_id, profile_id, subtotal, shipping_cost, total,
    shipping_address, customer_name, customer_email, customer_phone, notes
  ) values (
    p_store_id, p_profile_id, p_subtotal, p_shipping_cost, p_total,
    p_shipping_address, p_customer_name, p_customer_email, p_customer_phone, p_notes
  )
  returning id into v_order_id;

  -- ── 3. Insert order_items and decrement stock for each
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id, product_id, quantity, unit_price, total_price, product_snapshot
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      (v_item->>'total_price')::numeric,
      v_item->'product_snapshot'
    );

    update public.products
    set    stock_quantity = stock_quantity - (v_item->>'quantity')::int
    where  id = (v_item->>'product_id')::uuid;

    -- Hard fail if stock went negative (indicates a logic bug, not a user error)
    if (
      select stock_quantity from public.products
      where id = (v_item->>'product_id')::uuid
    ) < 0 then
      raise exception 'stock_quantity below zero for product %; this is a bug',
        v_item->>'product_id';
    end if;
  end loop;

  return jsonb_build_object('order_id', v_order_id);
end;
$$;

-- Only the service role should call this RPC (Server Actions use service key
-- when calling authenticated RPCs; anon/authenticated are explicitly denied).
revoke execute on function public.create_order_atomic(
  uuid, uuid, numeric, numeric, numeric, jsonb, text, text, text, text, jsonb
) from public, anon, authenticated;

-- ── Update decrement_stock_for_order to fail hard instead of silently clamping
--    This function is now only used for legacy webhooks that pre-date the atomic
--    RPC. If stock would go negative it means the order was double-processed.
CREATE OR REPLACE FUNCTION public.decrement_stock_for_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.products AS p
  SET    stock_quantity = p.stock_quantity - oi.quantity
  FROM   public.order_items AS oi
  WHERE  oi.order_id   = p_order_id
    AND  oi.product_id = p.id;

  -- Detect negative stock — means this order was double-processed
  IF EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.order_items oi ON oi.product_id = p.id
    WHERE oi.order_id = p_order_id
      AND p.stock_quantity < 0
  ) THEN
    RAISE EXCEPTION 'decrement_stock_for_order: stock went negative for order %. Possible double-processing.', p_order_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.decrement_stock_for_order(uuid)
  FROM PUBLIC, anon, authenticated;

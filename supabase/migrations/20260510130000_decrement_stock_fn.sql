-- P2 #9 — Stock decrement
--
-- A single SQL function handles the decrement atomically: one UPDATE joining
-- order_items to products, with GREATEST(0, …) preventing negative stock.
-- SECURITY DEFINER + REVOKE means only the service-role key (used in webhooks
-- and server actions that explicitly import createServiceClient) can call it —
-- regular anon/authenticated sessions cannot.

CREATE OR REPLACE FUNCTION public.decrement_stock_for_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.products AS p
  SET    stock_quantity = GREATEST(0, p.stock_quantity - oi.quantity)
  FROM   public.order_items AS oi
  WHERE  oi.order_id   = p_order_id
    AND  oi.product_id = p.id;
END;
$$;

-- Only the service role (bypasses RLS) should invoke this.
REVOKE EXECUTE ON FUNCTION public.decrement_stock_for_order(uuid)
  FROM PUBLIC, anon, authenticated;

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code             text        NOT NULL,
  type             text        NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value   numeric,                      -- null for free_shipping
  min_order_value  numeric     NOT NULL DEFAULT 0,
  max_uses         integer,                      -- null = unlimited
  uses_count       integer     NOT NULL DEFAULT 0,
  active           boolean     NOT NULL DEFAULT true,
  expires_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, code)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Only admins can manage coupons
CREATE POLICY "coupons_admin_all" ON coupons
  FOR ALL TO authenticated
  USING (security.is_admin())
  WITH CHECK (security.is_admin());

-- Public/authenticated can read active coupons (needed for checkout validation)
CREATE POLICY "coupons_public_read_active" ON coupons
  FOR SELECT TO anon, authenticated
  USING (active = true);

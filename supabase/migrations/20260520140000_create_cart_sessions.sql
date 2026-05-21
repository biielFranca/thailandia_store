-- Cart abandonment tracking.
--
-- The cart lives client-side in localStorage. To measure "user added items
-- and never checked out", we mirror the cart server-side into cart_sessions.
-- An identifier (profile_id for logged users, anon_id cookie for visitors)
-- is used to upsert one active row per shopper. When placeOrder succeeds,
-- the active cart for that shopper is stamped with converted_order_id.
--
-- All writes go through server actions using the service client; RLS denies
-- direct anon/authenticated access. Admin reports SELECT via service client.

CREATE TABLE IF NOT EXISTS public.cart_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  profile_id uuid NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anon_id text NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  items_count integer NOT NULL DEFAULT 0,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  converted_order_id uuid NULL REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cart_sessions_identifier_present
    CHECK (profile_id IS NOT NULL OR anon_id IS NOT NULL),
  CONSTRAINT cart_sessions_items_count_nonneg
    CHECK (items_count >= 0),
  CONSTRAINT cart_sessions_subtotal_nonneg
    CHECK (subtotal >= 0)
);

-- One active (= not yet converted) cart per (store, profile) and per
-- (store, anon_id). Filter index lets converted rows duplicate freely so
-- the same user can start a new cart after buying.
CREATE UNIQUE INDEX IF NOT EXISTS cart_sessions_active_profile_uq
  ON public.cart_sessions (store_id, profile_id)
  WHERE converted_order_id IS NULL AND profile_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS cart_sessions_active_anon_uq
  ON public.cart_sessions (store_id, anon_id)
  WHERE converted_order_id IS NULL AND anon_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS cart_sessions_updated_at_idx
  ON public.cart_sessions (updated_at DESC);

CREATE INDEX IF NOT EXISTS cart_sessions_converted_idx
  ON public.cart_sessions (converted_order_id)
  WHERE converted_order_id IS NOT NULL;

-- Touch updated_at on every UPDATE
CREATE OR REPLACE FUNCTION public.cart_sessions_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cart_sessions_touch_updated_at_trg ON public.cart_sessions;
CREATE TRIGGER cart_sessions_touch_updated_at_trg
  BEFORE UPDATE ON public.cart_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.cart_sessions_touch_updated_at();

-- RLS — deny direct client access; server actions use service role.
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;

-- Allow logged-in users to read their own active cart (optional convenience;
-- not used by the storefront today but keeps the table queryable for
-- end-user dashboards in the future).
DROP POLICY IF EXISTS cart_sessions_self_select ON public.cart_sessions;
CREATE POLICY cart_sessions_self_select
  ON public.cart_sessions
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

COMMENT ON TABLE public.cart_sessions IS
  'Server-side mirror of client carts. Used to compute true cart abandonment metrics.';
COMMENT ON COLUMN public.cart_sessions.anon_id IS
  'Random UUID generated client-side and stored in localStorage. Identifies visitors before login.';
COMMENT ON COLUMN public.cart_sessions.converted_order_id IS
  'Set by placeOrder() when this cart becomes a paid (or attempted) order. NULL = still active or abandoned.';

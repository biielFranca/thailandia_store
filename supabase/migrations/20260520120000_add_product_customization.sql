-- Per-product jersey customization (name + number on shirt) with an optional
-- per-product extra price. When customization_price is null the storefront
-- falls back to stores.config->>'defaultCustomizationPrice' (resolved in the
-- application layer; no DB-side join needed).
--
-- Constraints (range 0..999 / length <= 15) are enforced server-side in the
-- placeOrder action because the values live inside order_items.product_snapshot
-- JSON. Only the per-product extra price gets a CHECK here.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS customization_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS customization_price numeric(10,2) NULL
    CHECK (customization_price IS NULL OR customization_price >= 0);

COMMENT ON COLUMN products.customization_enabled IS
  'When true the storefront shows the name+number customization UI on the PDP.';

COMMENT ON COLUMN products.customization_price IS
  'Extra charge for customization on this specific product. NULL = use store default (stores.config->defaultCustomizationPrice).';

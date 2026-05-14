-- Security: add payment_processing to order_status enum
--
-- This intermediate status is set atomically (UPDATE … WHERE status = 'pending_payment')
-- before calling Mercado Pago. If two concurrent requests race, only one gets
-- the row lock via the conditional UPDATE — the other sees 0 rows updated
-- and aborts early, preventing double-charge and double stock decrement.

alter type order_status add value if not exists 'payment_processing';

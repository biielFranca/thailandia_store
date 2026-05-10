-- The Server Action updateOrderStatus is now the single canonical path for
-- order status changes. It inserts into order_status_history with changed_by
-- and an optional note — both of which the auto-trigger could not capture.
-- The function `log_order_status_change` is left in place in case we ever
-- want to re-enable trigger-based logging.

drop trigger if exists on_order_status_change on public.orders;

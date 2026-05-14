-- Security: remove is_admin() from the public RPC surface
--
-- is_admin() is SECURITY DEFINER and used internally by RLS policies.
-- There is no reason for anon/authenticated callers to invoke it directly
-- via POST /rest/v1/rpc/is_admin — revoking execute closes that surface
-- while keeping the function available for policy evaluation (policies run
-- as the DB owner, not as the session role, so REVOKE doesn't affect them).

revoke execute on function public.is_admin() from anon, authenticated;

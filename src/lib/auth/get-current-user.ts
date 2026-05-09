import { createClient } from "@/lib/supabase/server";

export type CurrentUserRole = "customer" | "admin";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: CurrentUserRole;
}

/**
 * Server-only. Returns the authenticated user merged with the `profiles` row,
 * or `null` if no session exists. Never trust the client for role — always
 * resolve it through this helper inside Server Components / Server Actions /
 * Route Handlers.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const metaName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;
  const fallbackName = data.user.email?.split("@")[0] ?? "Cliente";
  const name = (profile?.full_name || metaName || fallbackName).toString().trim();

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name,
    role: profile?.role === "admin" ? "admin" : "customer",
  };
}

import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "./get-current-user";

/**
 * Server-only. Ensures the caller is authenticated and returns the resolved
 * user. Redirects to /login (with redirect param) if no session. Use in
 * Server Components and Server Actions that require a logged-in customer.
 */
export async function requireAuth(redirectTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const params = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/login${params}`);
  }
  return user;
}

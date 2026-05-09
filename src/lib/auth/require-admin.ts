import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "./get-current-user";

/**
 * Server-only. Ensures the caller is an authenticated admin and returns the
 * resolved user. Redirects to /login otherwise. Use in Server Components,
 * admin layouts, and any Server Action that performs admin mutations.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login?error=forbidden");
  return user;
}

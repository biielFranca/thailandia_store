import { revalidatePath } from "next/cache";

/**
 * Revalidate every page after a catalog mutation. Using `'/', 'layout'` busts
 * the entire app-router cache tree from the root, so any current OR future
 * page that reads from Supabase picks up the change on its next request.
 *
 * Slightly more aggressive than enumerating each path, but the wins outweigh
 * the cost: there's no risk of forgetting to add a freshly-introduced route
 * to a hand-maintained list.
 */
export function revalidateCatalog() {
  revalidatePath("/", "layout");
}

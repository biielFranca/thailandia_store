import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cookie-less Supabase client for contexts that run without an HTTP request:
 * `generateStaticParams`, `generateMetadata` at build time, build-time scripts.
 *
 * Do NOT use this for authenticated reads (it always behaves as the `anon`
 * role) — it's intended for public queries that work fine under RLS for
 * unauthenticated users (active products, active categories, etc.).
 */
export function createStaticClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

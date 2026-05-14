/**
 * Promote a user to admin by email.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/promote-admin.ts user@example.com
 *
 * Why service-role: the script needs to read auth.users (only service-role can)
 * and bypass RLS to update profiles.role. Never bake the service-role key into
 * client code or check it in — keep it in your shell or a local-only env file.
 *
 * Idempotent: re-running on an already-admin account is a no-op that exits 0.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { Database } from "../src/lib/supabase/database.types";

// Load .env from the project root if env vars aren't already set in the shell.
// Keeps the script ergonomic without pulling in a full dotenv dependency.
function loadDotenv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // No .env file — fall back to shell-only env vars.
  }
}
loadDotenv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!url) fail("Missing NEXT_PUBLIC_SUPABASE_URL.");
if (!serviceKey) fail("Missing SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Settings → API).");

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  fail('Usage: npx tsx scripts/promote-admin.ts <email>');
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false },
});

(async () => {
  // listUsers paginates; for any normal-sized project page 1 covers it.
  // If you exceed this, narrow with a server-side filter once you have one.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) fail(`Failed to list users: ${listErr.message}`);

  const user = list.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) fail(`No auth user found with email ${email}.`);

  const { data: existing } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing?.role === "admin") {
    console.log(`✓ ${email} is already admin (no-op).`);
    return;
  }

  // Upsert in case the trigger that backfills profiles ever missed this user.
  const { error: upErr } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "admin" }, { onConflict: "id" });
  if (upErr) fail(`Failed to update profile: ${upErr.message}`);

  console.log(`✓ ${email} promoted to admin.`);
})();

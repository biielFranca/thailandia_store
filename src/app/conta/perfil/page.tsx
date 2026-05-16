import { requireAuth } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileFormClient } from "./profile-form-client";

export const metadata = { title: "Meu perfil" };

export default async function ContaPerfilPage() {
  const user = await requireAuth("/conta/perfil");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Área do cliente
        </p>
        <h1 className="font-title mt-1 text-3xl text-white">MEU PERFIL</h1>
      </div>

      <ProfileFormClient
        initialName={profile?.full_name ?? user.name}
        initialPhone={profile?.phone ?? ""}
        email={user.email}
        memberSince={profile?.created_at ?? null}
      />
    </div>
  );
}

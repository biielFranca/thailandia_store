import { requireAuth } from "@/lib/auth/require-auth";
import { ContaShell } from "@/components/conta/conta-shell";

export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth("/conta");
  return (
    <ContaShell user={{ id: user.id, name: user.name, email: user.email }}>
      {children}
    </ContaShell>
  );
}

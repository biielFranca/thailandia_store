import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <AdminShell initialUser={{ id: user.id, email: user.email, name: user.name, role: "admin" }}>
      {children}
    </AdminShell>
  );
}

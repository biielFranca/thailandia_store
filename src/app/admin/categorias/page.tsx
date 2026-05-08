import Link from "next/link";
import { catalogCategories, catalogProducts } from "@/themes/thailandia/content/catalog";
export default function CategoriasAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Catálogo</p>
        <h1 className="font-title mt-1 text-3xl text-white">CATEGORIAS</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalogCategories.map((cat) => {
          const count = catalogProducts.filter((p) => p.categorySlug === cat.slug).length;
          return (
            <div key={cat.slug} className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>{cat.accent}</p>
              <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{cat.name}</p>
              <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--cta)" }}>{count}</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>produto{count !== 1 ? "s" : ""}</p>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{cat.description}</p>
              <Link href={cat.href} target="_blank" className="mt-3 inline-flex text-xs font-medium transition-colors hover:[color:var(--cta)]" style={{ color: "var(--text-tertiary)" }}>Ver categoria →</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
export default function CuponsPage() {
  const [coupons] = useState([
    { code: "FRETE10", type: "Frete grátis", discount: "—", uses: 34, active: true },
    { code: "COPA2026", type: "Percentual", discount: "15%", uses: 87, active: true },
    { code: "BEMVINDO", type: "Fixo", discount: "R$ 20,00", uses: 156, active: true },
    { code: "BLACK50", type: "Percentual", discount: "50%", uses: 412, active: false },
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Promoções</p>
          <h1 className="font-title mt-1 text-3xl text-white">CUPONS</h1>
        </div>
        <button className="rounded-[8px] px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>+ Novo cupom</button>
      </div>
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-center">Desconto</th>
              <th className="px-4 py-3 text-center">Usos</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, i) => (
              <tr key={c.code} className="border-b" style={{ borderColor: "var(--border-subtle)", backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-1)" }}>
                <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: "var(--text-primary)" }}>{c.code}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{c.type}</td>
                <td className="px-4 py-3 text-center text-xs font-semibold" style={{ color: "var(--cta)" }}>{c.discount}</td>
                <td className="px-4 py-3 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>{c.uses}</td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ backgroundColor: c.active ? "rgba(34,197,94,0.15)" : "var(--surface-2)", color: c.active ? "var(--success)" : "var(--text-tertiary)" }}>
                    {c.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

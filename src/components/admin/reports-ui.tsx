import Link from "next/link";

// ─── Shell ────────────────────────────────────────────────────────────────────

export function ReportShell({
  overline,
  title,
  subtitle,
  children,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/relatorios"
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:[color:var(--text-primary)] mb-3"
          style={{ color: "var(--text-tertiary)" }}
        >
          ← Relatórios
        </Link>
        {overline && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
            {overline}
          </p>
        )}
        <h1 className="font-title mt-1 text-2xl text-white sm:text-3xl">{title.toUpperCase()}</h1>
        {subtitle && (
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-tertiary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function ReportSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[12px] border p-5 sm:p-6"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
    >
      {title && (
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

// ─── KPI ──────────────────────────────────────────────────────────────────────

export function KpiCard({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  /** Optional trend indicator: positive/neutral/negative arrow */
  trend?: { direction: "up" | "down" | "flat"; text: string };
}) {
  const trendColor =
    trend?.direction === "up" ? "var(--success)" : trend?.direction === "down" ? "var(--danger)" : "var(--text-tertiary)";
  return (
    <div
      className="flex flex-col rounded-[12px] border p-4"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="price mt-1.5 text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          {hint}
        </p>
      )}
      {trend && (
        <p className="mt-2 text-[11px] font-semibold" style={{ color: trendColor }}>
          {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "—"} {trend.text}
        </p>
      )}
    </div>
  );
}

// ─── Bar chart (vertical, time-series) ───────────────────────────────────────

export interface BarPoint {
  label: string;
  value: number;
  /** Optional secondary value rendered as a hint under the label (e.g. count). */
  secondary?: string;
}

export function VerticalBars({ data, formatValue }: { data: BarPoint[]; formatValue: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ minHeight: 200 }}>
      {data.map((d, i) => {
        const h = (d.value / max) * 160;
        return (
          <div key={i} className="flex min-w-[44px] flex-1 flex-col items-center gap-1.5">
            <p className="price text-[10px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
              {d.value > 0 ? formatValue(d.value) : ""}
            </p>
            <div
              className="w-full rounded-t-[4px] transition-all"
              style={{
                height: Math.max(2, h),
                background: d.value > 0
                  ? "linear-gradient(180deg, var(--cta) 0%, rgba(30,107,255,0.55) 100%)"
                  : "var(--surface-2)",
                boxShadow: d.value > 0 ? "0 0 12px rgba(30,107,255,0.25)" : "none",
              }}
            />
            <p className="text-[9px] font-medium uppercase leading-tight tracking-[0.06em]"
              style={{ color: "var(--text-tertiary)" }}>
              {d.label}
            </p>
            {d.secondary && (
              <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{d.secondary}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Horizontal bar list (rankings) ───────────────────────────────────────────

export interface RankRow {
  id: string;
  label: string;
  sub?: string;
  value: number;
  valueLabel: string;
  image?: string | null;
}

export function HorizontalRankList({ rows, accent }: { rows: RankRow[]; accent?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const color = accent ?? "var(--cta)";
  if (rows.length === 0) {
    return <EmptyState message="Sem dados no período." />;
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r, idx) => {
        const pct = (r.value / max) * 100;
        return (
          <li key={r.id} className="relative flex items-center gap-3 rounded-[8px] border px-3 py-2"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}>
            <span className="price w-6 text-center text-[11px] font-bold tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              {String(idx + 1).padStart(2, "0")}
            </span>
            {r.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.image} alt="" className="h-10 w-10 flex-shrink-0 rounded-[6px] object-cover" />
            ) : (
              <div className="h-10 w-10 flex-shrink-0 rounded-[6px]" style={{ backgroundColor: "var(--surface-3)" }} />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {r.label}
              </p>
              {r.sub && (
                <p className="truncate text-[11px]" style={{ color: "var(--text-tertiary)" }}>{r.sub}</p>
              )}
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--surface-3)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
                />
              </div>
            </div>
            <p className="price flex-shrink-0 text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {r.valueLabel}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({ message }: { message: string }) {
  return (
    <p
      className="rounded-[8px] border border-dashed p-6 text-center text-sm"
      style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}
    >
      {message}
    </p>
  );
}

// ─── Stat row (for retention / abandonment) ───────────────────────────────────

export function StatRow({ label, value, hint, color }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-3 last:border-b-0"
      style={{ borderColor: "var(--border-subtle)" }}>
      <div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</p>
        {hint && <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>{hint}</p>}
      </div>
      <p className="price text-base font-bold tabular-nums" style={{ color: color ?? "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

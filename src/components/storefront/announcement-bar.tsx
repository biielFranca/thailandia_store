// Top-of-page banner. Renders in normal flow above the fixed StoreHeader so
// it scrolls away naturally — visitors see it on every first paint of every
// page without permanently eating vertical space.

export function AnnouncementBar() {
  return (
    <div
      className="flex h-9 items-center justify-center px-4 text-center text-[11px] font-bold uppercase tracking-[0.18em]"
      style={{
        background: "linear-gradient(90deg, var(--cta), color-mix(in oklab, var(--cta) 70%, #000))",
        color: "var(--cta-foreground)",
      }}
      role="status"
    >
      <span aria-hidden="true" className="mr-2">🚚</span>
      Frete grátis para todo o Brasil
    </div>
  );
}

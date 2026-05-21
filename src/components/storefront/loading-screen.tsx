/* eslint-disable @next/next/no-img-element */

interface LoadingScreenProps {
  /** When true (default) takes the full viewport; otherwise fills the parent. */
  fullScreen?: boolean;
  /** Text under the animation. Defaults to "Carregando...". Pass null to hide. */
  label?: string | null;
}

/**
 * Animated soccer-field SVG loader. The SVG ships its own SMIL animations,
 * so we just render it as a static <img> — no JS, no Lottie runtime.
 */
export function LoadingScreen({ fullScreen = true, label = "Carregando..." }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        fullScreen
          ? "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4"
          : "flex w-full flex-col items-center justify-center gap-4 py-12"
      }
      style={
        fullScreen
          ? {
              backgroundColor: "var(--surface-1, #04060f)",
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(30,107,255,0.10) 0%, transparent 60%), var(--surface-1, #04060f)",
            }
          : undefined
      }
    >
      <img
        src="/loading-field.svg"
        alt=""
        aria-hidden="true"
        style={{ width: "clamp(180px, 28vw, 360px)", height: "auto" }}
        className="aspect-square"
        draggable={false}
      />
      {label && (
        <p
          className="text-xs font-semibold uppercase tracking-[0.24em]"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.55))" }}
        >
          {label}
        </p>
      )}
      <span className="sr-only">Carregando o conteúdo da página.</span>
    </div>
  );
}

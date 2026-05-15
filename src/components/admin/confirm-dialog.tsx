"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  /** Controls visibility. When false, nothing is rendered. */
  open: boolean;
  /** Modal heading. */
  title: string;
  /** Body text (plain string). For richer content, pass `children` instead. */
  message?: string;
  /** Optional richer body — takes precedence over `message`. */
  children?: React.ReactNode;
  /** Label for the confirm button. Defaults to "Confirmar". */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to "Cancelar". */
  cancelLabel?: string;
  /** "danger" paints the confirm button red; "default" uses --cta blue. */
  variant?: "default" | "danger";
  /** Disables both buttons (use while the underlying action is in-flight). */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Centered modal confirmation dialog. Replaces `window.confirm()` with a UI
 * that matches the admin's dark theme. Renders via `createPortal` into the
 * document body so parent overflow/z-index can't clip it.
 *
 * Keyboard: ESC cancels; Enter confirms. Initial focus lands on Cancel — the
 * safer choice for destructive actions.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcuts + initial focus + scroll lock.
  useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus Cancel for accidental Enter-key safety on destructive actions.
    cancelRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (busy) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previousActive?.focus?.();
    };
  }, [open, busy, onCancel, onConfirm]);

  // Skip rendering during SSR (no document) and when closed. This component is
  // a Client Component so it never renders on the server, but the type-guard
  // also keeps Node/test environments happy.
  if (!open || typeof document === "undefined") return null;

  const confirmStyle =
    variant === "danger"
      ? { backgroundColor: "var(--danger)", color: "#fff" }
      : { backgroundColor: "var(--cta)", color: "var(--cta-foreground)" };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={() => !busy && onCancel()}
        className="absolute inset-0 cursor-default animate-[confirm-fade_120ms_ease-out]"
        style={{
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[420px] rounded-[14px] border p-6 shadow-2xl animate-[confirm-pop_160ms_cubic-bezier(0.22,1,0.36,1)]"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface-1)",
        }}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>

        <div
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {children ?? message}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            ref={cancelRef}
            onClick={onCancel}
            disabled={busy}
            className="rounded-[8px] border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-[8px] px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={confirmStyle}
          >
            {busy ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confirm-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes confirm-pop {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>,
    document.body
  );
}

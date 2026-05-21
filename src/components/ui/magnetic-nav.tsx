"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

/**
 * Inspired by the "magnetic cursor" pill nav pattern: a single absolutely
 * positioned pill slides under whichever tab the user is hovering. We adapt
 * the original (white bg / black cursor / mix-blend-difference) to this
 * project's dark theme by using CSS variables and a translucent blue cursor
 * — no blend mode, text colors react directly to hover.
 */

export type MagneticNavItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "special"; label: string; href: string }
  | { kind: "button"; label: string; onClick: () => void; isOpen?: boolean; rightSlot?: ReactNode };

interface CursorPos {
  left: number;
  width: number;
  opacity: number;
}

export function MagneticNav({
  items,
  activeHref,
}: {
  items: MagneticNavItem[];
  activeHref?: string | null;
}) {
  const [cursor, setCursor] = useState<CursorPos>({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      className="relative mx-auto flex w-fit items-center rounded-full border p-1"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--surface-1)",
      }}
      onMouseLeave={() => setCursor((p) => ({ ...p, opacity: 0 }))}
    >
      {items.map((item, idx) => {
        const isActive =
          activeHref &&
          item.kind !== "button" &&
          (item.href === "/"
            ? activeHref === "/"
            : activeHref === item.href || activeHref.startsWith(item.href + "/"));

        return (
          <Tab key={`${item.label}-${idx}`} setCursor={setCursor} isActive={!!isActive} item={item} />
        );
      })}

      <motion.li
        aria-hidden="true"
        animate={{ left: cursor.left, width: cursor.width, opacity: cursor.opacity }}
        transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.6 }}
        className="absolute z-0 h-8 rounded-full md:h-10"
        style={{
          top: "50%",
          translateY: "-50%",
          background:
            "linear-gradient(180deg, rgba(30,107,255,0.28) 0%, rgba(30,107,255,0.18) 100%)",
          border: "1px solid rgba(30,107,255,0.45)",
          boxShadow: "0 0 18px rgba(30,107,255,0.25)",
        }}
      />
    </ul>
  );
}

function Tab({
  item,
  setCursor,
  isActive,
}: {
  item: MagneticNavItem;
  setCursor: (p: CursorPos) => void;
  isActive: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);

  function handleEnter() {
    if (!ref.current) return;
    const { width } = ref.current.getBoundingClientRect();
    setCursor({ width, opacity: 1, left: ref.current.offsetLeft });
  }

  const baseClass =
    "relative z-10 inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors duration-200 md:px-4 md:py-2 md:text-sm";

  // "World Cup 2026" — keeps its gold treatment, escapes the generic palette
  if (item.kind === "special") {
    return (
      <li ref={ref} onMouseEnter={handleEnter} className="relative z-10">
        <Link
          href={item.href}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] transition-all md:px-4 md:py-2"
          style={
            isActive
              ? { background: "linear-gradient(90deg, #c8960c, #e8b820)", color: "#000" }
              : { color: "#e8b820" }
          }
        >
          ⚽ {item.label}
        </Link>
      </li>
    );
  }

  if (item.kind === "button") {
    return (
      <li ref={ref} onMouseEnter={handleEnter}>
        <button
          type="button"
          onClick={item.onClick}
          aria-haspopup="menu"
          aria-expanded={item.isOpen}
          className={baseClass}
          style={{ color: item.isOpen ? "var(--text-primary)" : "var(--text-secondary)" }}
        >
          {item.label}
          {item.rightSlot}
        </button>
      </li>
    );
  }

  return (
    <li ref={ref} onMouseEnter={handleEnter}>
      <Link
        href={item.href}
        className={baseClass}
        style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {item.label}
      </Link>
    </li>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { upsertCartSession } from "@/app/actions/cart-sessions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartCustomization {
  name: string | null;
  number: number | null;
  /** Extra charge at the moment the item was added — snapshot, never refetched. */
  price: number;
}

export interface CartItem {
  slug: string;
  name: string;
  image: string;
  displayPrice: string;
  priceValue: number; // numeric BRL — base product unit price
  size: string;
  quantity: number;
  customization?: CartCustomization | null;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; slug: string; size: string; customizationKey: string }
  | { type: "UPDATE_QTY"; slug: string; size: string; customizationKey: string; quantity: number }
  | { type: "CLEAR" };

// ─── Identity helpers ─────────────────────────────────────────────────────────

/**
 * Two cart lines are considered the same item iff they share product + size +
 * customization. Items with different customization (name/number) stay
 * separate so the customer sees each shirt they configured.
 */
export function customizationKey(c: CartCustomization | null | undefined): string {
  if (!c) return "";
  const name = (c.name ?? "").trim();
  const num = c.number !== null && c.number !== undefined ? String(c.number) : "";
  return `${name}#${num}`;
}

function sameLine(a: CartItem, slug: string, size: string, key: string): boolean {
  return a.slug === slug && a.size === size && customizationKey(a.customization) === key;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const key = customizationKey(action.item.customization);
      const idx = state.items.findIndex((i) =>
        sameLine(i, action.item.slug, action.item.size, key)
      );
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], quantity: items[idx].quantity + action.item.quantity };
        return { items };
      }
      return { items: [...state.items, action.item] };
    }
    case "REMOVE":
      return {
        items: state.items.filter(
          (i) => !sameLine(i, action.slug, action.size, action.customizationKey)
        ),
      };
    case "UPDATE_QTY": {
      if (action.quantity < 1) {
        return {
          items: state.items.filter(
            (i) => !sameLine(i, action.slug, action.size, action.customizationKey)
          ),
        };
      }
      return {
        items: state.items.map((i) =>
          sameLine(i, action.slug, action.size, action.customizationKey)
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StoreContextValue {
  // Cart
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, size: string, customizationKey: string) => void;
  updateQty: (slug: string, size: string, customizationKey: string, quantity: number) => void;
  clearCart: () => void;
  // UI
  cartOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEY = "ts_cart";
const ANON_ID_KEY = "ts_anon_id";

/** Per-unit price including any customization extra. */
function lineUnitPrice(i: CartItem): number {
  return i.priceValue + (i.customization?.price ?? 0);
}

/**
 * Ensures a stable anonymous identifier exists in localStorage. Used for
 * server-side cart abandonment tracking (cart_sessions table).
 */
function ensureAnonId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;
    const id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(ANON_ID_KEY, id);
    return id;
  } catch {
    return "";
  }
}

export function getCartAnonId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(ANON_ID_KEY) ?? "";
  } catch {
    return "";
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: CartItem[] = JSON.parse(raw);
        saved.forEach((item) => dispatch({ type: "ADD", item }));
      }
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.items));
    } catch {}
  }, [cart.items]);

  // ── Server-side cart mirror (for abandonment tracking) ───────────────────
  //
  // Debounced 1.5s — fast enough to capture real intent, slow enough to skip
  // the noise of rapid +/- qty clicks. Skips the very first render (hydration)
  // so we don't immediately recreate a row the user just abandoned and
  // emptied client-side.
  const skipFirstSyncRef = useRef(true);
  useEffect(() => {
    if (skipFirstSyncRef.current) {
      skipFirstSyncRef.current = false;
      return;
    }
    const anonId = ensureAnonId();
    if (!anonId) return;
    const items = cart.items;
    const subtotal = items.reduce((s, i) => s + lineUnitPrice(i) * i.quantity, 0);
    const handle = window.setTimeout(() => {
      void upsertCartSession({
        anonId,
        items: items.map((i) => ({
          slug: i.slug,
          name: i.name,
          image: i.image,
          size: i.size,
          quantity: i.quantity,
          priceValue: i.priceValue,
          customization: i.customization ?? null,
        })),
        subtotal,
      });
    }, 1500);
    return () => window.clearTimeout(handle);
  }, [cart.items]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD", item });
  }, []);

  const removeItem = useCallback((slug: string, size: string, customizationKey: string) => {
    dispatch({ type: "REMOVE", slug, size, customizationKey });
  }, []);

  const updateQty = useCallback(
    (slug: string, size: string, customizationKey: string, quantity: number) => {
      dispatch({ type: "UPDATE_QTY", slug, size, customizationKey, quantity });
    },
    []
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal  = cart.items.reduce((sum, i) => sum + lineUnitPrice(i) * i.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        items: cart.items,
        cartCount,
        subtotal,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        cartOpen,
        searchOpen,
        openCart:   () => setCartOpen(true),
        closeCart:  () => setCartOpen(false),
        openSearch: () => setSearchOpen(true),
        closeSearch:() => setSearchOpen(false),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

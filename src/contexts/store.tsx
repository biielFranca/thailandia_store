"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  slug: string;
  name: string;
  image: string;
  displayPrice: string;
  priceValue: number; // numeric for subtotal calc
  size: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; slug: string; size: string }
  | { type: "UPDATE_QTY"; slug: string; size: string; quantity: number }
  | { type: "CLEAR" };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const idx = state.items.findIndex(
        (i) => i.slug === action.item.slug && i.size === action.item.size
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
          (i) => !(i.slug === action.slug && i.size === action.size)
        ),
      };
    case "UPDATE_QTY": {
      if (action.quantity < 1) {
        return {
          items: state.items.filter(
            (i) => !(i.slug === action.slug && i.size === action.size)
          ),
        };
      }
      return {
        items: state.items.map((i) =>
          i.slug === action.slug && i.size === action.size
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
  removeItem: (slug: string, size: string) => void;
  updateQty: (slug: string, size: string, quantity: number) => void;
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

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD", item });
  }, []);

  const removeItem = useCallback((slug: string, size: string) => {
    dispatch({ type: "REMOVE", slug, size });
  }, []);

  const updateQty = useCallback((slug: string, size: string, quantity: number) => {
    dispatch({ type: "UPDATE_QTY", slug, size, quantity });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal  = cart.items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);

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

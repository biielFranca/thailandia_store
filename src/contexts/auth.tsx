"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "ts_user";

// ─── Demo credentials ─────────────────────────────────────────────────────────
// In production these would be validated against Supabase Auth.
// Admin: admin@ts.com / admin123
// Any other email+password (min 6 chars) creates a customer session.

const DEMO_ADMIN = { email: "admin@ts.com", password: "admin123" };

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) return { success: false, error: "Preencha todos os campos." };

    // TODO: replace with Supabase auth call
    if (email.toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      persist({ id: "admin-1", name: "Administrador", email: DEMO_ADMIN.email, role: "admin" });
      return { success: true };
    }

    if (password.length < 6) {
      return { success: false, error: "Senha incorreta." };
    }

    // Any other valid email → customer session
    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    persist({ id: `user-${Date.now()}`, name, email: email.toLowerCase(), role: "customer" });
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!name || !email || !password) return { success: false, error: "Preencha todos os campos." };
    if (password.length < 6) return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };

    // TODO: replace with Supabase createUser call
    persist({ id: `user-${Date.now()}`, name: name.trim(), email: email.toLowerCase(), role: "customer" });
    return { success: true };
  }, []);

  const logout = useCallback(() => persist(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

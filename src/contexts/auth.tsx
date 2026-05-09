"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthResult {
  success: boolean;
  error?: string;
  /** Set when signUp succeeds but the project requires email confirmation. */
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (next?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveName(authUser: User, fallback?: string | null): string {
  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [
    fallback,
    typeof meta.full_name === "string" ? meta.full_name : null,
    typeof meta.name === "string" ? meta.name : null,
  ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  if (candidates.length > 0) return candidates[0].trim();
  const local = authUser.email?.split("@")[0] ?? "Cliente";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapAuthError(message: string | undefined): string {
  if (!message) return "Algo deu errado. Tente novamente.";
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("user already registered")) return "Este e-mail já está cadastrado.";
  if (m.includes("password")) return "Senha inválida (mínimo 6 caracteres).";
  return message;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // Build the AuthUser by fetching role/name from profiles (with safe fallbacks).
  // First-time OAuth users may not have a profile yet — best-effort upsert.
  const buildAuthUser = useCallback(
    async (authUser: User): Promise<AuthUser> => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", authUser.id)
        .maybeSingle();

      const resolvedName = deriveName(authUser, profile?.full_name);

      if (!profile) {
        await supabase
          .from("profiles")
          .upsert({ id: authUser.id, full_name: resolvedName }, { onConflict: "id" });
      }

      const role: UserRole = profile?.role === "admin" ? "admin" : "customer";
      return {
        id: authUser.id,
        email: authUser.email ?? "",
        name: resolvedName,
        role,
      };
    },
    [supabase]
  );

  const applySession = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        if (mountedRef.current) setUser(null);
        return;
      }
      const next = await buildAuthUser(session.user);
      if (mountedRef.current) setUser(next);
    },
    [buildAuthUser]
  );

  // Initial hydrate + subscribe to auth state changes
  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      await applySession(data.session);
      if (mountedRef.current) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      mountedRef.current = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, applySession]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!email || !password) return { success: false, error: "Preencha todos os campos." };

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { success: false, error: mapAuthError(error.message) };
      await applySession(data.session);
      return { success: true };
    },
    [supabase, applySession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      if (!name || !email || !password) return { success: false, error: "Preencha todos os campos." };
      if (password.length < 6) return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };

      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: cleanName } },
      });
      if (error) return { success: false, error: mapAuthError(error.message) };

      // Best-effort profile sync. If RLS blocks, user can still sign in;
      // role defaults to customer until an admin promotes them.
      if (data.user) {
        await supabase
          .from("profiles")
          .upsert(
            { id: data.user.id, full_name: cleanName },
            { onConflict: "id" }
          );
      }

      // Email confirmation required → no session returned
      if (!data.session) {
        return { success: true, needsEmailConfirmation: true };
      }

      await applySession(data.session);
      return { success: true };
    },
    [supabase, applySession]
  );

  const loginWithGoogle = useCallback(
    async (next: string = "/"): Promise<AuthResult> => {
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) return { success: false, error: mapAuthError(error.message) };
      // Browser redirects to Google; nothing else to do.
      return { success: true };
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    if (mountedRef.current) setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, loginWithGoogle, logout, isAdmin: user?.role === "admin" }),
    [user, loading, login, register, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

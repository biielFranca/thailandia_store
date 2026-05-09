"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { brand } from "@/themes/thailandia/content/brand";

// ─── Icons ────────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.85 14.11A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.35-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.67-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "login" | "cadastro";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, register, loginWithGoogle, user, isAdmin } = useAuth();

  const initialTab: Tab = params?.get("modo") === "cadastro" ? "cadastro" : "login";
  const [tab, setTab] = useState<Tab>(initialTab);

  // Email / password / name fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace(isAdmin ? "/admin" : "/");
  }, [user, isAdmin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const result =
      tab === "login"
        ? await login(email, password)
        : await register(name, email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Algo deu errado. Tente novamente.");
      return;
    }

    if (result.needsEmailConfirmation) {
      setInfo("Cadastro criado. Confirme seu e-mail para entrar.");
      setTab("login");
      return;
    }

    // redirect handled by the useEffect above
  }

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setInfo("");
    setName("");
    setEmail("");
    setPassword("");
  }

  async function handleGoogle() {
    setError("");
    setInfo("");
    setLoading(true);
    const result = await loginWithGoogle("/");
    if (!result.success) {
      setLoading(false);
      setError(result.error ?? "Não foi possível conectar com o Google.");
    }
    // On success, browser navigates away to Google's consent screen.
  }

  // Surface OAuth callback errors in the URL (?error=oauth_failed)
  useEffect(() => {
    const oauthError = params?.get("error");
    if (oauthError === "oauth_failed") setError("Falha ao entrar com Google. Tente novamente.");
    else if (oauthError === "missing_code") setError("Login com Google não concluído.");
  }, [params]);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Image src={brand.logo.src} alt="" width={32} height={32} className="h-8 w-auto" />
          <span className="font-title text-base text-white" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.6)" }}>
            {brand.name}
          </span>
        </Link>
        <Link href="/" className="text-xs font-medium transition-colors hover:[color:var(--text-primary)]"
          style={{ color: "var(--text-tertiary)" }}>
          ← Voltar à loja
        </Link>
      </nav>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px]">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[12px] border"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--cta)" }}>
              <ShieldIcon />
            </div>
            <h1 className="font-title text-3xl text-white sm:text-4xl">
              {tab === "login" ? "ENTRAR" : "CRIAR CONTA"}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {tab === "login"
                ? "Acesse sua conta para continuar comprando"
                : "Crie sua conta e aproveite a loja completa"}
            </p>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-[16px] border"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>

            {/* Tabs */}
            <div className="grid grid-cols-2 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              {(["login", "cadastro"] as Tab[]).map((t) => (
                <button key={t} type="button" onClick={() => switchTab(t)}
                  className="py-3.5 text-sm font-semibold transition-colors duration-200"
                  style={tab === t
                    ? { color: "var(--text-primary)", borderBottom: "2px solid var(--cta)" }
                    : { color: "var(--text-tertiary)", borderBottom: "2px solid transparent" }}>
                  {t === "login" ? "Login" : "Cadastro"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="flex flex-col gap-4">

                {/* Google OAuth */}
                <button type="button" onClick={handleGoogle} disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[8px] border bg-white text-sm font-semibold text-[#1f1f1f] transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ borderColor: "var(--border-subtle)" }}>
                  <GoogleIcon />
                  Continuar com Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ backgroundColor: "var(--border-subtle)" }} />
                  <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>ou</span>
                  <div className="h-px flex-1" style={{ backgroundColor: "var(--border-subtle)" }} />
                </div>

                {/* Name — cadastro only */}
                {tab === "cadastro" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: "var(--text-tertiary)" }}>
                      Nome completo
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11 rounded-[8px] border bg-transparent px-4 text-sm outline-none transition-colors duration-200 focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                    />
                  </div>
                )}

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-tertiary)" }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-[8px] border bg-transparent px-4 text-sm outline-none transition-colors duration-200 focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: "var(--text-tertiary)" }}>
                      Senha
                    </label>
                    {tab === "login" && (
                      <button type="button" className="text-[11px] transition-colors hover:[color:var(--text-primary)]"
                        style={{ color: "var(--text-tertiary)" }}>
                        Esqueci a senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete={tab === "login" ? "current-password" : "new-password"}
                      placeholder={tab === "cadastro" ? "Mínimo 6 caracteres" : "Sua senha"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 w-full rounded-[8px] border bg-transparent px-4 pr-10 text-sm outline-none transition-colors duration-200 focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:[color:var(--text-primary)]"
                      style={{ color: "var(--text-tertiary)" }}
                      aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {tab === "cadastro" && (
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      Mínimo de 6 caracteres
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-[8px] border px-4 py-3 text-sm"
                    style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
                    {error}
                  </div>
                )}

                {/* Info */}
                {info && (
                  <div className="rounded-[8px] border px-4 py-3 text-sm"
                    style={{ borderColor: "rgba(30,107,255,0.4)", backgroundColor: "rgba(30,107,255,0.08)", color: "var(--cta)" }}>
                    {info}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="mt-1 flex h-11 w-full items-center justify-center rounded-[8px] text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                  {loading ? "Aguarde..." : tab === "login" ? "Entrar na conta" : "Criar minha conta"}
                </button>
              </div>

              {/* Switch tab */}
              <p className="mt-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                {tab === "login" ? "Não tem conta? " : "Já tem conta? "}
                <button type="button" onClick={() => switchTab(tab === "login" ? "cadastro" : "login")}
                  className="font-semibold transition-colors hover:[color:var(--cta)]"
                  style={{ color: "var(--text-secondary)" }}>
                  {tab === "login" ? "Criar agora" : "Fazer login"}
                </button>
              </p>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthProvider>
  );
}

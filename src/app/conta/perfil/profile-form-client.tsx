"use client";

import { useActionState } from "react";
import { updateProfile, updatePassword } from "./actions";
import type { UpdateProfileResult, UpdatePasswordResult } from "./actions";

function formatMemberSince(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

const profileInitial = { success: false, error: "" } as UpdateProfileResult;
const passwordInitial = { success: false, error: "" } as UpdatePasswordResult;

interface Props {
  initialName: string;
  initialPhone: string;
  email: string;
  memberSince: string | null;
}

export function ProfileFormClient({ initialName, initialPhone, email, memberSince }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, profileInitial);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, passwordInitial);

  return (
    <div className="flex flex-col gap-5">
      {/* Profile info */}
      <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
          Dados pessoais
        </h2>

        <form action={profileAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
              Nome completo
            </label>
            <input
              name="full_name"
              type="text"
              defaultValue={initialName}
              required
              minLength={2}
              className="w-full rounded-[8px] border px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)]"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-[8px] border px-3 py-2.5 text-sm opacity-50 cursor-not-allowed"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)", color: "var(--text-secondary)" }}
            />
            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              O e-mail não pode ser alterado aqui.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
              Telefone
            </label>
            <input
              name="phone"
              type="tel"
              defaultValue={initialPhone}
              placeholder="(11) 99999-9999"
              className="w-full rounded-[8px] border px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)]"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
            />
          </div>

          {!profileState.success && 'error' in profileState && profileState.error && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>{profileState.error}</p>
          )}
          {profileState.success && (
            <p className="text-xs" style={{ color: "var(--success)" }}>Perfil atualizado com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="w-full rounded-[8px] py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
            {profilePending ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>

        {memberSince && (
          <p className="mt-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Cliente desde {formatMemberSince(memberSince)}.
          </p>
        )}
      </div>

      {/* Change password */}
      <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
          Alterar senha
        </h2>

        <form action={passwordAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
              Nova senha
            </label>
            <input
              name="password"
              type="password"
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-[8px] border px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)]"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
              Confirmar nova senha
            </label>
            <input
              name="confirm"
              type="password"
              placeholder="Repita a senha"
              className="w-full rounded-[8px] border px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)]"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
            />
          </div>

          {!passwordState.success && 'error' in passwordState && passwordState.error && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>{passwordState.error}</p>
          )}
          {passwordState.success && (
            <p className="text-xs" style={{ color: "var(--success)" }}>Senha alterada com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="w-full rounded-[8px] py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}>
            {passwordPending ? "Alterando..." : "Alterar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import { updateProfile, updatePassword, saveAddress, deleteAddress } from "./actions";
import type { UpdateProfileResult, UpdatePasswordResult, AddressResult, AddressInput } from "./actions";

function formatMemberSince(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const profileInitial = { success: false, error: "" } as UpdateProfileResult;
const passwordInitial = { success: false, error: "" } as UpdatePasswordResult;

export interface SavedAddress {
  id: string;
  label: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

interface Props {
  initialName: string;
  initialPhone: string;
  email: string;
  memberSince: string | null;
  savedAddress: SavedAddress | null;
}

// ─── Field + label helpers ────────────────────────────────────────────────────

const inp = "w-full rounded-[8px] border px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)] bg-transparent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Address form ─────────────────────────────────────────────────────────────

function AddressForm({ initial, onSaved }: { initial: SavedAddress | null; onSaved: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [form, setForm] = useState<AddressInput & { cepDisplay: string }>({
    label: initial?.label ?? "Casa",
    cep: initial?.zip_code ?? "",
    cepDisplay: initial?.zip_code ?? "",
    street: initial?.street ?? "",
    number: initial?.number ?? "",
    complement: initial?.complement ?? "",
    neighborhood: initial?.neighborhood ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
  }

  async function handleCepChange(raw: string) {
    const masked = maskCep(raw);
    set("cepDisplay", masked);
    set("cep", masked);
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json() as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
        }));
      }
    } catch { /* ignore */ } finally {
      setCepLoading(false);
    }
  }

  function handleSubmit() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res: AddressResult = await saveAddress({
        label: form.label,
        cep: form.cep,
        street: form.street,
        number: form.number,
        complement: form.complement,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
      });
      if (!res.success) { setError(res.error); return; }
      setSuccess(true);
      onSaved();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Apelido do endereço">
            <input
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="Casa, Trabalho..."
              className={inp}
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </Field>
        </div>

        <Field label="CEP">
          <div className="relative">
            <input
              value={form.cepDisplay}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              inputMode="numeric"
              className={inp}
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
            {cepLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                buscando...
              </span>
            )}
          </div>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Logradouro">
            <input
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
              placeholder="Rua, Avenida..."
              className={inp}
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </Field>
        </div>

        <Field label="Número">
          <input
            value={form.number}
            onChange={(e) => set("number", e.target.value)}
            placeholder="123"
            className={inp}
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          />
        </Field>

        <Field label="Complemento">
          <input
            value={form.complement}
            onChange={(e) => set("complement", e.target.value)}
            placeholder="Apto, Bloco..."
            className={inp}
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          />
        </Field>

        <Field label="Bairro">
          <input
            value={form.neighborhood}
            onChange={(e) => set("neighborhood", e.target.value)}
            placeholder="Bairro"
            className={inp}
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          />
        </Field>

        <Field label="Cidade">
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="São Paulo"
            className={inp}
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          />
        </Field>

        <Field label="Estado">
          <select
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            className={`${inp} appearance-none`}
            style={{ borderColor: "var(--border-subtle)", color: form.state ? "var(--text-primary)" : "var(--text-tertiary)", backgroundColor: "var(--surface-2)" }}
          >
            <option value="">Selecione</option>
            {BR_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </Field>
      </div>

      {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
      {success && <p className="text-xs" style={{ color: "var(--success)" }}>Endereço salvo!</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="w-full rounded-[8px] py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
      >
        {pending ? "Salvando..." : "Salvar endereço"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfileFormClient({ initialName, initialPhone, email, memberSince, savedAddress }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, profileInitial);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, passwordInitial);
  const [deletePending, startDelete] = useTransition();
  const [hasAddress, setHasAddress] = useState(!!savedAddress);

  function handleDeleteAddress(id: string) {
    startDelete(async () => {
      await deleteAddress(id);
      setHasAddress(false);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Dados pessoais */}
      <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
          Dados pessoais
        </h2>
        <form action={profileAction} className="flex flex-col gap-4">
          <Field label="Nome completo">
            <input
              name="full_name"
              type="text"
              defaultValue={initialName}
              required
              minLength={2}
              className={inp}
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              value={email}
              disabled
              className={`${inp} opacity-50 cursor-not-allowed`}
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
            />
            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>O e-mail não pode ser alterado aqui.</p>
          </Field>

          <Field label="Telefone">
            <input
              name="phone"
              type="tel"
              defaultValue={initialPhone}
              placeholder="(11) 99999-9999"
              onChange={(e) => { e.target.value = maskPhone(e.target.value); }}
              className={inp}
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </Field>

          {!profileState.success && "error" in profileState && profileState.error && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>{profileState.error}</p>
          )}
          {profileState.success && (
            <p className="text-xs" style={{ color: "var(--success)" }}>Perfil atualizado com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="w-full rounded-[8px] py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
          >
            {profilePending ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>

        {memberSince && (
          <p className="mt-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Cliente desde {formatMemberSince(memberSince)}.
          </p>
        )}
      </div>

      {/* Endereço de entrega */}
      <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
            Endereço de entrega padrão
          </h2>
          {hasAddress && savedAddress && (
            <button
              type="button"
              onClick={() => handleDeleteAddress(savedAddress.id)}
              disabled={deletePending}
              className="text-[11px] transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ color: "var(--danger)" }}
            >
              {deletePending ? "Removendo..." : "Remover"}
            </button>
          )}
        </div>

        {!hasAddress && (
          <p className="mb-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Salve um endereço para pré-preencher automaticamente o checkout nas próximas compras.
          </p>
        )}

        <AddressForm
          initial={hasAddress ? savedAddress : null}
          onSaved={() => setHasAddress(true)}
        />
      </div>

      {/* Alterar senha */}
      <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
          Alterar senha
        </h2>
        <form action={passwordAction} className="flex flex-col gap-4">
          <Field label="Nova senha">
            <input
              name="password"
              type="password"
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className={inp}
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </Field>

          <Field label="Confirmar nova senha">
            <input
              name="confirm"
              type="password"
              placeholder="Repita a senha"
              className={inp}
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </Field>

          {!passwordState.success && "error" in passwordState && passwordState.error && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>{passwordState.error}</p>
          )}
          {passwordState.success && (
            <p className="text-xs" style={{ color: "var(--success)" }}>Senha alterada com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="w-full rounded-[8px] py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
          >
            {passwordPending ? "Alterando..." : "Alterar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";

// ─── Address ──────────────────────────────────────────────────────────────────

export interface AddressInput {
  label: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type AddressResult = { success: true } | { success: false; error: string };

export async function saveAddress(input: AddressInput): Promise<AddressResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const cep = input.cep.replace(/\D/g, "");
  if (cep.length !== 8) return { success: false, error: "CEP inválido." };
  if (!input.street.trim()) return { success: false, error: "Informe o logradouro." };
  if (!input.number.trim()) return { success: false, error: "Informe o número." };
  if (!input.city.trim()) return { success: false, error: "Informe a cidade." };
  if (!input.state) return { success: false, error: "Informe o estado." };

  const supabase = await createClient();

  // Check if user already has a default address to update
  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("profile_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("addresses")
      .update({
        label: input.label.trim() || "Casa",
        zip_code: `${cep.slice(0, 5)}-${cep.slice(5)}`,
        street: input.street.trim(),
        number: input.number.trim(),
        complement: input.complement?.trim() || null,
        neighborhood: input.neighborhood.trim(),
        city: input.city.trim(),
        state: input.state.trim().toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) return { success: false, error: "Erro ao salvar endereço." };
  } else {
    const { error } = await supabase.from("addresses").insert({
      profile_id: user.id,
      label: input.label.trim() || "Casa",
      zip_code: `${cep.slice(0, 5)}-${cep.slice(5)}`,
      street: input.street.trim(),
      number: input.number.trim(),
      complement: input.complement?.trim() || null,
      neighborhood: input.neighborhood.trim(),
      city: input.city.trim(),
      state: input.state.trim().toUpperCase(),
      country: "BR",
      is_default: true,
    });
    if (error) return { success: false, error: "Erro ao salvar endereço." };
  }

  revalidatePath("/conta/perfil");
  return { success: true };
}

export async function deleteAddress(id: string): Promise<AddressResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) return { success: false, error: "Erro ao excluir endereço." };
  revalidatePath("/conta/perfil");
  return { success: true };
}

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfile(_prev: UpdateProfileResult, formData: FormData): Promise<UpdateProfileResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const full_name = (formData.get("full_name") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim() || null;

  if (!full_name || full_name.length < 2) {
    return { success: false, error: "Nome deve ter pelo menos 2 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { success: false, error: "Erro ao salvar perfil." };

  revalidatePath("/conta");
  revalidatePath("/conta/perfil");
  return { success: true };
}

export type UpdatePasswordResult =
  | { success: true }
  | { success: false; error: string };

export async function updatePassword(_prev: UpdatePasswordResult, formData: FormData): Promise<UpdatePasswordResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const password = (formData.get("password") as string | null)?.trim();
  const confirm = (formData.get("confirm") as string | null)?.trim();

  if (!password || password.length < 8) {
    return { success: false, error: "Senha deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { success: false, error: "Senhas não conferem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, error: "Erro ao atualizar senha." };

  return { success: true };
}

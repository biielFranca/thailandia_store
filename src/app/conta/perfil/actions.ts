"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";

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

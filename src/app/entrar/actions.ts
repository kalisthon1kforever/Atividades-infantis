"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { adminGetUser, adminUpdateUser, verifyPassword } from "@/lib/supabase/service";

export type AuthActionState = { error?: string; message?: string };

function friendlyAuthError(code: unknown): string {
  const raw = typeof code === "string" ? code.toLowerCase() : "";
  if (raw.includes("invalid_credentials")) {
    return "E-mail ou senha não conferem. Use o e-mail que recebeu e a senha temporária que começa com “Pp”.";
  }
  if (raw.includes("email_not_confirmed")) {
    return "Este e-mail ainda não foi confirmado. Fala com a gente em contato para ativar, ou tente acessar pelo link que você recebeu.";
  }
  if (raw.includes("too_many")) {
    return "Muitas tentativas seguidas. Respira um minutinho e tenta de novo. 💙";
  }
  return "Não conseguimos entrar agora. Confira o e-mail e a senha, ou solicite um novo link em “Esqueci minha senha”.";
}

export async function signInAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "");

  if (!email || !email.includes("@")) {
    return { error: "Digite um e-mail válido para entrar." };
  }
  if (!password) {
    return { error: "Digite sua senha (ela chegou no e-mail de acesso)." };
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  const meta = ((data.user?.app_metadata ?? {}) as Record<string, unknown>).must_change_password;
  if (meta === true) {
    redirect("/entrar/nova-senha");
  }
  const safe = nextPath.startsWith("/") && !nextPath.startsWith("/entrar") ? nextPath : "";
  redirect(safe || "/app");
}

export async function forgotPasswordAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Digite o e-mail da conta para receber o link de nova senha." };
  }
  const supabase = await createSupabaseServer();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectTo = `${origin}/entrar/callback?next=/entrar/nova-senha`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    return { error: friendlyAuthError(error.message) };
  }
  return { message: "Se existir uma conta com este e-mail, enviamos um link para criar uma senha nova. Olha a caixa de entrada e a de promoções. 💛" };
}

/** Troca de senha: sessão válida + (senha atual quando a troca não é obrigatória) */
export async function updatePasswordAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sessão expirada. Entre de novo com o link do e-mail." };
  }

  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const mustChange = ((user.app_metadata ?? {}) as Record<string, unknown>).must_change_password === true;

  if (password.length < 8) {
    return { error: "A senha nova precisa ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "A confirmação não ficou igual à senha nova. Confere e tenta de novo. 💙" };
  }

  if (!mustChange) {
    if (!current) {
      return { error: "Digite sua senha atual para autorizar a troca." };
    }
    const check = await verifyPassword(user.email ?? "", current);
    if (!check.ok) {
      return { error: "A senha atual não conferiu. Tenta de novo, com calma." };
    }
  } else if (current && current === password) {
    return { error: "A senha nova não pode ser igual à temporária. Escolha outra, só de vocês." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  // libera o acesso completo: app_metadata.must_change_password = false (servidor apens)
  const existing = await adminGetUser(user.id);
  const currentMeta =
    existing.ok && existing.data?.app_metadata ? existing.data.app_metadata : user.app_metadata ?? {};
  await adminUpdateUser(user.id, {
    app_metadata: { ...(currentMeta as Record<string, unknown>), must_change_password: false },
  });

  if (mustChange) {
    redirect("/app");
  }
  return { message: "Senha nova guardada com carinho. Pronto! 🎉" };
}

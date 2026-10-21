"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saoPauloDate } from "@/lib/area";
import { createSupabaseServer } from "@/lib/supabase/server";

export type AppActionResult = { ok?: boolean; error?: string; message?: string; stars?: number; favorito?: boolean };

async function requireUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

/** Botão “Fizemos juntos hoje” — +1 estrela, sem trancar a tela */
export async function markDoneAction(activityId: string): Promise<AppActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "Sessão expirada." };
  const { error } = await supabase
    .from("activity_progress")
    .upsert(
      { user_id: userId, activity_id: activityId, log_date: saoPauloDate() },
      { onConflict: "user_id,activity_id,log_date" },
    );
  if (error) return { error: "Não conseguimos marcar agora. Tenta de novo em instantes." };

  const { count } = await supabase
    .from("activity_progress")
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", userId);
  revalidatePath("/app");
  revalidatePath("/app/biblioteca");
  revalidatePath("/app/conquistas");
  revalidatePath(`/app/atividade/${activityId}`);
  return { ok: true, message: "Hoje vocês fizeram juntos — que momento bom! 💛", stars: count ?? 0 };
}

export async function toggleFavoriteAction(activityId: string, favorito: boolean): Promise<AppActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "Sessão expirada." };
  if (favorito) {
    const { error } = await supabase
      .from("favorites")
      .upsert({ user_id: userId, activity_id: activityId }, { onConflict: "user_id,activity_id" });
    if (error) return { error: "Não deu para guardar o favorito agora." };
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("activity_id", activityId);
    if (error) return { error: "Não deu para remover o favorito agora." };
  }
  revalidatePath("/app/biblioteca");
  revalidatePath(`/app/atividade/${activityId}`);
  return { ok: true, favorito };
}

export async function saveChildAction(_prev: unknown, formData: FormData): Promise<AppActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "Sessão expirada." };
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const age = Number(formData.get("age") ?? 5);
  if (!name) return { error: "Dê um nome para a criança, mesmo que seja apelido." };
  if (!Number.isInteger(age) || age < 1 || age > 10) {
    return { error: "A idade aproximada fica entre 1 e 10 anos." };
  }
  if (id) {
    const { error } = await supabase
      .from("children")
      .update({ name, age })
      .eq("user_id", userId)
      .eq("id", id);
    if (error) return { error: "Não deu para salvar agora." };
  } else {
    const { count } = await supabase
      .from("children")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= 3) {
      return { error: "Por enquanto, dá para acompanhar até 3 crianças. Deixe as memórias bem guardadas. 💙" };
    }
    const { error } = await supabase.from("children").insert({ user_id: userId, name, age });
    if (error) return { error: "Não deu para salvar agora." };
  }
  revalidatePath("/app/crianca");
  revalidatePath("/app");
  return { ok: true, message: "Guardado com carinho! 💛" };
}

export async function deleteChildAction(id: string): Promise<void> {
  const { supabase, userId } = await requireUser();
  if (!userId) return;
  await supabase.from("children").delete().eq("user_id", userId).eq("id", id);
  revalidatePath("/app/crianca");
  revalidatePath("/app");
}

/** Fecha o dia da trilha: Trilha (guia-30-dias) + progresso da ficha sugerida */
export async function completeTrailDayAction(day: number, activityId: string): Promise<AppActionResult> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "Sessão expirada." };
  if (day < 1 || day > 30 || !activityId) return { error: "Dia inválido." };

  const { error } = await supabase
    .from("trail_days")
    .upsert(
      { user_id: userId, day, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "user_id,day" },
    );
  if (error) return { error: "Não conseguimos fechar o dia agora." };

  await supabase
    .from("activity_progress")
    .upsert(
      { user_id: userId, activity_id: activityId, log_date: saoPauloDate() },
      { onConflict: "user_id,activity_id,log_date" },
    );

  revalidatePath("/app/trilha-30-dias");
  revalidatePath("/app");
  revalidatePath("/app/conquistas");
  return { ok: true, message: `Dia ${day} fechado! Vocês estão indo lindo(a). 💛` };
}

export async function signOutAction() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/entrar");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deliverPurchase } from "@/lib/access-delivery";
import { getAreaUser } from "@/lib/area";
import { buildOrder, orderTotal, type CheckoutProduct } from "@/lib/checkout-catalog";
import { paidEmailHtml, sendEmail } from "@/lib/emails";
import { productLabel } from "@/lib/products";
import {
  adminGetUser,
  adminUpdateUser,
  serviceFetch,
  serviceRpc,
  tempPassword,
} from "@/lib/supabase/service";

export type AdminActionResult = { ok?: boolean; error?: string; message?: string };

async function requireAdmin() {
  const user = await getAreaUser();
  if (!user || user.role !== "admin") {
    throw new Error("Acesso restrito ao papel admin.");
  }
  return user;
}

export async function grantProductAction(email: string, product: string): Promise<AdminActionResult> {
  await requireAdmin();
  const res = await serviceRpc<string>("app_grant_entitlement", {
    p_email: email,
    p_product: product,
    p_source: "admin",
  });
  if (!res.ok || !res.data) {
    return { error: "Não encontrei conta com esse e-mail no Supabase Auth (ou falhou a gravação)." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/pessoas");
  return { ok: true, message: `Liberado: ${productLabel(product)} para ${email}.` };
}

export async function revokeProductAction(email: string, product: string): Promise<AdminActionResult> {
  await requireAdmin();
  const res = await serviceRpc("app_revoke_entitlement", { p_email: email, p_product: product });
  if (!res.ok) return { error: `Não deu para revogar agora (${res.error ?? res.status}).` };
  revalidatePath("/admin");
  revalidatePath("/admin/pessoas");
  return { ok: true, message: `Revogado: ${productLabel(product)} de ${email}.` };
}

export async function markMustChangeAction(email: string, value: boolean): Promise<AdminActionResult> {
  await requireAdmin();
  const res = await serviceRpc("app_set_must_change", { p_email: email, p_value: value });
  if (!res.ok) return { error: "Não conseguimos marcar a troca de senha agora." };
  revalidatePath("/admin/pessoas");
  return { ok: true, message: value ? "A pessoa vai precisar trocar a senha no próximo acesso." : "Troca de senha liberada (não obrigatória)." };
}

/** Reenvia o e-mail de acesso: nova senha temporária, marca troca e dispara o template festivo */
export async function resendAccessAction(email: string, name: string): Promise<AdminActionResult> {
  await requireAdmin();
  const res = await serviceRpc<string | null>("app_find_user_id", { p_email: email });
  if (!res.ok || !res.data) return { error: "Sem conta para este e-mail." };
  const uid = res.data;

  const current = await adminGetUser(uid);
  const meta = current.ok && current.data?.app_metadata ? current.data.app_metadata : {};
  const fresh = tempPassword();
  const upd = await adminUpdateUser(uid, {
    password: fresh,
    app_metadata: { ...meta, must_change_password: true },
  });
  if (!upd.ok) return { error: `Falha ao trocar a senha no Supabase (${upd.error ?? upd.status}).` };

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const html = paidEmailHtml({
    name,
    email,
    password: fresh,
    loginUrl: `${origin}/entrar`,
    productLabel: "acesso do app Pequenos Passos",
  });
  const mail = await sendEmail({
    to: email,
    subject: "Chegou o acesso do app Pequenos Passos 🎉 (senha nova temporária)",
    html,
  });
  if (!mail.sent) {
    return { ok: true, message: `Senha trocada, mas o e-mail NÃO foi enviado (${mail.reason ?? "sem motivo reportado"}). Informe a senha por outro canal com cuidado.` };
  }
  revalidatePath("/admin/pessoas");
  return { ok: true, message: "E-mail de acesso reenviado com senha temporária nova. A senha não aparece aqui. 🎉" };
}

export async function simulatePurchaseAction(input: {
  email: string;
  name: string;
  product: CheckoutProduct;
  bumps: string[];
  combo: boolean;
}): Promise<AdminActionResult> {
  await requireAdmin();
  const product: CheckoutProduct = input.product === "acesso-total" ? "acesso-total" : "kit-inicial";
  const bumps = input.combo ? [] : input.bumps;
  const stamp = Date.now().toString();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const result = await deliverPurchase({
    email: input.email.trim().toLowerCase(),
    name: input.name.trim() || input.email,
    paymentId: `sim-${stamp}`,
    product,
    bumps,
    combo: input.combo,
    total: orderTotal(buildOrder(product, bumps, input.combo)),
    origem: "simulado",
    source: `simulado-admin:${stamp}`,
    origin,
  });
  if (!result.ok) return { error: "Não deu para simular a compra agora. Confira se o SQL da área logada já rodou." };
  revalidatePath("/admin");
  revalidatePath("/admin/pessoas");
  revalidatePath("/admin/compras");
  return {
    ok: true,
    message: result.already
      ? "Esse pedido já estava registrado. A senha não foi gerada de novo."
      : "Compra simulada. A senha temporária foi só para o e-mail, sem cobrar nada.",
  };
}

export async function addNoteAction(email: string, userId: string, note: string): Promise<AdminActionResult> {
  await requireAdmin();
  const clean = note.trim();
  if (!clean) return { error: "Escreva o comentário interno antes de salvar." };
  const res = await serviceFetch("/rest/v1/admin_notes", {
    method: "POST",
    body: { user_id: userId || null, email, note: clean.slice(0, 800) },
  });
  if (!res.ok) return { error: `Não deu para salvar a nota (${res.error ?? res.status}).` };
  revalidatePath(`/admin/pessoas/${userId}`);
  return { ok: true, message: "Comentário interno guardado." };
}

export async function publishActivityAction(id: string, publish: boolean): Promise<void> {
  await requireAdmin();
  await serviceFetch(`/rest/v1/activities?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { is_published: publish },
  });
  revalidatePath("/admin/catalogo");
  revalidatePath("/app/biblioteca");
}

export async function saveActivityAction(_prev: unknown, formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const durationMin = Number(formData.get("duration_min") ?? 10);
  const ageMin = Number(formData.get("age_min") ?? 3);
  const ageMax = Number(formData.get("age_max") ?? 8);
  const format = String(formData.get("format") ?? "imprimir");
  const bw = String(formData.get("bw") ?? "true") === "true";
  const audience = String(formData.get("audience") ?? "familia");
  const productKey = String(formData.get("product_key") ?? "kit-inicial");
  const isPublished = String(formData.get("is_published") ?? "true") === "true";
  const tagsRaw = String(formData.get("tags") ?? "");
  const dataRaw = String(formData.get("data") ?? "{}").trim();

  if (!id || !title || !category) {
    return { error: "Preencha id, título e categoria (são as chaves da ficha)." };
  }
  let tags: string[] = [];
  try {
    tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  } catch {
    tags = [];
  }
  let data: unknown;
  try {
    data = JSON.parse(dataRaw || "{}");
  } catch {
    return { error: "O campo “conteúdo” precisa ser JSON válido (dá para conferir com qualquer validador)." };
  }
  if (![5, 10, 15].includes(durationMin)) {
    return { error: "A duração precisa ser 5, 10 ou 15 minutos." };
  }
  if (!["imprimir", "tela", "ambos"].includes(format)) {
    return { error: "Formato: imprimir | tela | ambos." };
  }
  if (!["familia", "professor"].includes(audience)) {
    return { error: "Público: familia | professor." };
  }

  const payload = {
    id,
    title,
    summary,
    category,
    duration_min: durationMin,
    age_min: ageMin,
    age_max: ageMax,
    format,
    bw,
    audience,
    product_key: productKey,
    tags,
    data,
    is_published: isPublished,
  };

  const exists = await serviceFetch<unknown[]>(`/rest/v1/activities?id=eq.${encodeURIComponent(id)}&select=id`);
  const existsRows = exists.ok && Array.isArray(exists.data) ? exists.data.length : 0;

  const res = existsRows > 0
    ? await serviceFetch(`/rest/v1/activities?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: payload,
      })
    : await serviceFetch("/rest/v1/activities", { method: "POST", body: payload });
  if (!res.ok) {
    return { error: `Não salvei a atividade (${res.error ?? res.status}).` };
  }
  revalidatePath("/admin/catalogo");
  revalidatePath("/app/biblioteca");
  return { ok: true, message: `Atividade “${title}” salva.` };
}

export async function adminNoop(): Promise<void> {
  redirect("/admin");
}

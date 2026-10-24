import { sequenciaEmailHtml } from "./emails-funil";
import type { MetaLead, PilarId } from "./modelo";
import { sendEmail } from "@/lib/emails";
import { serviceFetch } from "@/lib/supabase/service";

type Lead = {
  id: string;
  email: string;
  created_at?: string;
  converted?: boolean;
  answers?: { meta?: MetaLead; pilar?: { key?: string } };
};

const DAY = 24 * 60 * 60 * 1000;

function pilarDeLead(lead: Lead): PilarId {
  const key = lead.answers?.meta?.pillar || lead.answers?.pilar?.key;
  if (key === "ler" || key === "contar" || key === "sentir" || key === "organizar" || key === "criar") return key;
  return "organizar";
}

async function patch(lead: Lead, meta: MetaLead) {
  await serviceFetch(`/rest/v1/leads?id=eq.${lead.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: { answers: { ...(lead.answers ?? {}), meta } },
  });
}

export async function enviarSequencia(origin: string) {
  const found = await serviceFetch<Lead[]>("/rest/v1/leads", {
    searchParams: { select: "id,email,created_at,converted,answers", order: "created_at.desc", limit: "500" },
  });
  if (!found.ok || !Array.isArray(found.data)) return { ok: false as const, sent: 0 };
  const now = Date.now();
  let sent = 0;

  for (const lead of found.data) {
    const meta: MetaLead = { ...(lead.answers?.meta ?? {}) };
    if (meta.optOut || !lead.email || !lead.created_at) continue;
    const age = now - new Date(lead.created_at).getTime();
    const emails = new Set(meta.emailsSent ?? []);
    const converted = lead.converted === true;
    const pilar = pilarDeLead(lead);
    const offerUrl = `${origin.replace(/\/$/, "")}/acesso?email=${encodeURIComponent(lead.email)}`;

    const due: Array<2 | 3 | 4 | 5> = [];
    if (age >= 2 * DAY && !emails.has(2)) due.push(2);
    if (!converted && age >= 4 * DAY && !emails.has(3)) due.push(3);
    if (!converted && age >= 6 * DAY && !emails.has(4)) due.push(4);
    const weeklyCount = meta.weeklyCount ?? 0;
    const weeklyAt = meta.weeklyAt ? new Date(meta.weeklyAt).getTime() : 0;
    if (!converted && age >= 10 * DAY && weeklyCount < 12 && (!weeklyAt || now - weeklyAt >= 7 * DAY)) due.push(5);
    if (due.length === 0) continue;

    const step = due[0];
    const message = sequenciaEmailHtml({ step, origin, email: lead.email, pillar: pilar, offerUrl });
    const mail = await sendEmail({ to: lead.email, subject: message.subject, html: message.html });
    if (!mail.sent) continue;
    if (step === 5) {
      meta.weeklyAt = new Date().toISOString();
      meta.weeklyCount = weeklyCount + 1;
    } else {
      emails.add(step);
      meta.emailsSent = Array.from(emails);
    }
    lead.answers = { ...(lead.answers ?? {}), meta };
    await patch(lead, meta);
    sent += 1;
  }

  return { ok: true as const, sent };
}

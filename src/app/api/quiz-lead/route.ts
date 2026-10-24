import { NextResponse } from "next/server";
import { pilarDe, type MetaLead, type PilarId, type Respostas } from "@/lib/funil/modelo";
import { brindeEmailHtml } from "@/lib/funil/emails-funil";
import { signGift, signSair } from "@/lib/funil/token";
import { sendEmail } from "@/lib/emails";
import { serviceFetch } from "@/lib/supabase/service";

function originFrom(request: Request) {
  const header = request.headers.get("origin");
  if (header) return header;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

const PILARES = new Set(["ler", "contar", "sentir", "organizar", "criar"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const name = String(body.name || "").trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  const answers = (body.answers ?? {}) as Respostas & { meta?: MetaLead; pilar?: { key: string; label: string } };
  const existing = await serviceFetch<Array<{ answers?: { meta?: MetaLead } }>>("/rest/v1/leads", {
    searchParams: { select: "answers", email_lower: `eq.${email}`, limit: "1" },
  });
  const previous = existing.ok && Array.isArray(existing.data) ? existing.data[0]?.answers?.meta : undefined;
  const pillarRaw = String(body.pillar || answers.pilar?.key || answers.meta?.pillar || "organizar");
  const pillar = (PILARES.has(pillarRaw) ? pillarRaw : "organizar") as PilarId;
  const age = String(body.age || answers.meta?.age || answers.q1?.key || "");
  const childName = String(body.childName || answers.meta?.childName || "").trim();
  const updateOnly = Boolean(body.updateOnly);

  const origin = originFrom(request);
  const token = signGift({ email, pillar, age });
  const pdfUrl = `${origin}/api/funil/brinde?t=${encodeURIComponent(token)}`;
  const pilar = pilarDe(pillar);
  const storedAnswers = {
    ...answers,
    pilar: { key: pillar, label: pilar.nome },
    meta: {
      ...(previous ?? {}),
      ...(answers.meta ?? {}),
      pillar,
      age,
      childName,
      emailsSent: updateOnly ? previous?.emailsSent ?? answers.meta?.emailsSent ?? [1] : [1],
    },
  };

  try {
    await serviceFetch("/rest/v1/leads", {
      method: "POST",
      body: {
        email,
        name: name || childName,
        channel: "email",
        answers: storedAnswers,
        sample_url: pdfUrl,
      },
      headers: { Prefer: "resolution=merge-duplicates" },
    });
  } catch (persistError) {
    console.error("[quiz-lead] persistência falhou", persistError);
  }

  if (updateOnly) {
    return NextResponse.json({ ok: true, token, pdfUrl, emailSent: false, updateOnly: true });
  }

  const mail = await sendEmail({
    to: email,
    subject: "Seus 10 contos para dormir estão prontos",
    html: brindeEmailHtml({
      pdfUrl,
      offerUrl: `${origin}/oferta`,
      email,
      origin,
      name: name || childName,
    }),
  });

  const webhook = process.env.QUIZ_LEAD_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pillar, age, childName, pdfUrl, sair: signSair(email) }),
      });
    } catch (error) {
      console.error("[quiz-lead] webhook failed", error);
    }
  }

  return NextResponse.json({
    ok: true,
    token,
    pdfUrl,
    emailSent: mail.sent,
    emailReason: mail.sent ? null : mail.reason,
  });
}

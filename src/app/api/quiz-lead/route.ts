import { NextResponse } from "next/server";
import { sampleEmailHtml, sendEmail } from "@/lib/emails";
import { serviceFetch, serviceRpc } from "@/lib/supabase/service";

function originFrom(request: Request) {
  const header = request.headers.get("origin");
  if (header) return header;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

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

  const origin = originFrom(request);
  const sampleUrl =
    String(body.sampleUrl || "") ||
    `${origin}/qz/amostra?nome=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;

  // 1) persiste o lead no Supabase (idempotente por e-mail) — falhas não bloqueiam o e-mail
  try {
    await serviceFetch("/rest/v1/leads", {
      method: "POST",
      body: {
        email,
        name,
        channel: String(body.channel || "email"),
        answers: body.answers ?? {},
        sample_url: sampleUrl,
      },
      headers: { Prefer: "resolution=merge-duplicates" },
    });
  } catch (persistError) {
    console.error("[quiz-lead] persistência falhou", persistError);
  }

  // 2) se este e-mail já tem conta no Auth, garante o entitlement da amostra
  try {
    await serviceRpc("app_grant_entitlement", { p_email: email, p_product: "amostra", p_source: "quiz-capture" });
  } catch {
    /* silencioso */
  }

  // 3) e-mail da amostra (fluxo original, mantido)
  const mail = await sendEmail({
    to: email,
    subject: "Que alegria! A amostra do seu pequeno chegou 💛",
    html: sampleEmailHtml({
      name,
      sampleUrl,
      offerUrl: `${origin}/qz`,
    }),
  });

  const webhook = process.env.QUIZ_LEAD_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, email, name, sampleUrl }),
      });
    } catch (error) {
      console.error("[quiz-lead] webhook failed", error);
    }
  }

  return NextResponse.json({
    ok: true,
    via: "email",
    persisted: true,
    emailSent: mail.sent,
    emailReason: mail.sent ? null : mail.reason,
  });
}

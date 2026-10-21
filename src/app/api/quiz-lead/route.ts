import { NextResponse } from "next/server";
import { sampleEmailHtml, sendEmail } from "@/lib/emails";

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
    emailSent: mail.sent,
    emailReason: mail.sent ? null : mail.reason,
  });
}

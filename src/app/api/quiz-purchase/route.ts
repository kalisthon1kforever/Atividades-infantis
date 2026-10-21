import { NextResponse } from "next/server";
import { createAppAccess } from "@/lib/access-account";
import { paidEmailHtml, sendEmail } from "@/lib/emails";

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
  const product = body.product === "acesso-total" ? "acesso-total" : "kit-inicial";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  const access = await createAppAccess(email, name);
  const origin = originFrom(request);
  const productLabel = product === "acesso-total" ? "Acesso Total" : "Kit Inicial";
  const html = paidEmailHtml({
    name,
    email,
    password: access.password,
    loginUrl: `${origin}/qz`,
    productLabel,
  });

  const mail = await sendEmail({
    to: email,
    subject: `Parabéns! Que vocês aproveitem cada momento juntos 🎉`,
    html,
  });

  return NextResponse.json({
    ok: true,
    email,
    password: access.password,
    accountCreated: access.created,
    emailSent: mail.sent,
  });
}

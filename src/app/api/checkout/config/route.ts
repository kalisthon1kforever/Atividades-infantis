import { NextResponse } from "next/server";

export async function GET() {
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY?.trim() || "";
  if (!publicKey.startsWith("APP_USR-") && !publicKey.startsWith("TEST-")) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  return NextResponse.json({ ok: true, publicKey });
}

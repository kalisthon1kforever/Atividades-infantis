import { NextResponse } from "next/server";
import { enviarSequencia } from "@/lib/funil/sequencia";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization") || "";
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const result = await enviarSequencia(origin);
  return NextResponse.json(result);
}

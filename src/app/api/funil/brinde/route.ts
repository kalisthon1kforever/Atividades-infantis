import { NextResponse } from "next/server";
import { BRINDE_PDF_PATH } from "@/lib/funil/contos";
import { openGift } from "@/lib/funil/token";
import type { PilarId } from "@/lib/funil/modelo";

const PILARES = new Set<PilarId>(["ler", "contar", "sentir", "organizar", "criar"]);

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") || "";
  const payload = openGift(token);
  if (!payload || !PILARES.has(payload.pillar)) {
    return NextResponse.json({ ok: false, message: "O PDF abre com o e-mail do quiz." }, { status: 401 });
  }
  return NextResponse.redirect(new URL(BRINDE_PDF_PATH, request.url), 302);
}

import { NextResponse } from "next/server";
import { serviceFetch } from "@/lib/supabase/service";
import { openSair } from "@/lib/funil/token";
import type { MetaLead } from "@/lib/funil/modelo";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") || "";
  const email = openSair(token);
  if (!email) {
    return new NextResponse("Este link não vale mais.", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const found = await serviceFetch<Record<string, unknown>[]>("/rest/v1/leads", {
    searchParams: { select: "id,answers", email_lower: `eq.${email}`, limit: "1" },
  });
  const row = found.ok && Array.isArray(found.data) ? found.data[0] : null;
  if (row?.id) {
    const answers = (row.answers ?? {}) as { meta?: MetaLead };
    const meta: MetaLead = { ...(answers.meta ?? {}), optOut: true };
    await serviceFetch(`/rest/v1/leads?id=eq.${row.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: { answers: { ...answers, meta } },
    });
  }

  return new NextResponse(
    "Pronto. Paramos os e-mails da rotina. O PDF que você já baixou continua com você.",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}

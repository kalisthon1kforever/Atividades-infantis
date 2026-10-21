import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// Recebe o link dos e-mails de recuperação:
// - fluxo PKCE: /entrar/callback?next=/entrar/nova-senha&code=...
// - link antigo com token: /entrar/callback?next=...&token_hash=...&type=recovery
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = searchParams.get("next") ?? "";
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createSupabaseServer();
  let sessionOk = false;

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      sessionOk = !error;
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type === "recovery" ? "recovery" : "signup",
      });
      sessionOk = !error;
    }
  } catch {
    sessionOk = false; // link expirado/reutilizado — tratamos como sessão sobe falha
  }

  let destination = "/entrar";
  if (sessionOk) {
    if (next.startsWith("/") && !next.startsWith("//")) {
      destination = next;
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const must = ((user.app_metadata ?? {}) as Record<string, unknown>).must_change_password === true;
        destination = must ? "/entrar/nova-senha" : "/app";
      }
    }
  }

  return NextResponse.redirect(`${origin}${destination}`);
}

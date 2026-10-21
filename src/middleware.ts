import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddleware } from "@/lib/supabase/server";

const PUBLIC_ROOTS = ["/entrar", "/qz", "/oferta", "/api/quiz-lead", "/api/quiz-purchase", "/images", "/fonts", "/funil"];

function isProtected(pathname: string): boolean {
  return pathname.startsWith("/app") || pathname.startsWith("/admin");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const proxied = isProtected(pathname) || pathname.startsWith("/entrar");
  if (!proxied) return NextResponse.next();

  const { supabase, response } = createSupabaseMiddleware(request);
  // getUser força a validação do JWT e renova os cookies httpOnly
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // quem não tem sessão: só entra em /entrar
  if (!user) {
    if (isProtected(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    if (pathname === "/entrar/nova-senha") {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar/nova-senha";
      url.search = search.includes("code=") ? search : "";
      return response;
    }
    return response;
  }

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const mustChange = appMeta.must_change_password === true;
  const role = (appMeta.role as string) || "familia";

  // troca obrigatória de senha antes de qualquer entregável
  if (mustChange) {
    if (!pathname.startsWith("/entrar/nova-senha") && !pathname.startsWith("/entrar/callback")) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar/nova-senha";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // já logado (sem troca pendente) não precisa re-entrar; /entrar/nova-senha fica aberta
  // para o fluxo de recuperação por e-mail
  if (pathname === "/entrar") {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // /admin só para o papel admin (checado de novo nas páginas e nos endpoints)
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/entrar/:path*", "/entrar/callback"],
};

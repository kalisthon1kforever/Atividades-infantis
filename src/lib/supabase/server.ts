import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function supabaseEnv(): SupabaseEnv {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
  return { url, anonKey };
}

export function isHttpOnlyCookie(): boolean {
  return true; // política do projeto: cookies de sessão sempre httpOnly
}

function cookieOptions() {
  const { url } = supabaseEnv();
  return {
    name: "pp-auth-token",
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: url.startsWith("https://localhost") ? false : url.startsWith("https"),
    path: "/",
  };
}

/** Cliente com a sessão do usuário atual (server components / server actions) */
export async function createSupabaseServer() {
  const { url, anonKey } = supabaseEnv();
  const store = await cookies();
  return createServerClient(url, anonKey, {
    cookieOptions: cookieOptions(),
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options);
          }
        } catch {
          // middlewares/request handlers lidam com os cookies; aqui apenas ignoramos
        }
      },
    },
  });
}

/** Middleware — renova a sessão (cookies httpOnly) e caminha nas proteções */
export function createSupabaseMiddleware(request: NextRequest) {
  const { url, anonKey } = supabaseEnv();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: cookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  return { supabase, response };
}

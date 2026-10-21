// Chamadas diretas ao PostgREST/GoTrue usando SUPABASE_SERVICE_ROLE_KEY.
// Somente no servidor (rotas de API, server actions). nunca no client.

const baseUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

export type ServiceResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
};

export async function serviceFetch<T = unknown>(
  path: string,
  init?: {
    method?: string;
    body?: unknown;
    searchParams?: Record<string, string>;
    headers?: Record<string, string>;
    accept?: string;
  }
): Promise<ServiceResult<T>> {
  const url = baseUrl();
  const key = serviceKey();
  if (!url || !key) {
    return { ok: false, status: 0, data: null, error: "supabase_env_missing" };
  }
  const search = new URLSearchParams(init?.searchParams ?? {});
  const qs = search.toString();
  const full = `${url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}${qs ? `?${qs}` : ""}`;
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };
  if (init?.accept) headers.Accept = init.accept;

  try {
    const res = await fetch(full, {
      method: init?.method ?? "GET",
      headers,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }
    return { ok: res.ok, status: res.status, data: parsed as T, error: res.ok ? undefined : describe(parsed) };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err instanceof Error ? err.message : "network_error" };
  }
}

function describe(parsed: unknown): string {
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error_description === "string") return obj.error_description;
    if (typeof obj.error === "string") return obj.error;
    return JSON.stringify(obj).slice(0, 300);
  }
  return String(parsed).slice(0, 300);
}

/** Abreviação para chamadas RPC */
export function serviceRpc<T = unknown>(fn: string, args: Record<string, unknown>): Promise<ServiceResult<T>> {
  return serviceFetch<T>(`/rest/v1/rpc/${fn}`, { method: "POST", body: args });
}

/** POST /auth/v1/token?grant_type=password — valida e-mail+senha sem revelar nada */
export async function verifyPassword(email: string, password: string): Promise<ServiceResult<unknown>> {
  const url = baseUrl();
  const anon = process.env.SUPABASE_ANON_KEY || "";
  if (!url || !anon) return { ok: false, status: 0, data: null, error: "supabase_env_missing" };
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anon, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (!res.ok) {
      let msg = "senha_incorreta";
      try {
        const json = (await res.json()) as { error_description?: string; error?: string };
        msg = json.error_description || json.error || msg;
      } catch {
        /* keep */
      }
      return { ok: false, status: res.status, data: null, error: msg };
    }
    return { ok: true, status: res.status, data: await res.json() };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err instanceof Error ? err.message : "network_error" };
  }
}

/** Lista usuários do GoTrue (paginado) — usado pelo CRM admin */
export async function adminListUsers(page = 1, perPage = 50): Promise<ServiceResult<AdminUser[]>> {
  const res = await serviceFetch<{ users: AdminUser[] }>("/auth/v1/admin/users", {
    searchParams: { page: String(page), per_page: String(perPage) },
  });
  const users = res.ok && res.data && typeof res.data === "object" ? res.data.users ?? [] : [];
  return { ok: res.ok, status: res.status, data: users, error: res.error };
}

export type AdminUser = {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export async function adminGetUser(id: string): Promise<ServiceResult<AdminUser>> {
  return serviceFetch<AdminUser>(`/auth/v1/admin/users/${id}`);
}

export async function adminUpdateUser(id: string, patch: Record<string, unknown>): Promise<ServiceResult<AdminUser>> {
  return serviceFetch<AdminUser>(`/auth/v1/admin/users/${id}`, { method: "PUT", body: patch });
}

export function tempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "Pp";
  for (let i = 0; i < 8; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

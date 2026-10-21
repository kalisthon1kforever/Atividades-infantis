import { adminGetUser, adminUpdateUser, serviceFetch, serviceRpc, tempPassword, type AdminUser } from "./supabase/service";

type AuthUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
};

function randomPassword() {
  return tempPassword();
}

function paidIds(meta: Record<string, unknown> | undefined) {
  const raw = meta?.paid_ids;
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];
}

function authConfig() {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return null;
  return { url, service };
}

function authHeaders(service: string) {
  return {
    Authorization: `Bearer ${service}`,
    apikey: service,
    "Content-Type": "application/json",
  };
}

async function findUser(email: string): Promise<AuthUser | null> {
  const rpc = await serviceRpc<string | null>("app_find_user_id", { p_email: email });
  if (rpc.ok && typeof rpc.data === "string" && rpc.data) {
    const user = await adminGetUser(rpc.data);
    if (user.ok && user.data) return user.data;
  }
  const listed = await serviceFetch<{ users?: AuthUser[] }>("/auth/v1/admin/users", {
    searchParams: { page: "1", per_page: "200", filter: email },
  });
  const users = listed.ok && listed.data && Array.isArray(listed.data.users) ? listed.data.users : [];
  return users.find((user) => user.email?.toLowerCase() === email) || null;
}

export async function createAppAccess(email: string, name: string) {
  const password = randomPassword();
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return { password, created: false as const };
  }

  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${service}`,
      apikey: service,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, source: "quiz-funil" },
      app_metadata: { role: "familia", must_change_password: true },
    }),
  });

  if (res.ok) {
    return { password, created: true as const };
  }

  const detail = await res.text();
  console.error("[access] create user", res.status, detail);
  return { password, created: false as const };
}

export async function ensureAppAccess(email: string, name: string, paymentId: string) {
  const cfg = authConfig();
  const password = randomPassword();
  if (!cfg) return { password: "", created: false as const, already: false, userId: "" };

  const existing = await findUser(email);
  if (existing) {
    const meta = existing.app_metadata || {};
    const paid = paidIds(meta);
    if (paid.includes(paymentId)) {
      return { password: "", created: true as const, already: true, userId: existing.id };
    }
    const role = typeof meta.role === "string" ? meta.role : "familia";
    const updated = await adminUpdateUser(existing.id, {
      password,
      email_confirm: true,
      app_metadata: {
        ...meta,
        role,
        must_change_password: true,
        paid_ids: [...paid, paymentId],
      },
      user_metadata: { name, source: "quiz-funil" },
    });
    if (!updated.ok) {
      console.error("[access] update user", updated.status, updated.error);
      return { password: "", created: false as const, already: false, userId: existing.id };
    }
    return { password, created: true as const, already: false, userId: existing.id };
  }

  const created = await serviceFetch<AdminUser>("/auth/v1/admin/users", {
    method: "POST",
    body: {
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "familia", must_change_password: true, paid_ids: [paymentId] },
      user_metadata: { name, source: "quiz-funil" },
    },
  });
  if (!created.ok || !created.data?.id) {
    console.error("[access] create user", created.status, created.error);
    return { password: "", created: false as const, already: false, userId: "" };
  }
  return { password, created: true as const, already: false, userId: created.data.id };
}

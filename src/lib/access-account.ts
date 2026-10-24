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

/**
 * Garante que a conta existe e está provisionada para este pagamento.
 * Idempotente: seguro re-executar em notificações repetidas/retomadas.
 * NÃO define a senha final (isso fica para o envio do e-mail).
 */
export async function ensureAppAccount(email: string, name: string, paymentId: string) {
  const cfg = authConfig();
  if (!cfg) return { ok: false as const, userId: "" };

  const existing = await findUser(email);
  if (existing) {
    const meta = existing.app_metadata || {};
    const paid = paidIds(meta);
    if (paid.includes(paymentId)) {
      return { ok: true as const, userId: existing.id };
    }
    const role = typeof meta.role === "string" ? meta.role : "familia";
    const updated = await adminUpdateUser(existing.id, {
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
      return { ok: false as const, userId: existing.id };
    }
    return { ok: true as const, userId: existing.id };
  }

  const created = await serviceFetch<AdminUser>("/auth/v1/admin/users", {
    method: "POST",
    body: {
      email,
      password: tempPassword(),
      email_confirm: true,
      app_metadata: { role: "familia", must_change_password: true, paid_ids: [paymentId] },
      user_metadata: { name, source: "quiz-funil" },
    },
  });
  if (created.ok && created.data?.id) {
    return { ok: true as const, userId: created.data.id };
  }

  // Concorrência: outra entrega pode ter criado a conta neste exato instante.
  const raced = await findUser(email);
  if (raced) {
    const meta = raced.app_metadata || {};
    const paid = paidIds(meta);
    if (paid.includes(paymentId)) return { ok: true as const, userId: raced.id };
    const role = typeof meta.role === "string" ? meta.role : "familia";
    const updated = await adminUpdateUser(raced.id, {
      email_confirm: true,
      app_metadata: { ...meta, role, must_change_password: true, paid_ids: [...paid, paymentId] },
      user_metadata: { name, source: "quiz-funil" },
    });
    if (!updated.ok) return { ok: false as const, userId: raced.id };
    return { ok: true as const, userId: raced.id };
  }

  console.error("[access] create user", created.status, created.error);
  return { ok: false as const, userId: "" };
}

/**
 * Gera uma senha temporária nova e grava na conta, preservando role/paid_ids.
 * Chamada apenas pelo "dono" do envio de e-mail, para que a senha enviada
 * bata com a senha real da conta.
 */
export async function setAccountPassword(userId: string) {
  const current = await adminGetUser(userId);
  if (!current.ok || !current.data) return { ok: false as const, password: "" };
  const meta = (current.data.app_metadata ?? {}) as Record<string, unknown>;
  const password = tempPassword();
  const updated = await adminUpdateUser(userId, {
    password,
    email_confirm: true,
    app_metadata: { ...meta, must_change_password: true },
  });
  if (!updated.ok) return { ok: false as const, password: "" };
  return { ok: true as const, password };
}

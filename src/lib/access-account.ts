function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "Pp";
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
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
    }),
  });

  if (res.ok) {
    return { password, created: true as const };
  }

  const detail = await res.text();
  console.error("[access] create user", res.status, detail);
  return { password, created: false as const };
}

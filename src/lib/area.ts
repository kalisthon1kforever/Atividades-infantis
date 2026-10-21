import { createSupabaseServer } from "@/lib/supabase/server";
import { serviceFetch } from "@/lib/supabase/service";
import { trailEnabled } from "@/lib/products";
import type {
  Activity,
  ChildRow,
  EntitlementRow,
  FavoriteRow,
  LeadRow,
  ProfileRow,
  ProgressRow,
  TrailRow,
} from "@/lib/types";

export type AreaUser = {
  id: string;
  email: string;
  name: string; // nome de exibição (user_metadata.name do funil / profiles)
  role: "familia" | "admin" | (string & {});
  mustChangePassword: boolean;
};

export async function getAreaUser(): Promise<AreaUser | null> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
    const um = (user.user_metadata ?? {}) as Record<string, unknown>;
    return {
      id: user.id,
      email: user.email ?? "",
      name:
        (typeof um.name === "string" && um.name.trim()) ||
        (typeof um.full_name === "string" && um.full_name.trim()) ||
        "",
      role: meta.role === "admin" ? "admin" : "familia",
      mustChangePassword: meta.must_change_password === true,
    };
  } catch {
    return null;
  }
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("profiles")
      .select("user_id,name,last_access,created_at")
      .eq("user_id", userId)
      .maybeSingle<ProfileRow>();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function touchProfile(userId: string, name: string) {
  try {
    const supabase = await createSupabaseServer();
    await supabase
      .from("profiles")
      .upsert(
        { user_id: userId, name, last_access: new Date().toISOString() },
        { onConflict: "user_id" },
      );
  } catch {
    /* silencioso */
  }
}

export async function getEntitlements(userId: string): Promise<EntitlementRow[]> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("entitlements")
      .select("user_id,product,source,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    return Array.isArray(data) ? (data as EntitlementRow[]) : [];
  } catch {
    return [];
  }
}

export async function getChildren(userId: string): Promise<ChildRow[]> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("children")
      .select("id,user_id,name,age,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return Array.isArray(data) ? (data as ChildRow[]) : [];
  } catch {
    return [];
  }
}

export async function getProgress(userId: string): Promise<ProgressRow[]> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("activity_progress")
      .select("user_id,activity_id,log_date,completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1000);
    return Array.isArray(data) ? (data as ProgressRow[]) : [];
  } catch {
    return [];
  }
}

export async function getFavorites(userId: string): Promise<FavoriteRow[]> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("favorites")
      .select("user_id,activity_id,created_at")
      .eq("user_id", userId);
    return Array.isArray(data) ? (data as FavoriteRow[]) : [];
  } catch {
    return [];
  }
}

export async function getTrail(userId: string): Promise<TrailRow[]> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("trail_days")
      .select("user_id,day,completed,completed_at")
      .eq("user_id", userId)
      .order("day", { ascending: true });
    return Array.isArray(data) ? (data as TrailRow[]) : [];
  } catch {
    return [];
  }
}

/** Lead do quiz pelo e-mail — leitura administrativa, para personalizar a abertura */
export async function getLeadByEmail(email: string): Promise<LeadRow | null> {
  try {
    const res = await serviceFetch<LeadRow[]>("/rest/v1/leads", {
      searchParams: { email: `eq.${email}`, select: "*", limit: "1" },
    });
    return res.ok && Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
  } catch {
    return null;
  }
}

// ---------- datas utilitas ----------

export function saoPauloDate(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // yyyy-mm-dd
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeStreak(logs: ProgressRow[]): number {
  const days = Array.from(new Set(logs.map((r) => r.log_date))).sort().reverse();
  if (days.length === 0) return 0;
  const today = saoPauloDate();
  const yesterday = addDays(today, -1);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let count = 1;
  for (let i = 1; i < days.length; i += 1) {
    if (days[i] === addDays(days[i - 1], -1)) count += 1;
    else break;
  }
  return count;
}

export function distinctDoneIds(logs: ProgressRow[]): Set<string> {
  return new Set(logs.map((r) => r.activity_id));
}

// ---------- conquistas ----------

export type Achievement = {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  unlocked: boolean;
};

export function computeAchievements(
  logs: ProgressRow[],
  activities: Activity[],
  categoriesTouched: number,
  trailDoneDays: number,
): { list: Achievement[]; stars: number } {
  const done = distinctDoneIds(logs);
  const stars = logs.length;
  const streak = computeStreak(logs);

  const catDone = new Map<string, number>();
  for (const id of done) {
    const a = activities.find((x) => x.id === id);
    if (a) catDone.set(a.category, (catDone.get(a.category) ?? 0) + 1);
  }
  const catTotal = new Map<string, number>();
  for (const a of activities) catTotal.set(a.category, (catTotal.get(a.category) ?? 0) + 1);
  let categoryComplete = false;
  for (const [cat, total] of catTotal) {
    if (total > 0 && (catDone.get(cat) ?? 0) >= total) categoryComplete = true;
  }

  const list: Achievement[] = [
    { id: "primeira", emoji: "🎉", label: "Primeira atividade", hint: "1º “fizemos juntos”", unlocked: stars >= 1 },
    { id: "estrelas-5", emoji: "⭐", label: "5 estrelas", hint: "5 momentos juntos", unlocked: stars >= 5 },
    { id: "estrelas-10", emoji: "🌟", label: "10 estrelas", hint: "10 momentos juntos", unlocked: stars >= 10 },
    { id: "estrelas-20", emoji: "💫", label: "20 estrelas", hint: "20 momentos juntos", unlocked: stars >= 20 },
    { id: "streak-3", emoji: "🔥", label: "3 dias seguidos", hint: "3 dias de fila", unlocked: streak >= 3 },
    { id: "streak-7", emoji: "🔥", label: "7 dias seguidos", hint: "7 dias na sequência", unlocked: streak >= 7 },
    { id: "categoria", emoji: "🏅", label: "Uma categoria completa", hint: "todas as fichas de uma categoria", unlocked: categoryComplete },
    { id: "trilha", emoji: "🗓️", label: "10 dias da trilha", hint: "10 dias do guia de 30 dias", unlocked: trailDoneDays >= 10 },
    { id: "certificado", emoji: "🎓", label: "Certificado", hint: "aprendeu junto com quem cuida", unlocked: categoryComplete || trailDoneDays >= 15 },
  ];
  return { list, stars };
}

export { trailEnabled };

// Helpers server-side administrativos (chamadas com service_role)
import { serviceFetch } from "@/lib/supabase/service";

export type Row = Record<string, unknown>;

export function formatBr(value: unknown): string {
  const raw = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(value ?? "—");
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function fetchAllRows<T = Row>(
  path: string,
  searchParams: Record<string, string> = {},
): Promise<T[]> {
  const res = await serviceFetch<T[]>(path, {
    searchParams: { ...searchParams, limit: "500" },
  });
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

/** Títulos por id de atividade — para painel e fichas */
export async function fetchActivityTitles(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const list = ids.slice(0, 60).map((x) => `"${x}"`).join(",");
  const rows = await fetchAllRows<{ id: string; title: string }>("/rest/v1/activities", {
    select: "id,title",
    id: `in.(${list})`,
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.id] = r.title;
  return map;
}

export async function singleRow<T = Row>(path: string, searchParams: Record<string, string>): Promise<T | null> {
  const res = await serviceFetch<T[]>(path, {
    searchParams: { ...searchParams, limit: "1" },
  });
  const rows = res.ok && Array.isArray(res.data) ? res.data : [];
  return rows[0] ?? null;
}

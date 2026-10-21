// Funções de servidor do catálogo — tudo pesado (PostgREST/RLS) fica aqui.
import { CATALOG_SEED } from "@/data/catalog-seed";
import { covers, trailEnabled } from "@/lib/products";
import { serviceRpc } from "@/lib/supabase/service";
import type { Activity } from "@/lib/types";

// re-exporta o que é puro para as páginas server-side
export {
  CATEGORIES,
  CATEGORY_ICON,
  categoryIcon,
  activityHelp,
} from "@/lib/catalog-shared";

export type { Activity };

/** Carrega o catálogo via RLS com a sessão do usuário; fallback local se o banco não responder */
export async function fetchVisibleActivities(
  products: string[],
): Promise<{ items: Activity[]; source: "db" | "fallback" }> {
  try {
    const { createSupabaseServer } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("activities")
      .select("id,title,summary,category,duration_min,age_min,age_max,format,bw,audience,product_key,tags,data,is_published")
      .order("category", { ascending: true });
    if (error || !Array.isArray(data) || data.length === 0) {
      return { items: fallbackActivities(products), source: "fallback" };
    }
    return { items: data as Activity[], source: "db" };
  } catch {
    return { items: fallbackActivities(products), source: "fallback" };
  }
}

function fallbackActivities(products: string[]): Activity[] {
  return CATALOG_SEED.filter((a) => {
    if (a.product_key === "professores") return covers(products, "professores");
    return covers(products, a.product_key);
  }) as unknown as Activity[];
}

export async function fetchActivityById(id: string, products: string[]): Promise<Activity | null> {
  const all = await fetchVisibleActivities(products);
  return all.items.find((a) => a.id === id) ?? null;
}

/** Auxiliar silencioso: dá a amostra quando o e-mail do quiz já tem conta no Supabase */
export async function grantAmostraByLead(email: string): Promise<void> {
  try {
    await serviceRpc("app_grant_entitlement", {
      p_email: email,
      p_product: "amostra",
      p_source: "quiz-capture",
    });
  } catch {
    /* silencioso */
  }
}

export function trailOn(products: string[]): boolean {
  return trailEnabled(products);
}

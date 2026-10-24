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

export type CatalogSource = "db" | "fallback" | "error";

/**
 * Carrega o catálogo via RLS com a sessão do usuário.
 *
 * - `db`: dados reais vindos do PostgREST (a policy RLS já filtra por
 *   `is_published` e `app_can_access(product_key)`). Um resultado vazio aqui é
 *   legítimo — por exemplo, um usuário que ainda não tem o produto liberado.
 * - `error`: a consulta falhou. Em produção NÃO há fallback para o seed (devolve
 *   vazio) para não expor fichas fora da política de acesso. Em desenvolvimento/
 *   teste o fallback local pode ser usado, respeitando `covers`.
 * - `fallback`: seed local (CATALOG_SEED), restrito a ambiente de desenvolvimento
 *   ou teste — nunca em produção.
 */
export async function fetchVisibleActivities(
  products: string[],
): Promise<{ items: Activity[]; source: CatalogSource }> {
  try {
    const { createSupabaseServer } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("activities")
      .select("id,title,summary,category,duration_min,age_min,age_max,format,bw,audience,product_key,tags,data,is_published")
      .order("category", { ascending: true });

    // Falha de consulta (erro ou formato inesperado): nunca concede acesso por fallback em produção.
    if (error || !Array.isArray(data)) {
      if (allowSeedFallback()) {
        return { items: fallbackActivities(products), source: "fallback" };
      }
      return { items: [], source: "error" };
    }

    // Resultado vazio é uma resposta válida (RLS filtrou tudo). Distinto da falha acima.
    return { items: data as Activity[], source: "db" };
  } catch {
    if (allowSeedFallback()) {
      return { items: fallbackActivities(products), source: "fallback" };
    }
    return { items: [], source: "error" };
  }
}

/** Fallback para o seed local — apenas em desenvolvimento/teste (nunca em produção). */
function allowSeedFallback(): boolean {
  return process.env.NODE_ENV !== "production";
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

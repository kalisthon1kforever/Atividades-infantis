// Agrupamentos amigáveis para descoberta — NÃO substituem `category`, `tags` nem
// `product_key`. São nomes de apresentação sobre as categorias/tags reais do catálogo.
// Mapa puro, seguro para client e server components (sem imports de servidor).
import type { Activity } from "@/lib/types";

export type AreaId = "brincar" | "letras" | "criar-colorir" | "rotina" | "emocoes";

export type Area = {
  id: AreaId;
  nome: string;
  emoji: string;
  descricao: string;
  /** Categorias originais que caem direto nesta área (exceto criar-colorir, que é por tag/padrão). */
  categorias: string[];
  /** Correspondência real de cores para a área "Criar e colorir". */
  corTags: string[];
  corPadroes: string[];
};

export const AREAS: Area[] = [
  {
    id: "brincar",
    nome: "Brincar, observar e pensar",
    emoji: "🔍",
    descricao: "Olhar com atenção, achar o par e caprichar no traço.",
    categorias: ["Atenção visual", "Traçado e coordenação"],
    corTags: [],
    corPadroes: [],
  },
  {
    id: "letras",
    nome: "Letras e primeiras palavras",
    emoji: "🔤",
    descricao: "Sons, sílabas e as primeiras leituras de verdade.",
    categorias: ["Letras e sílabas", "Palavras e leitura", "Vocabulário"],
    corTags: [],
    corPadroes: [],
  },
  {
    id: "criar-colorir",
    nome: "Criar e colorir",
    emoji: "🎨",
    descricao: "Momentos de cor e criação para fazer junto.",
    categorias: [],
    corTags: ["cores"],
    corPadroes: ["ligar-cor"],
  },
  {
    id: "rotina",
    nome: "Rotina e autonomia",
    emoji: "🕐",
    descricao: "Passos do dia que acalmam e dão previsibilidade.",
    categorias: ["Rotinas"],
    corTags: [],
    corPadroes: [],
  },
  {
    id: "emocoes",
    nome: "Emoções e convivência",
    emoji: "💗",
    descricao: "Nomear o que sente e conviver com mais leveza.",
    categorias: ["Emoções"],
    corTags: [],
    corPadroes: [],
  },
];

const CATEGORY_AREA: Record<string, AreaId> = {
  "Atenção visual": "brincar",
  "Traçado e coordenação": "brincar",
  "Letras e sílabas": "letras",
  "Palavras e leitura": "letras",
  "Vocabulário": "letras",
  "Rotinas": "rotina",
  "Emoções": "emocoes",
};

function temCor(a: Activity): boolean {
  const tags = a.tags ?? [];
  const padrao = ((a.data ?? {}) as { pattern?: string }).pattern ?? "";
  const criar = AREAS.find((x) => x.id === "criar-colorir");
  const corTag = criar?.corTags.some((t) => tags.includes(t)) ?? false;
  const corPadrao = criar?.corPadroes.includes(padrao) ?? false;
  return corTag || corPadrao;
}

/** Área de descoberta da atividade, ou null quando não há correspondência clara. */
export function areaDe(a: Activity): AreaId | null {
  if (temCor(a)) return "criar-colorir";
  return CATEGORY_AREA[a.category] ?? null;
}

export function areaInfo(id: AreaId): Area | undefined {
  return AREAS.find((x) => x.id === id);
}

/** Agrupa as atividades pelas áreas de descoberta (apenas áreas que têm itens). */
export function agruparPorArea(activities: Activity[]): { area: Area; items: Activity[] }[] {
  const map = new Map<AreaId, Activity[]>();
  for (const a of activities) {
    const area = areaDe(a);
    if (!area) continue;
    const list = map.get(area) ?? [];
    list.push(a);
    map.set(area, list);
  }
  return AREAS.filter((area) => map.has(area.id)).map((area) => ({
    area,
    items: map.get(area.id) as Activity[],
  }));
}

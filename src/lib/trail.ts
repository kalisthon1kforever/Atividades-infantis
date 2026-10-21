import type { Activity } from "@/lib/types";

/** escolhe a atividade sugerida do dia da trilha (função pura — server e client seguros) */
export function pickTrailActivity(
  activities: Activity[],
  doneIds: Set<string>,
  day: number,
): Activity | null {
  const cycle = [
    "Atenção visual",
    "Traçado e coordenação",
    "Letras e sílabas",
    "Palavras e leitura",
    "Números e quantidades",
    "Emoções",
    "Rotinas",
  ];
  const cat = cycle[(Math.max(1, day) - 1) % cycle.length];
  const inCat = activities.filter((a) => a.category === cat && !doneIds.has(a.id));
  if (inCat.length > 0) return inCat[0];
  const any = activities.filter((a) => !doneIds.has(a.id));
  return any[0] ?? activities[0] ?? null;
}

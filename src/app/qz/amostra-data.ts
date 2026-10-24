import { CONTOS_BRINDE } from "@/lib/funil/contos";

export const SAMPLE_ACTIVITIES = CONTOS_BRINDE.map((conto) => ({
  n: conto.n,
  tag: "Hora de dormir",
  title: conto.titulo,
  hint: conto.quando,
  items: [conto.emoji],
}));

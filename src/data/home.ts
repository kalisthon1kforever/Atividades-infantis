import { CATALOG_SEED, type CatalogSeed } from "./catalog-seed";

export type HomeModuleKey = "atencao" | "pre-alfa" | "matematica" | "motora" | "emocoes" | "rotinas";

export type HomeModule = {
  key: HomeModuleKey;
  number: number;
  title: string;
  icon: string;
  tone: string;
  soft: string;
  description: string;
  categories: string[];
};

export const HOME_MODULES: HomeModule[] = [
  {
    key: "atencao",
    number: 1,
    title: "Atenção visual e associação",
    icon: "🔍",
    tone: "#2563eb",
    soft: "#e8f0fe",
    description: "Ache os iguais, ligue as cores, encontre as diferenças: o olhinho treina sem perceber.",
    categories: ["Atenção visual"],
  },
  {
    key: "pre-alfa",
    number: 2,
    title: "Pré-alfabetização",
    icon: "🔤",
    tone: "#e0457b",
    soft: "#fde8ef",
    description: "Letras, sílabas, palavras e cartões ilustrados para o primeiro contato com a leitura.",
    categories: ["Letras e sílabas", "Palavras e leitura", "Vocabulário"],
  },
  {
    key: "matematica",
    number: 3,
    title: "Matemática visual",
    icon: "🔢",
    tone: "#057a55",
    soft: "#e1f6ec",
    description: "Contar, comparar e completar sequências com figuras que a criança reconhece.",
    categories: ["Números e quantidades"],
  },
  {
    key: "motora",
    number: 4,
    title: "Coordenação motora",
    icon: "✂️",
    tone: "#d97706",
    soft: "#fff3dc",
    description: "Labirintos, tracejados, picotados e recortes para firmar a mão no lápis e na tesoura.",
    categories: ["Traçado e coordenação"],
  },
  {
    key: "emocoes",
    number: 5,
    title: "Emoções e escolhas",
    icon: "💛",
    tone: "#7c3aed",
    soft: "#f1eafe",
    description: "Termômetro das emoções e cartões de sentimentos para a criança nomear o que sente.",
    categories: ["Emoções"],
  },
  {
    key: "rotinas",
    number: 6,
    title: "Rotinas e organização",
    icon: "🗓️",
    tone: "#0e7490",
    soft: "#e0f5f9",
    description: "Rotina visual em figuras e quadro da manhã: o dia fica previsível e mais leve.",
    categories: ["Rotinas"],
  },
];

export type HomeActivity = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  ages: string;
  glyphs: string[];
  module: HomeModule;
};

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function firstGlyph(text: string): string {
  const [first] = Array.from(text.trim());
  return first ?? "";
}

function glyphsFor(seed: CatalogSeed): string[] {
  const data = seed.data as Record<string, unknown>;
  const pattern = String(data.pattern ?? "");
  const out: string[] = [];

  const items = asStrings(data.items);
  if (pattern === "ligar-cor") out.push(...items.map(firstGlyph));
  else out.push(...items);

  if (Array.isArray(data.grupos)) {
    for (const group of data.grupos as { icon?: string; qtd?: number }[]) {
      if (group.icon) out.push(...Array(Math.min(group.qtd ?? 1, 4)).fill(group.icon));
    }
  }
  if (Array.isArray(data.cartoes)) {
    for (const card of data.cartoes as { emoji?: string }[]) if (card.emoji) out.push(card.emoji);
  }
  if (Array.isArray(data.pares)) {
    for (const pair of data.pares as { emoji?: string }[]) if (pair.emoji) out.push(pair.emoji);
  }
  out.push(...asStrings(data.rosto));
  out.push(...asStrings(data.passos).map(firstGlyph));
  out.push(...asStrings(data.figuras));
  out.push(...asStrings(data.numeros).map((n) => (n === "__" ? "?" : n)));
  out.push(...asStrings(data.palavras).slice(0, 3));
  out.push(...asStrings(data.linhas).slice(0, 3));
  if (typeof data.de === "string") out.push(data.de, "➜", String(data.ate ?? ""));
  if (typeof data.palavra === "string") out.unshift(data.palavra);
  if (pattern === "picotado") out.push("✂️", "- - -", "- - -");
  if (pattern === "termometro") out.push("🌡️", "1", "2", "3", "4", "5");
  if (pattern === "diferencas") out.push("🐄", "🐔", "🐷", "≠");
  if (pattern === "estrela-dia") out.push("⭐");

  return out.filter(Boolean).slice(0, 6);
}

export function homeActivities(): HomeActivity[] {
  const list: HomeActivity[] = [];
  for (const module of HOME_MODULES) {
    for (const seed of CATALOG_SEED) {
      if (!module.categories.includes(seed.category)) continue;
      list.push({
        id: seed.id,
        title: seed.title,
        summary: seed.summary,
        minutes: seed.duration_min,
        ages: `${seed.age_min} a ${seed.age_max} anos`,
        glyphs: glyphsFor(seed),
        module,
      });
    }
  }
  return list;
}

export const HOME_FAQ = [
  {
    question: "Para qual idade as atividades são indicadas?",
    answer:
      "Para crianças de aproximadamente 3 a 8 anos. Cada atividade mostra a faixa de idade sugerida, e o quiz ajuda a escolher por onde começar.",
  },
  {
    question: "Como recebo depois da compra?",
    answer:
      "Assim que o pagamento é aprovado, chega no seu e-mail o login e uma senha temporária. Você entra na área da família, troca a senha e já pode imprimir ou fazer pelo app.",
  },
  {
    question: "Preciso de impressora colorida?",
    answer:
      "Não. Todas as atividades funcionam em preto e branco, e o kit traz uma versão econômica para imprimir gastando menos tinta.",
  },
  {
    question: "Dá para usar sem imprimir?",
    answer:
      "Sim. Pela área da família, no celular ou no computador, você abre as atividades, marca o que fizeram juntos e acompanha as estrelinhas da criança.",
  },
  {
    question: "Quanto tempo leva cada atividade?",
    answer:
      "De 5 a 15 minutos. A ideia é caber no dia: sentar junto, fazer uma ficha e celebrar a participação, sem cobrança.",
  },
  {
    question: "Preciso acompanhar meu filho?",
    answer:
      "Sim, esse é o coração do método: o adulto apresenta, acompanha e comemora. É o momento de vocês dois.",
  },
  {
    question: "E se não combinar com a nossa rotina?",
    answer:
      "Você tem 7 dias de garantia. Se não fizer sentido para a família, pede o reembolso e devolvemos o valor.",
  },
  {
    question: "Substitui a escola ou acompanhamento profissional?",
    answer:
      "Não. É um material educativo complementar para casa. Ele não substitui a escola nem acompanhamento profissional.",
  },
];

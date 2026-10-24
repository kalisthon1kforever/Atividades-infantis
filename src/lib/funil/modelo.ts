import { CATALOG } from "@/lib/catalog-prices";

/** Kit Completo no checkout. O preço cobrado é o do catálogo. */
export const PRECO_KIT = CATALOG["kit-inicial"].price;

/**
 * Escada publicada: R$ 37,90 → R$ 19,90 → R$ 27,90 → R$ 14,90.
 * Pacote Extra, Coleção Momento Calmo e Fofura Essencial ficam fora do ar
 * enquanto o material não está no catálogo. Nada disso é cobrado nem anunciado.
 */
export const PUBLICAR = {
  pacoteExtra: false,
  upsell: false,
  downsell: false,
} as const;

export const PRECO_PACOTE_EXTRA = 19.9;
export const PRECO_UPSELL = 27.9;
export const PRECO_DOWNSELL = 14.9;
export const ANCORA_CADERNOS = 195;
export const ANCORA_MERCADO = 197;
export const ANCORA_UPSELL = 40;

export const GARANTIA_DIAS = 7;

export const QUIZ_STEPS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
export type QuizStep = (typeof QUIZ_STEPS)[number];

export type PilarId = "ler" | "contar" | "sentir" | "organizar" | "criar";

export type Resposta = { key: string; label: string };
export type Respostas = Partial<Record<QuizStep, Resposta>>;

export type MetaLead = {
  pillar?: PilarId;
  age?: string;
  childName?: string;
  appFirstAt?: string;
  boughtAt?: string;
  emailsSent?: number[];
  weeklyAt?: string;
  weeklyCount?: number;
  optOut?: boolean;
};

export const PILARES: {
  id: PilarId;
  emoji: string;
  nome: string;
  cadernos: string;
  categorias: string[];
}[] = [
  {
    id: "ler",
    emoji: "📖",
    nome: "Ler",
    cadernos: "Alfabetização em Casa · Pré-Alfabetização · Pareamento Visual",
    categorias: ["Letras e sílabas", "Palavras e leitura", "Vocabulário"],
  },
  {
    id: "contar",
    emoji: "🔢",
    nome: "Contar",
    cadernos: "Sequência Numérica (2 vols.) · Formas Geométricas · Sistema Monetário",
    categorias: ["Números e quantidades"],
  },
  {
    id: "sentir",
    emoji: "💛",
    nome: "Sentir",
    cadernos: "Emoções e Escolhas",
    categorias: ["Emoções"],
  },
  {
    id: "organizar",
    emoji: "🗓️",
    nome: "Organizar",
    cadernos: "Rotina Visual · Cartões do Dia a Dia",
    categorias: ["Rotinas"],
  },
  {
    id: "criar",
    emoji: "🎨",
    nome: "Criar e acalmar",
    cadernos: "Cores (2 vols.) · Desenhos de Colorir e se Divertir",
    categorias: ["Atenção visual", "Traçado e coordenação"],
  },
];

export const CADERNOS_KIT = [
  "Ler — Alfabetização em Casa",
  "Ler — Pré-Alfabetização",
  "Ler — Pareamento Visual",
  "Contar — Sequência Numérica (vol. 1)",
  "Contar — Sequência Numérica (vol. 2)",
  "Contar — Formas Geométricas",
  "Contar — Sistema Monetário",
  "Sentir — Emoções e Escolhas",
  "Organizar — Rotina Visual",
  "Organizar — Cartões do Dia a Dia",
  "Criar e acalmar — Cores (vol. 1)",
  "Criar e acalmar — Cores (vol. 2)",
  "Criar e acalmar — Desenhos de Colorir e se Divertir",
];

export const ITENS_AREA = [
  "Biblioteca organizada por pilar, idade e tempo, com busca e filtros",
  "Próximo passo sugerido: a atividade de hoje aparece na frente",
  "Favoritos para marcar o que a criança amou",
  "Estrelas: cada “fizemos juntos” vira estrelinha",
  "PDF para imprimir quando quiser, no celular ou no computador",
];

export const AVISO_COMPLEMENTAR =
  "Material educativo complementar. Não substitui a escola nem acompanhamento profissional.";

export const PERGUNTAS: Record<
  QuizStep,
  { titulo: string; opcoes: { key: string; label: string }[]; celebra: string }
> = {
  q1: {
    titulo: "Qual a idade da criança?",
    opcoes: [
      { key: "2-3", label: "2–3 anos" },
      { key: "4-5", label: "4–5 anos" },
      { key: "6-8", label: "6–8 anos" },
      { key: "9-10", label: "9–10 anos" },
    ],
    celebra: "Boa. A idade já escolhe o tamanho do cartão.",
  },
  q2: {
    titulo: "Qual o maior desafio hoje?",
    opcoes: [
      { key: "crises", label: "Crises ao trocar de atividade" },
      { key: "rotina", label: "Não segue a rotina mesmo repetindo" },
      { key: "sentir", label: "Não consegue dizer o que sente" },
      { key: "depende", label: "Depende de mim para tudo" },
    ],
    celebra: "Boa. Isso já define o quadro certo.",
  },
  q3: {
    titulo: "O que mais pesa no seu dia?",
    opcoes: [
      { key: "imprevisivel", label: "O dia é imprevisível" },
      { key: "salvei", label: "Salvei atividades mas nunca uso" },
      { key: "tela", label: "Só a tela acalma" },
      { key: "zero", label: "Cada dia recomeça do zero" },
    ],
    celebra: "Anotado. Isso entra no perfil de vocês.",
  },
  q4: {
    titulo: "Já tentou cartões ou rotina visual?",
    opcoes: [
      { key: "parou", label: "Sim, mas parou" },
      { key: "nao-funcionou", label: "Tentei e não funcionou" },
      { key: "nunca", label: "Nunca tentei" },
    ],
    celebra: "Boa. Já sei como apresentar o material.",
  },
  q5: {
    titulo: "Quanto tempo real você tem por dia?",
    opcoes: [
      { key: "5-10", label: "5–10 min" },
      { key: "15-20", label: "15–20 min" },
      { key: "30+", label: "30+ min" },
    ],
    celebra: "Perfeito. Uma ficha por dia cabe nesse tempo.",
  },
  q6: {
    titulo: "Quem vai aplicar junto?",
    opcoes: [
      { key: "sozinho", label: "Eu sozinho" },
      { key: "parceiro", label: "Eu + parceiro" },
      { key: "familia", label: "Família toda" },
      { key: "escola", label: "Com apoio da escola ou terapeuta" },
    ],
    celebra: "Pronto. O perfil da rotina está fechado.",
  },
};

export const REVELA = [
  { titulo: "Cartão grande", texto: "Um cartão para mostrar com a mão, sem texto miúdo." },
  { titulo: "Quadro da manhã", texto: "A ordem do dia fica visível, num lugar só." },
  { titulo: "Cartão de emoção", texto: "Um rostinho para nomear o que está sentindo." },
  { titulo: "Ficha de letras", texto: "Uma folha curta, pronta para imprimir." },
  { titulo: "Sequência numérica", texto: "Contar com figuras, no tempo que vocês têm." },
  { titulo: "Desenho para colorir", texto: "Um momento calmo para fechar juntos." },
];

export const STORAGE_KEY = "pp-funil-2026";

export function pilarDe(id: string | null | undefined) {
  return PILARES.find((p) => p.id === id) ?? PILARES[3];
}

export function recomendarPilar(respostas: Respostas): PilarId {
  const s: Record<PilarId, number> = { ler: 0, contar: 0, sentir: 0, organizar: 0, criar: 0 };
  const q1 = respostas.q1?.key;
  const q2 = respostas.q2?.key;
  const q3 = respostas.q3?.key;
  const q4 = respostas.q4?.key;
  const q5 = respostas.q5?.key;

  if (q1 === "2-3") {
    s.organizar += 3;
    s.criar += 1;
  } else if (q1 === "4-5") {
    s.ler += 2;
    s.organizar += 1;
    s.contar += 1;
  } else if (q1 === "6-8") {
    s.ler += 2;
    s.contar += 2;
  } else if (q1 === "9-10") {
    s.contar += 2;
    s.ler += 1;
  }

  if (q2 === "crises") {
    s.organizar += 3;
    s.criar += 1;
  } else if (q2 === "rotina") s.organizar += 3;
  else if (q2 === "sentir") s.sentir += 4;
  else if (q2 === "depende") {
    s.organizar += 2;
    s.ler += 1;
  }

  if (q3 === "imprevisivel" || q3 === "salvei" || q3 === "zero") s.organizar += 2;
  if (q3 === "tela") {
    s.criar += 3;
    s.sentir += 1;
  }

  if (q4 === "parou") s.organizar += 1;
  if (q4 === "nao-funcionou") s.organizar += 2;
  if (q4 === "nunca") s.criar += 1;
  if (q5 === "5-10") s.criar += 1;

  const max = Math.max(...Object.values(s));
  const empatados = (Object.keys(s) as PilarId[]).filter((id) => s[id] === max);
  if (empatados.length === 1) return empatados[0];

  const preferido: PilarId =
    q2 === "sentir" ? "sentir" : q3 === "tela" ? "criar" : q1 === "6-8" || q1 === "9-10" ? "ler" : "organizar";
  return empatados.includes(preferido) ? preferido : empatados[0];
}

export function nomeDoPerfil(respostas: Respostas, pilar: PilarId): string {
  if (pilar === "sentir") return "Rotina que Nomeia";
  if (pilar === "ler") return "Rotina das Letras";
  if (pilar === "contar") return "Rotina dos Números";
  if (pilar === "criar") return "Rotina Calma";
  if (respostas.q2?.key === "rotina") return "Rotina Visível";
  return "Rotina Serena";
}

export function frasesDoResultado(respostas: Respostas): string[] {
  const linhas: string[] = [];
  const q2 = respostas.q2?.key;
  const q3 = respostas.q3?.key;

  if (q2 === "crises") {
    linhas.push(
      "Trocar de atividade tem sido o ponto mais difícil. O perfil prioriza um quadro de Primeiro e Depois, para a passagem ficar visível."
    );
  } else if (q2 === "rotina") {
    linhas.push(
      "Você já repetiu a rotina e ela ainda não cola. O perfil aponta um quadro que fica à vista, para não depender da memória."
    );
  } else if (q2 === "sentir") {
    linhas.push(
      "Nomear o que sente ainda é difícil. O perfil começa por cartões de emoção, curtos, do lado de vocês."
    );
  } else if (q2 === "depende") {
    linhas.push(
      "Hoje muita coisa passa por você. O perfil sugere um passo pequeno que a criança vê e faz com você do lado."
    );
  }

  if (q3 === "imprevisivel") {
    linhas.push("O dia de vocês muda bastante. Por isso a ficha do dia já vem escolhida: uma de cada vez.");
  } else if (q3 === "salvei") {
    linhas.push("Você já guardou atividades e elas ficaram paradas. A de hoje aparece na frente, pronta para imprimir.");
  } else if (q3 === "tela") {
    linhas.push("Quando só a tela acalma, o perfil abre um caminho de papel, curto, para sentar juntos.");
  } else if (q3 === "zero") {
    linhas.push("Cada dia tem começado do zero. A ideia é uma ficha só, sem montar o plano de novo.");
  }

  if (respostas.q1?.key === "2-3") {
    linhas.push("Nesta idade, os cartões grandes e o quadro Primeiro/Depois vêm na frente.");
  }

  const espelho = linhas.slice(0, 2);
  if (respostas.q4?.key === "nao-funcionou") {
    espelho.push("Material sem método não vira rotina. O kit junta a ficha com a ordem do dia.");
  }
  if (linhas[2]) espelho.push(linhas[2]);

  if (respostas.q5?.key === "5-10" && espelho.length < 3) {
    espelho.push("Com o tempo que você tem, cabe uma ficha por dia, sem replanejar nada.");
  } else if (respostas.q5?.key === "15-20" && espelho.length < 3) {
    espelho.push("Quinze minutos por dia cabem no que você marcou: uma ficha, do lado do seu filho.");
  } else if (respostas.q5?.key === "30+" && espelho.length < 3) {
    espelho.push("Você tem uma folga maior. O combinado continua uma ficha por dia, no ritmo da criança.");
  }

  if (respostas.q6?.key === "escola") {
    espelho.push("Este material é um complemento. Não substitui a escola nem o acompanhamento profissional.");
  }

  return espelho;
}

export function nomeCrianca(valor: string): string {
  const limpo = valor.trim();
  return limpo || "seu filho";
}

export type AtividadeBrinde = {
  n: number;
  pilar: PilarId;
  caderno: string;
  titulo: string;
  fazer: string;
  pb: string;
};

const BANCO: Record<PilarId, Omit<AtividadeBrinde, "n" | "pilar">[]> = {
  ler: [
    { caderno: "Pareamento Visual", titulo: "O par da figura", fazer: "Mostre dois cartões iguais e um diferente. Peça para apontar os dois iguais.", pb: "Desenhe três formas simples. A criança circula as duas iguais." },
    { caderno: "Pré-Alfabetização", titulo: "A letra do nome", fazer: "Escreva a primeira letra do nome em tamanho grande. Ela passa o dedo e depois o lápis.", pb: "Letra grande com seta. Tracejado por cima, sem pressa." },
    { caderno: "Alfabetização em Casa", titulo: "Som inicial", fazer: "Fale uma palavra curta (SOL, PÃO, MÃO). Ela escolhe a letra inicial entre três cartões.", pb: "Três letras grandes. Circule a que começa a palavra dita." },
    { caderno: "Pré-Alfabetização", titulo: "Cartão e palavra", fazer: "Um cartão com figura. Vocês falam o nome juntos. Se quiser, ela copia só a primeira letra.", pb: "Espaço para o desenho e uma linha para a primeira letra." },
    { caderno: "Alfabetização em Casa", titulo: "Sílabas da bola", fazer: "Separe BO e LA em dois cartões. Ela junta e fala a palavra.", pb: "Dois retângulos BO e LA para recortar e juntar." },
  ],
  contar: [
    { caderno: "Sequência Numérica", titulo: "Conte com o dedo", fazer: "Três objetos na mesa. Ela conta em voz alta e aponta o cartão do número.", pb: "Três bolinhas para contar e um quadrado para escrever o número." },
    { caderno: "Sequência Numérica", titulo: "O que vem depois", fazer: "Mostre 1 e 2. Pergunte o que vem depois. Ela pega o cartão 3.", pb: "Sequência 1, 2, __ para completar." },
    { caderno: "Formas Geométricas", titulo: "Ache a forma", fazer: "Um cartão de círculo. Ela procura na sala um objeto da mesma forma.", pb: "Três formas. Pinte só o círculo." },
    { caderno: "Sistema Monetário", titulo: "Qual vale mais", fazer: "Duas moedas de brinquedo ou desenhadas. Ela aponta a maior, sem conta de verdade.", pb: "Duas moedas desenhadas. Circule a maior." },
    { caderno: "Sequência Numérica vol. 2", titulo: "Fileira até 5", fazer: "Montem a fileira 1 a 5 com cartões, na ordem, no tempo de vocês.", pb: "Cinco quadrados para numerar de 1 a 5." },
  ],
  sentir: [
    { caderno: "Emoções e Escolhas", titulo: "Como estou agora", fazer: "Quatro rostinhos. Ela aponta o que mais parece com agora. Você aponta o seu também.", pb: "Quatro rostos em contorno para pintar o de hoje." },
    { caderno: "Emoções e Escolhas", titulo: "Eu escolho", fazer: "Duas opções reais e pequenas (maçã ou banana, lápis azul ou verde). Ela aponta o cartão.", pb: "Dois quadrados. Ela marca um com um X." },
    { caderno: "Emoções e Escolhas", titulo: "O corpo avisa", fazer: "Aponte no cartão: cabeça, barriga, mãos. Pergunte onde a emoção aparece, sem forçar resposta.", pb: "Silhueta simples. Ela circula um lugar do corpo." },
    { caderno: "Emoções e Escolhas", titulo: "Cartão de pausa", fazer: "Combinem um cartão de pausa. Quando aparecer, vocês respiram juntos uma vez.", pb: "Um cartão com a palavra PAUSA para recortar." },
    { caderno: "Emoções e Escolhas", titulo: "Terminou e senti", fazer: "No fim da ficha, ela escolhe um rostinho de como foi o momento.", pb: "Dois rostos no rodapé. Pinte um." },
  ],
  organizar: [
    { caderno: "Cartões do Dia a Dia", titulo: "Primeiro e depois", fazer: "Dois cartões grandes: o que acontece primeiro e o que vem depois. Mostre antes de trocar de atividade.", pb: "Dois quadros: PRIMEIRO e DEPOIS. Desenhe ou cole." },
    { caderno: "Rotina Visual", titulo: "Quadro da manhã", fazer: "Três passos da manhã de vocês, em cartões grandes, na ordem real da casa.", pb: "Três linhas para numerar 1, 2 e 3." },
    { caderno: "Cartões do Dia a Dia", titulo: "Cartão agora", fazer: "Um cartão só do que estão fazendo agora. Quando acabar, virem o cartão juntos.", pb: "Um retângulo grande escrito AGORA." },
    { caderno: "Rotina Visual", titulo: "Onde guarda", fazer: "Escolham um lugar fixo para o quadro. A criança ajuda a colar ou apoiar.", pb: "Desenho de uma porta ou geladeira para marcar o lugar." },
    { caderno: "Cartões do Dia a Dia", titulo: "Fim deste passo", fazer: "Um cartão de “acabou”. Ela coloca em cima quando o passo termina.", pb: "Cartão ACABOU para recortar." },
  ],
  criar: [
    { caderno: "Cores", titulo: "A cor do cartão", fazer: "Um cartão de cor. Ela procura na mesa algo da mesma cor e coloca do lado.", pb: "Um círculo para pintar da cor combinada." },
    { caderno: "Cores vol. 2", titulo: "Duas cores", fazer: "Duas cores só. Ela pinta um lado de cada, sem terminar a folha inteira.", pb: "Dois quadrados grandes, um para cada cor." },
    { caderno: "Desenhos de Colorir", titulo: "Colorir um pedaço", fazer: "Um desenho simples. O combinado é colorir só uma parte e parar juntos.", pb: "Contorno de uma estrela para colorir à lápis." },
    { caderno: "Cores", titulo: "Mistura no papel", fazer: "Dois lápis. Ela testa o que acontece quando um passa por cima do outro.", pb: "Uma faixa para cobrir com duas cores." },
    { caderno: "Desenhos de Colorir", titulo: "O desenho do dia", fazer: "Ela escolhe o desenho. Vocês sentam o tempo da ficha e guardam o resto para outro dia.", pb: "Contorno de uma casa simples." },
  ],
};

export function montarBrinde(pilar: PilarId): AtividadeBrinde[] {
  const ordem: PilarId[] = ["ler", "contar", "sentir", "organizar", "criar"];
  const principais = BANCO[pilar].slice(0, 5).map((item) => ({ ...item, pilar }));
  const outros = ordem.filter((id) => id !== pilar);
  const espalhadas = outros.map((id) => ({ ...BANCO[id][0], pilar: id }));
  const extraId = outros[0];
  const extra = { ...BANCO[extraId][1], pilar: extraId };
  return [...principais, ...espalhadas, extra].map((item, index) => ({ ...item, n: index + 1 }));
}

export function idadeNumero(age: string | null | undefined): number | null {
  if (age === "2-3") return 3;
  if (age === "4-5") return 5;
  if (age === "6-8") return 7;
  if (age === "9-10") return 8;
  return null;
}

export function sugerirPrimeira<
  T extends {
    id: string;
    title: string;
    category: string;
    duration_min: number;
    age_min: number;
    age_max: number;
    audience?: string;
    tags?: string[];
  },
>(activities: T[], pillar: string | null | undefined, age: string | null | undefined): T | null {
  const familia = activities.filter((a) => !a.audience || a.audience === "familia");
  if (familia.length === 0) return null;
  const idade = idadeNumero(age);
  const cats = PILARES.find((p) => p.id === pillar)?.categorias ?? null;
  let best: T | null = null;
  let bestScore = -1;
  for (const item of familia) {
    let score = 0;
    if (cats?.includes(item.category)) score += 5;
    if (idade !== null && item.age_min <= idade && idade <= item.age_max) score += 4;
    else if (idade !== null && item.age_min <= idade + 1) score += 1;
    const tags = item.tags ?? [];
    if (age === "2-3") {
      if (item.category === "Rotinas" || tags.some((tag) => /rotina|cartao|manha/.test(tag))) score += 3;
      if (item.age_min <= 3) score += 2;
    }
    if (item.duration_min <= 10) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

export function reais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

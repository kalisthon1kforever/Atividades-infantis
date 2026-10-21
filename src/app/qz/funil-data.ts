export type QuizStep = "q1" | "q2" | "q3" | "q4" | "q5" | "q6";
export type FunnelStep = QuizStep | "captura" | "amostra" | "oferta" | "checkout" | "acesso";
export type Answers = Partial<Record<QuizStep, { key: string; label: string }>>;

const FALLBACK =
  "Faz total sentido. Você está no caminho certo — vamos te ajudar com o próximo passo.";

const FEEDBACK: Record<string, string> = {
  "q1:*":
    "Você não está sozinho(a) — a maioria dos pais que faz este quiz escolhe essa opção também. 💙",
  "q2:ideias":
    "Faz total sentido. A maioria dos pais não sabe por onde começar — e é exatamente por isso que este kit existe.",
  "q2:corrida":
    "A resposta mais comum aqui. Você não precisa de mais tempo — precisa de atividades que caibam no tempo que você tem.",
  "q2:escolher":
    "É o que mais ouvimos. Com o material organizado por categoria, escolher fica simples.",
  "q2:interesse":
    "Clássico! Crianças se engajam quando a atividade é curta e visual. Vamos te ajudar com isso.",
  "q2:organizado":
    "Exato. O problema quase nunca é a vontade — é a bagunça do material espalhado.",
  "q3:5-10":
    "Perfeito! Atividades de 5 a 10 minutos são as que mais geram resultado com crianças pequenas.",
  "q3:10-20":
    "Ótimo intervalo. Dá para fazer uma atividade completa, sem pressa e sem alongar demais.",
  "q3:20+":
    "Que bom que você tem esse tempo. O kit também funciona em sessões curtas, no ritmo da criança.",
  "q3:sem-rotina":
    "Ótimo que você está aqui então. Vamos te entregar uma sequência pronta para seguir — sem precisar pensar no “quando”.",
  "q4:*":
    "Boa escolha — e uma das mais populares entre as famílias que usam o kit.",
  "q5:imprimir":
    "Você pensa como a maioria: printar e usar na hora, sem preparação.",
  "q5:passo":
    "Combinamos. Um passo a passo simples tira o peso de “por onde eu começo?”.",
  "q5:sequencia":
    "Perfeito. Uma sequência pronta evita a indecisão e cria constância.",
  "q5:variedade":
    "Faz sentido. Variar o tema ajuda a criança a não enjoar.",
  "q5:tudo":
    "Combinamos. Nada de procurar arquivo por arquivo — tudo centralizado.",
  "q6:*": "Anotado! Vamos usar isso no seu resultado.",
};

export const MOTIVATION: Partial<Record<QuizStep, string>> = {
  q4: "Você está indo muito bem!",
  q5: "Quase lá — última pergunta!",
};

export function inferAnswerKey(step: QuizStep, label: string, explicit?: string): string {
  if (explicit) return explicit;
  const t = label.toLowerCase();

  if (step === "q1") {
    if (t.includes("ideias")) return "ideias";
    if (t.includes("brincando") || t.includes("juntos")) return "juntos";
    if (t.includes("habilidade")) return "habilidades";
    if (t.includes("rotina")) return "rotina";
  }
  if (step === "q2") {
    if (t.includes("sem ideias") || t.includes("o que fazer")) return "ideias";
    if (t.includes("corrida")) return "corrida";
    if (t.includes("escolher")) return "escolher";
    if (t.includes("interesse")) return "interesse";
    if (t.includes("organizado") || t.includes("materiais")) return "organizado";
    if (t.includes("materiais")) return "organizado";
  }
  if (step === "q3") {
    if (t.includes("5 a 10") || t.includes("5 a 10")) return "5-10";
    if (t.includes("10 a 20")) return "10-20";
    if (t.includes("mais de 20")) return "20+";
    if (t.includes("não tenho") || t.includes("rotina definida")) return "sem-rotina";
  }
  if (step === "q4") {
    if (t.includes("figura") || t.includes("associação")) return "figuras";
    if (t.includes("letra") || t.includes("história")) return "letras";
    if (t.includes("número") || t.includes("quantidade")) return "numeros";
    if (t.includes("desenhar") || t.includes("mãos") || t.includes("maos")) return "maos";
    if (t.includes("descobrindo")) return "descobrindo";
  }
  if (step === "q5") {
    if (t.includes("imprimir")) return "imprimir";
    if (t.includes("passo a passo")) return "passo";
    if (t.includes("sequência") || t.includes("sequencia")) return "sequencia";
    if (t.includes("variedade")) return "variedade";
    if (t.includes("só lugar") || t.includes("um só")) return "tudo";
  }
  if (step === "q6") {
    if (t.includes("essencial")) return "essencial";
    if (t.includes("variar")) return "variar";
    if (t.includes("rotina")) return "rotina";
    if (t.includes("profissional")) return "profissional";
    if (t.includes("completo")) return "completo";
  }
  return "outro";
}

export function feedbackFor(step: QuizStep, key: string): { body: string; extra?: string } {
  const specific = FEEDBACK[`${step}:${key}`];
  const any = FEEDBACK[`${step}:*`];
  return {
    body: specific || any || FALLBACK,
    extra: MOTIVATION[step],
  };
}

export function startCategory(q4?: string): { title: string; note: string } {
  switch (q4) {
    case "figuras":
      return {
        title: "Atenção visual e associação",
        note: "Comece pelas fichas de figuras, cores e jogos de associação — é o jeito mais leve de engajar.",
      };
    case "letras":
      return {
        title: "Pré-alfabetização",
        note: "Letras, palavras e histórias: o melhor ponto de partida para o momento de vocês.",
      };
    case "numeros":
      return {
        title: "Matemática visual",
        note: "Números, quantidades e formas, com atividades curtas e bem visuais.",
      };
    case "maos":
      return {
        title: "Coordenação motora",
        note: "Labirintos, picotados e recortes para usar as mãos e manter o foco.",
      };
    default:
      return {
        title: "um mix das categorias",
        note: "Como vocês ainda estão descobrindo, o kit mistura atenção, letras, números e motor para testar o que cola.",
      };
  }
}

export function diagnosisParagraphs(answers: Answers): string[] {
  const q2 = answers.q2?.key;
  const q3 = answers.q3?.key;
  const q5 = answers.q5?.key;
  const q4 = startCategory(answers.q4?.key);
  const lines: string[] = [];

  if (q2 === "corrida" && q3 === "5-10") {
    lines.push(
      "Você tem pouco tempo entre as obrigações do dia — e o Kit Inicial foi feito exatamente para isso: atividades de 5 a 10 minutos, prontas para imprimir, sem preparação."
    );
  } else if (q2 === "corrida") {
    lines.push(
      "Sua rotina é corrida. O kit entra nos vãos do dia: imprimiu, sentou com a criança, fez — sem montar material."
    );
  } else if (q2 === "ideias" || q2 === "escolher") {
    lines.push(
      "O que trava não é a vontade de fazer: é não saber por onde começar. O kit já vem organizado por categoria, para você só escolher e imprimir."
    );
  } else if (q2 === "interesse") {
    lines.push(
      "Quando a atividade é longa ou pouco visual, a criança desliga. As fichas são curtas, coloridas e pensadas para prender o olhar."
    );
  } else if (q2 === "organizado") {
    lines.push(
      "Material espalhado cansa. Aqui tudo fica em um só lugar, com versão para imprimir — inclusive em preto e branco, mais econômica."
    );
  } else {
    lines.push(
      "Pelas suas respostas, atividades práticas, organizadas e fáceis de usar são o melhor jeito de começar em casa."
    );
  }

  if (q3 === "sem-rotina") {
    lines.push(
      "Você ainda não tem um horário fixo — e tudo bem. Tem sequência pronta e rotina visual em figuras para encaixar no dia, sem precisar inventar o “quando”."
    );
  } else if (q3 === "5-10" && q2 !== "corrida") {
    lines.push(
      "Com 5 a 10 minutos já dá para ter um momento completo. Foi nesse recorte que o kit foi pensado."
    );
  }

  if (q5 === "tudo") {
    lines.push(
      "Você pediu tudo em um só lugar: as atividades ficam no PDF para imprimir, com caminho para app ou navegador no Acesso Total."
    );
  } else if (q5 === "imprimir") {
    lines.push(
      "Você quer printar e usar na hora. É exatamente o formato do Kit Inicial — inclusive com versão em preto e branco."
    );
  }

  lines.push(`Para começar, recomendamos: ${q4.title}. ${q4.note}`);

  return lines.slice(0, 3);
}

export const KIT_CATEGORIES = [
  "Atenção visual e associação",
  "Pré-alfabetização",
  "Matemática visual",
  "Coordenação motora (labirintos, picotados, recortes)",
  "Emoções e escolhas (termômetro das emoções, cartões de sentimentos)",
  "Rotinas e organização (rotina visual em figuras, quadro da manhã)",
  "Bônus: certificado e quadro de conquistas",
  "Versão em preto e branco econômica inclusa",
];

export const ACESSO_TOTAL_ITEMS = [
  "Todas as atividades do Pequenos Passos",
  "Acesso pelo app ou navegador",
  "Materiais sempre atualizados",
  "Rotinas visuais e organização",
  "Recursos extras para professores",
  "Atenção visual e associação",
  "Pré-alfabetização",
  "Matemática visual",
  "Coordenação motora (labirintos, picotados, recortes)",
  "Emoções e escolhas",
  "Bônus: certificado e quadro de conquistas",
  "Versão em preto e branco econômica",
];

export const SOCIAL_PROOF =
  "A maioria das famílias que responde como você começa pelo Kit Inicial.";

export const EXIT_POPUP_KEY = "pp-funil-exit-popup";
export const EXIT_POPUP_DAYS = 7;

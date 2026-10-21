// Espelho do seed em supabase/migrations/20261020000000_area_logada.sql.
// Serve de fallback quando o schema ainda não foi aplicado no Supabase.
import type { CatalogActivityData } from "@/lib/types";

export type CatalogSeed = {
  id: string;
  title: string;
  summary: string;
  category: string;
  duration_min: 5 | 10 | 15;
  age_min: number;
  age_max: number;
  format: "imprimir" | "tela" | "ambos";
  bw: boolean;
  audience: "familia" | "professor";
  product_key: string;
  tags: string[];
  data: CatalogActivityData;
};

export const CATALOG_SEED: CatalogSeed[] = [
  // Amostra (10)
  {
    id: "amostra-01", title: "Ache os iguais", summary: "Circule os dois desenhos que são iguais.",
    category: "Atenção visual", duration_min: 5, age_min: 3, age_max: 5, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["atencao", "observacao"],
    data: { pattern: "ache-iguais", items: ["⭐", "🌙", "⭐", "☀️"] },
  },
  {
    id: "amostra-02", title: "Ligue a cor", summary: "Ligue cada bolinha à palavra da cor.",
    category: "Atenção visual", duration_min: 5, age_min: 3, age_max: 5, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["cores", "associacao"],
    data: { pattern: "ligar-cor", items: ["🔴 vermelho", "🔵 azul", "🟢 verde"] },
  },
  {
    id: "amostra-03", title: "Qual é a letra?", summary: "Pinte a letra que começa a palavra SOL.",
    category: "Letras e sílabas", duration_min: 5, age_min: 4, age_max: 6, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["letras", "silabico"],
    data: { pattern: "pintar-letra", palavra: "SOL", items: ["A", "S", "M", "P"] },
  },
  {
    id: "amostra-04", title: "Quanto tem?", summary: "Conte e escreva o número.",
    category: "Números e quantidades", duration_min: 5, age_min: 4, age_max: 6, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["numeros", "contar"],
    data: { pattern: "contar", grupos: [{ icon: "🍎", qtd: 3 }] },
  },
  {
    id: "amostra-05", title: "Labirinto curto", summary: "Leve o 🐱 até o 🐟 sem sair da linha.",
    category: "Traçado e coordenação", duration_min: 5, age_min: 4, age_max: 7, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["labirinto", "motor"],
    data: { pattern: "labirinto", de: "🐱", ate: "🐟" },
  },
  {
    id: "amostra-06", title: "Picote a linha", summary: "Recorte em cima dos pontinhos, bem devagar.",
    category: "Traçado e coordenação", duration_min: 5, age_min: 4, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["recorte", "picotado"],
    data: { pattern: "picotado" },
  },
  {
    id: "amostra-07", title: "Como você está hoje?", summary: "Pinte o rostinho que mais parece com você agora.",
    category: "Emoções", duration_min: 5, age_min: 3, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["emocoes", "escolha"],
    data: { pattern: "emocoes", rosto: ["😊", "😐", "😢", "😡"] },
  },
  {
    id: "amostra-08", title: "Ordem da manhã", summary: "Numere de 1 a 3 a ordem que você faz em casa.",
    category: "Rotinas", duration_min: 5, age_min: 4, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["rotina", "sequencia"],
    data: { pattern: "rotina-ordem", passos: ["🪥 Escovar os dentes", "👕 Vestir a roupa", "🥣 Café da manhã"] },
  },
  {
    id: "amostra-09", title: "Nomeie a figura", summary: "Fale o nome em voz alta e tente escrever a primeira letra.",
    category: "Vocabulário", duration_min: 5, age_min: 3, age_max: 7, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["vocabulario", "letras"],
    data: { pattern: "nomear-figura", figuras: ["🦋", "🏠", "🎈"] },
  },
  {
    id: "amostra-10", title: "Estrela do dia", summary: "Coloriu e terminou? Pinte a estrela — você conseguiu!",
    category: "Atenção visual", duration_min: 5, age_min: 3, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "amostra", tags: ["conquista"],
    data: { pattern: "estrela-dia" },
  },

  // Kit inicial — Atenção visual
  {
    id: "kit-diferencas", title: "Diferenças na fazenda", summary: "Encontre as 3 diferenças entre os dois quadros.",
    category: "Atenção visual", duration_min: 10, age_min: 4, age_max: 7, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["diferencas", "atencao"],
    data: { pattern: "diferencas", tema: "fazenda", qtd: 3 },
  },
  {
    id: "kit-cores-iguais", title: "Casinha das cores", summary: "Guie cada bolinha até a casinha da mesma cor.",
    category: "Atenção visual", duration_min: 10, age_min: 3, age_max: 5, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["cores", "associacao"],
    data: { pattern: "ligar-cor", items: ["🔴 vermelho", "🔵 azul", "🟢 verde", "🟡 amarelo"] },
  },

  // Kit inicial — Traçado e coordenação
  {
    id: "kit-labirinto-sapo", title: "Labirinto do sapinho",
    summary: "Ajude o sapinho 🐸 a alcançar o laginho, sem sair da linha.",
    category: "Traçado e coordenação", duration_min: 10, age_min: 4, age_max: 7, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["labirinto", "motor"],
    data: { pattern: "labirinto", de: "🐸", ate: "💧" },
  },
  {
    id: "kit-tracejado-ondas", title: "Tracejado de ondas",
    summary: "Complete as ondas com o lápis, da esquerda para a direita.",
    category: "Traçado e coordenação", duration_min: 10, age_min: 4, age_max: 6, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["tracejado", "motor"],
    data: { pattern: "tracejado", linhas: ["~~~~~~", "◠◠◠◠", "〰〰〰〰"] },
  },
  {
    id: "kit-recorte-camadas", title: "Recorte as fitas", summary: "Recorte cada fita na linha pontilhada até o fim.",
    category: "Traçado e coordenação", duration_min: 10, age_min: 5, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["recorte", "picotado"],
    data: { pattern: "picotado" },
  },

  // Kit inicial — Letras e sílabas
  {
    id: "kit-tracejado-letras", title: "Tracejado das letras", summary: "Trace as letras A, B e C bem devagar.",
    category: "Letras e sílabas", duration_min: 10, age_min: 4, age_max: 6, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["letras", "tracejado"],
    data: { pattern: "tracejado", linhas: ["AAA", "CCC", "VVV"] },
  },
  {
    id: "kit-silaba", title: "Qual é a sílaba?", summary: "Pinte a sílaba que falta em cada palavra.",
    category: "Letras e sílabas", duration_min: 10, age_min: 5, age_max: 7, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["silabas", "leitura"],
    data: {
      pattern: "silaba",
      pares: [
        { hidden: "BO", shown: "LA", palavra: "BOLA", emoji: "⚽" },
        { hidden: "SA", shown: "PO", palavra: "SAPO", emoji: "🐸" },
        { hidden: "VE", shown: "LA", palavra: "VELA", emoji: "🕯️" },
      ],
      opcoes: ["BO", "SA", "VE"],
    },
  },

  // Kit inicial — Palavras e leitura
  {
    id: "kit-cartoes", title: "Cartões ilustrados", summary: "Recorte os cartões e leia cada palavra com calma.",
    category: "Palavras e leitura", duration_min: 10, age_min: 5, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["vocabulario", "cartoes"],
    data: {
      pattern: "wordcards",
      cartoes: [
        { word: "MALA", syllables: ["MA", "LA"], emoji: "👜" },
        { word: "SAPO", syllables: ["SA", "PO"], emoji: "🐸" },
        { word: "BOLA", syllables: ["BO", "LA"], emoji: "⚽" },
        { word: "UVA", syllables: ["U", "VA"], emoji: "🍇" },
        { word: "GATO", syllables: ["GA", "TO"], emoji: "🐱" },
        { word: "CASA", syllables: ["CA", "SA"], emoji: "🏠" },
      ],
    },
  },
  {
    id: "kit-copie", title: "Copie a palavra", summary: "Escreva cada palavra na linha, letra por letra.",
    category: "Palavras e leitura", duration_min: 10, age_min: 5, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["leitura", "escrita"],
    data: { pattern: "copiar", palavras: ["CASA", "BOLO", "SAPO", "OVO"] },
  },

  // Kit inicial — Números e quantidades
  {
    id: "kit-contar", title: "Conte as maçãs", summary: "Conte quantas maçãs há em cada grupo e escreva.",
    category: "Números e quantidades", duration_min: 10, age_min: 4, age_max: 6, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["numeros", "contar"],
    data: { pattern: "contar-multiplo", grupos: [{ icon: "🍎", qtd: 4 }, { icon: "🍓", qtd: 2 }, { icon: "🍇", qtd: 5 }] },
  },
  {
    id: "kit-sequencia", title: "Que vem depois?", summary: "Complete a sequência com o número que falta.",
    category: "Números e quantidades", duration_min: 10, age_min: 5, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["numeros", "sequencia"],
    data: { pattern: "sequencia", numeros: ["1", "2", "__", "4", "__", "6"] },
  },

  // Kit inicial — Emoções
  {
    id: "kit-termometro", title: "Termômetro das emoções",
    summary: "Marque no termômetro de 1 a 5 o número que diz o quanto você sentiu hoje.",
    category: "Emoções", duration_min: 10, age_min: 4, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["emocoes", "avaliacao"],
    data: { pattern: "termometro" },
  },
  {
    id: "kit-sentimentos", title: "Cartões de sentimentos",
    summary: "Recorte os rostos e brinquem de adivinhar qual é.",
    category: "Emoções", duration_min: 10, age_min: 4, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["emocoes", "cartoes"],
    data: { pattern: "emocoes-cards", rosto: ["😄", "😭", "😠", "😲", "🥰", "😨"] },
  },

  // Kit inicial — Rotinas
  {
    id: "kit-quadro-manha", title: "Quadro da manhã",
    summary: "Recorte e organize na ordem do dia de vocês: escovar, vestir, café, pegar mochila?",
    category: "Rotinas", duration_min: 10, age_min: 4, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["rotina", "manha"],
    data: { pattern: "rotina-cards", passos: ["🪥 Escovar os dentes", "👕 Vestir a roupa", "🥣 Café da manhã", "🎒 Pegar a mochila"] },
  },
  {
    id: "kit-rotina-figuras", title: "Rotina visual em figuras",
    summary: "Cole cada figura no quadro da noite: banho, leitura, cama.",
    category: "Rotinas", duration_min: 10, age_min: 4, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "kit-inicial", tags: ["rotina", "noite"],
    data: { pattern: "rotina-cards", passos: ["🛁 Tomar banho", "📖 Historinha", "🌙 Dormir"] },
  },

  // Bumps
  {
    id: "bump-rotina-semana", title: "Rotina visual da semana",
    summary: "Quadro da semana inteira em figuras, para colar na geladeira.",
    category: "Rotinas", duration_min: 5, age_min: 3, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "rotina-visual", tags: ["rotina", "semana"],
    data: { pattern: "rotina-cards", passos: ["☀️ Manhã", "🏫 Escola", "🌧️ Tarde", "🌙 Noite"] },
  },
  {
    id: "bump-5min-par", title: "5 minutos: ache o par", summary: "Sem tempo? Em 5 minutos ache os pares iguais.",
    category: "Atenção visual", duration_min: 5, age_min: 3, age_max: 6, format: "imprimir",
    bw: true, audience: "familia", product_key: "mini-kit-5-min", tags: ["par", "atencao"],
    data: { pattern: "ache-iguais", items: ["🐠", "🐢", "🐠", "🐢"] },
  },
  {
    id: "bump-5min-sequencias", title: "5 minutos: sequências",
    summary: "Sem tempo? Complete as sequências em preto e branco.",
    category: "Números e quantidades", duration_min: 5, age_min: 5, age_max: 8, format: "imprimir",
    bw: true, audience: "familia", product_key: "mini-kit-5-min", tags: ["sequencia", "numeros"],
    data: { pattern: "sequencia", numeros: ["🌙", "⭐", "🌙", "__", "🌙", "⭐"] },
  },
  {
    id: "bump-cartoes-vocab", title: "Cartões ilustrados: dia a dia",
    summary: "12 palavras novas para recortar e aprender juntinhos.",
    category: "Vocabulário", duration_min: 5, age_min: 3, age_max: 7, format: "imprimir",
    bw: true, audience: "familia", product_key: "cartoes-vocabulario", tags: ["vocabulario", "cartoes"],
    data: {
      pattern: "wordcards",
      cartoes: [
        { word: "UVA", syllables: ["U", "VA"], emoji: "🍇" },
        { word: "RATO", syllables: ["RA", "TO"], emoji: "🐭" },
        { word: "NUVEM", syllables: ["NU", "VEM"], emoji: "☁️" },
        { word: "DADO", syllables: ["DA", "DO"], emoji: "🎲" },
        { word: "PATO", syllables: ["PA", "TO"], emoji: "🦆" },
        { word: "ESTRELA", syllables: ["ES", "TRE", "LA"], emoji: "⭐" },
        { word: "VACA", syllables: ["VA", "CA"], emoji: "🐄" },
        { word: "FOCA", syllables: ["FO", "CA"], emoji: "🦭" },
        { word: "TATU", syllables: ["TA", "TU"], emoji: "🦡" },
        { word: "JACA", syllables: ["JA", "CA"], emoji: "🍈" },
        { word: "KIWI", syllables: ["KI", "WI"], emoji: "🥝" },
        { word: "LATA", syllables: ["LA", "TA"], emoji: "🥫" },
      ],
    },
  },

  // Professores (só com acesso-total)
  {
    id: "prof-plano-15", title: "Plano de aula de 15 minutos",
    summary: "Sequência pronta para turminha pequena: abertura, atividade, fechamento.",
    category: "Professores", duration_min: 15, age_min: 4, age_max: 8, format: "tela",
    bw: false, audience: "professor", product_key: "professores", tags: ["plano", "professor"],
    data: {
      pattern: "professor-plan",
      partes: [
        { titulo: "Abertura", linhas: ["Pergunte às crianças: quem brincou com figuras em casa?", "Mostre 2 fichas do kit no quadro"] },
        { titulo: "Atividade", linhas: ["Entregue 2 fichas por criança", "Depois de 5 minutos, troque com o amiguinho ao lado"] },
        { titulo: "Fechamento", linhas: ["Cada criança mostra o que fez", "Celebre a participação, sem corrigir na frente da turma"] },
      ],
    },
  },
  {
    id: "prof-acompanhamento", title: "Acompanhamento da turma",
    summary: "Checklist simples para registrar o caminho de cada criança na semana.",
    category: "Professores", duration_min: 10, age_min: 4, age_max: 8, format: "tela",
    bw: false, audience: "professor", product_key: "professores", tags: ["checklist", "professor"],
    data: {
      pattern: "professor-plan",
      partes: [
        {
          titulo: "Checklist",
          linhas: [
            "[ ] escolheu a ficha sozinho?",
            "[ ] tentou o traçado com calma?",
            "[ ] contou as peças direito?",
            "[ ] mostrou o resultado para alguém?",
          ],
        },
        { titulo: "Como usar", linhas: ["Uma linha por criança por semana. O registro é da presença: o que ela viveu conta mais que o acerto."] },
      ],
    },
  },
];

// Trilha de 30 dias: ciclo de categorias para escolher a atividade do dia
export const TRAIL_CYCLE = [
  "Atenção visual",
  "Traçado e coordenação",
  "Letras e sílabas",
  "Palavras e leitura",
  "Números e quantidades",
  "Emoções",
  "Rotinas",
] as const;

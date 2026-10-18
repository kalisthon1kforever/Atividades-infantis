export type Deliverable = {
  title: string;
  description: string;
  icon: "pages" | "activities" | "cards" | "guide" | "checklist" | "pdf";
};

export const deliverables: Deliverable[] = [
  {
    title: "119 páginas de material digital",
    description:
      "Um conjunto extenso de páginas prontas para imprimir em folhas A4, organizadas por habilidade.",
    icon: "pages",
  },
  {
    title: "100 atividades educativas",
    description:
      "Atividades variadas para praticar atenção, traçado, letras, palavras e números em momentos curtos.",
    icon: "activities",
  },
  {
    title: "20 cartões de palavras",
    description:
      "Cartões para recortar, com sílabas separadas no topo, ilustração central e palavra na base.",
    icon: "cards",
  },
  {
    title: "Guia de apoio para os responsáveis",
    description:
      "Orientações práticas para escolher, apresentar e acompanhar as atividades com tranquilidade.",
    icon: "guide",
  },
  {
    title: "Checklist de acompanhamento",
    description:
      "Um roteiro simples para registrar o que já foi explorado e escolher o próximo passo sem esforço.",
    icon: "checklist",
  },
  {
    title: "Material em PDF para usar em casa",
    description:
      "Após a confirmação do pagamento, você baixa o material e imprime as páginas que quiser, quantas vezes quiser.",
    icon: "pdf",
  },
];

export type Module = {
  number: number;
  title: string;
  activities: string;
  description: string;
  skills: string[];
  preview: "attention" | "trace" | "letters" | "words" | "numbers";
};

export const modules: Module[] = [
  {
    number: 1,
    title: "Atenção Visual",
    activities: "20 atividades",
    description:
      "Encontrar diferenças, comparar e observar formas, animais, frutas, objetos, letras, números, direções, tamanhos, cores, sombras e padrões.",
    skills: ["Observar", "Comparar", "Encontrar diferenças"],
    preview: "attention",
  },
  {
    number: 2,
    title: "Traçado e Coordenação",
    activities: "20 atividades",
    description:
      "Caminhos, labirintos, linhas, espirais, zigue-zague, numerais, recorte, quebra-cabeça e ligue os pontos.",
    skills: ["Traçar", "Coordenar", "Recortar"],
    preview: "trace",
  },
  {
    number: 3,
    title: "Letras e Sílabas",
    activities: "20 atividades",
    description:
      "Alfabeto ilustrado, tracejado das letras, vogais, maiúsculas, minúsculas e identificação de sílabas.",
    skills: ["Reconhecer letras", "Vogais", "Sílabas"],
    preview: "letters",
  },
  {
    number: 4,
    title: "Palavras e Leitura",
    activities: "20 atividades",
    description:
      "Palavra, sílaba, frase, leitura apoiada, cópia, associação entre figura e palavra, palavras escondidas e ordem da história.",
    skills: ["Ler", "Copiar", "Associar"],
    preview: "words",
  },
  {
    number: 5,
    title: "Números e Quantidades",
    activities: "20 atividades",
    description:
      "Contar, comparar, ordenar, associar numeral e quantidade, observar sequências e praticar noções iniciais de adição e subtração.",
    skills: ["Contar", "Sequências", "Números"],
    preview: "numbers",
  },
];

export type WordCard = { word: string; syllables: string[]; emoji: string };

export const wordCards: WordCard[] = [
  { word: "MALA", syllables: ["MA", "LA"], emoji: "👜" },
  { word: "NUVEM", syllables: ["NU", "VEM"], emoji: "☁️" },
  { word: "OVO", syllables: ["O", "VO"], emoji: "🥚" },
  { word: "SAPO", syllables: ["SA", "PO"], emoji: "🐸" },
  { word: "TATU", syllables: ["TA", "TU"], emoji: "🦡" },
  { word: "UVA", syllables: ["U", "VA"], emoji: "🍇" },
  { word: "AVIÃO", syllables: ["A", "VI", "ÃO"], emoji: "✈️" },
  { word: "BOLA", syllables: ["BO", "LA"], emoji: "⚽" },
  { word: "CASA", syllables: ["CA", "SA"], emoji: "🏠" },
  { word: "DADO", syllables: ["DA", "DO"], emoji: "🎲" },
  { word: "ESTRELA", syllables: ["ES", "TRE", "LA"], emoji: "⭐" },
  { word: "FOCA", syllables: ["FO", "CA"], emoji: "🦭" },
  { word: "GATO", syllables: ["GA", "TO"], emoji: "🐱" },
  { word: "ILHA", syllables: ["I", "LHA"], emoji: "🏝️" },
  { word: "JACA", syllables: ["JA", "CA"], emoji: "🍈" },
  { word: "KIWI", syllables: ["KI", "WI"], emoji: "🥝" },
  { word: "LATA", syllables: ["LA", "TA"], emoji: "🥫" },
  { word: "PATO", syllables: ["PA", "TO"], emoji: "🦆" },
  { word: "RATO", syllables: ["RA", "TO"], emoji: "🐭" },
  { word: "VACA", syllables: ["VA", "CA"], emoji: "🐄" },
];

export const steps = [
  {
    number: 1,
    title: "Baixe e imprima",
    description:
      "Após a confirmação do pagamento, você recebe o material em PDF. Imprima só as páginas que pretende usar.",
  },
  {
    number: 2,
    title: "Escolha pela habilidade",
    description:
      "Consulte os módulos e encontre uma proposta adequada para aquele momento — atenção, traçado, letras, palavras ou números.",
  },
  {
    number: 3,
    title: "Faça junto com seu filho",
    description:
      "Apresente a atividade, acompanhe a tentativa, ajude quando necessário e celebre a participação.",
  },
];

export const usagePrinciples = [
  "Escolher juntos a atividade do dia",
  "Mostrar o que será feito, sem pressa",
  "Fazer junto, acompanhando o ritmo da criança",
  "Celebrar a participação, não a perfeição",
];

export const forWhom = [
  "Pais e responsáveis que querem participar da aprendizagem das crianças",
  "Famílias que procuram atividades imprimíveis para fazer em casa",
  "Adultos que desejam alternativas às telas e mais organização",
  "Quem prefere acompanhar o processo no ritmo da criança",
];

export const notForWhom = [
  "Quem procura alfabetização garantida em determinado prazo",
  "Quem espera que o material substitua a escola",
  "Quem procura um produto que dispense a participação do adulto",
];

export const problemPoints = [
  {
    title: "Salvou, mas nunca usou",
    description:
      "Atividades guardadas no celular ou no computador que ficam esperando um momento que nunca chega.",
  },
  {
    title: "Falta de tempo para preparar",
    description:
      "Montar material do zero exige tempo e energia que nem sempre sobram no fim do dia.",
  },
  {
    title: "Qual atividade escolher hoje?",
    description:
      "Sem uma organização por habilidade, é difícil saber qual proposta faz sentido agora.",
  },
  {
    title: "Quer alternativas às telas",
    description:
      "Momentos com papel e lápis ajudam a equilibrar o dia, sem precisar abrir mais um aplicativo.",
  },
  {
    title: "Medo de virar cobrança",
    description:
      "Aprender pode ser leve. O material foi pensado para acompanhar, sem transformar a atividade em pressão.",
  },
];

export const solutionBenefits = [
  {
    title: "Escolha pela habilidade",
    description:
      "Cada módulo reúne atividades de uma habilidade. Você decide se o momento é de atenção, traçado, letras, palavras ou números.",
  },
  {
    title: "Imprima só o que for usar",
    description:
      "O material chega em PDF. Você imprime apenas as páginas escolhidas, no momento em que quiser usá-las.",
  },
  {
    title: "Cerca de 15 minutos juntos",
    description:
      "Reserve um tempo curto, apresente a atividade e siga o interesse e o ritmo da criança, sem obrigação de concluir tudo.",
  },
];

export type FaqItem = { question: string; answer: string };

export const faq: FaqItem[] = [
  {
    question: "Preciso de uma impressora colorida?",
    answer:
      "Não. O material foi pensado para impressão em folhas A4 e pode ser utilizado em preto e branco. Cores podem deixar as páginas mais atrativas, mas não são necessárias.",
  },
  {
    question: "Para qual idade o material é indicado?",
    answer:
      "O kit foi pensado para crianças aproximadamente de 3 a 8 anos, em fase inicial de aprendizagem. Como cada criança tem seu ritmo, o mais importante é acompanhar o interesse e a disposição da criança.",
  },
  {
    question: "Preciso acompanhar meu filho durante as atividades?",
    answer:
      "Sim. O material foi desenhado para ser feito com a participação de um adulto: escolher a atividade, apresentar, acompanhar a tentativa e celebrar a participação.",
  },
  {
    question: "Como recebo o material depois da compra?",
    answer:
      "Após a confirmação do pagamento, você recebe o acesso para baixar o material em PDF e imprimir as páginas que quiser.",
  },
  {
    question: "Posso imprimir as páginas novamente?",
    answer:
      "Sim. O material é para uso pessoal da família, com impressão ilimitada. Você pode reimprimir as páginas sempre que precisar.",
  },
  {
    question: "E se meu filho não quiser fazer uma atividade?",
    answer:
      "Tudo bem. Você pode simplificar a proposta, fazer uma pausa ou tentar novamente em outro momento. Não há obrigação de concluir todas as páginas — o material acompanha o ritmo da criança.",
  },
  {
    question: "Quais materiais preciso para utilizar o kit?",
    answer:
      "Papel A4, uma impressora (colorida ou preto e branco), lápis e canetas de cores. Para os cartões de palavras, uma tesoura — com o cuidado de um adulto no recorte.",
  },
  {
    question: "O material substitui a escola ou o acompanhamento profissional?",
    answer:
      "Não. O kit é um material educativo complementar, para uso em casa. Ele não substitui a escola nem acompanhamento profissional.",
  },
  {
    question: "As atividades são feitas na tela ou no papel?",
    answer:
      "No papel. O produto é pensado para imprimir e usar em atividades fora das telas. A tela entra apenas para baixar o arquivo após a compra.",
  },
];

export type GalleryImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const galleryRowA: GalleryImage[] = [
  {
    src: "/images/atividades-prontas.jpg",
    alt: "Atividades prontas para imprimir com letras, números, atenção e rotina",
    width: 1122,
    height: 1094,
  },
  {
    src: "/images/atividade-formas-2.jpg",
    alt: "Capa da atividade da semana: formas iguais, para imprimir, conectar e comemorar",
    width: 960,
    height: 1200,
  },
  {
    src: "/images/aprender-amor.jpg",
    alt: "Mãe e filha fazendo uma atividade educativa juntas na mesa de casa",
    width: 1200,
    height: 1200,
  },
  {
    src: "/images/kit-completo.jpg",
    alt: "Capa do kit completo com a lista de entregáveis e amostras das atividades",
    width: 1024,
    height: 1076,
  },
];

export const galleryRowB: GalleryImage[] = [
  {
    src: "/images/atividades-fazer-hoje.jpg",
    alt: "Atividades para fazer hoje, sem preparar nada do zero",
    width: 1122,
    height: 1066,
  },
  {
    src: "/images/oferta-capas.jpg",
    alt: "Poster do kit Pequenos Passos — Alfabetização em Casa com módulos e cartões",
    width: 849,
    height: 1200,
  },
  {
    src: "/images/atividade-formas.jpg",
    alt: "Atividade da semana de formas iguais para crianças de 3 a 8 anos",
    width: 675,
    height: 1200,
  },
  {
    src: "/images/pequenos-passos-poster.jpg",
    alt: "Poster do kit Pequenos Passos com os cinco módulos e os cartões de palavras",
    width: 849,
    height: 1200,
  },
];

export type FeatureIcon =
  | "pages"
  | "activities"
  | "cards"
  | "guide"
  | "checklist"
  | "pdf"
  | "clock"
  | "star";

export type Feature = {
  icon: FeatureIcon;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: "checklist",
    title: "Escolha pela habilidade",
    description:
      "Atenção, traçado, letras, palavras e números ficam em módulos separados. Você sabe exatamente o que está praticando naquele dia.",
  },
  {
    icon: "clock",
    title: "Nada de preparar do zero",
    description:
      "Abra o PDF, escolha a página e imprima. Em poucos minutos você já está sentado ao lado do seu filho.",
  },
  {
    icon: "star",
    title: "15 minutos já valem o dia",
    description:
      "O material foi pensado para momentos curtos: apresente a atividade, acompanhe e celebre a participação.",
  },
  {
    icon: "pages",
    title: "Reimprima quantas vezes quiser",
    description:
      "Uso pessoal com impressão ilimitada: a página favorita pode ser refeita quantas vezes a criança quiser.",
  },
];

export type IdealTile = {
  icon: FeatureIcon;
  title: string;
  description: string;
};

export const idealTiles: IdealTile[] = [
  {
    icon: "pages",
    title: "Pais e responsáveis presentes",
    description: "Que querem participar da aprendizagem com material pronto e organizado.",
  },
  {
    icon: "cards",
    title: "Menos telas, mais papel",
    description: "Famílias que buscam alternativas com papel, lápis e presença.",
  },
  {
    icon: "clock",
    title: "Rotinas corridas",
    description: "Quem tem pouco tempo por dia e mesmo assim quer manter o hábito.",
  },
  {
    icon: "star",
    title: "Respeito ao ritmo da criança",
    description: "Quem prefere acompanhar sem transformar a atividade em cobrança.",
  },
];

export const demoMessage =
  "Imagem ilustrativa — mostra como uma avaliação de cliente apareceria neste espaço quando o kit começar a circular. Ainda não temos depoimentos reais para publicar, e não publicamos avaliações inventadas.";

export const reviewsNote =
  "Estes cartões são exemplos ilustrativos marcados com o selo \u201cExemplo ilustrativo\u201d. Quando as primeiras avaliações reais chegarem, publicamos aqui no lugar delas — nada é inventado.";

export const reviewImages: GalleryImage[] = [
  {
    src: "/images/depo-01.jpg",
    alt: "Cartão ilustrativo de depoimento de Rafael M. com selo de exemplo ilustrativo",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/depo-02.jpg",
    alt: "Cartão ilustrativo de depoimento com selo de exemplo ilustrativo",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/depo-03.jpg",
    alt: "Cartão ilustrativo de depoimento com selo de exemplo ilustrativo",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/depo-04.jpg",
    alt: "Cartão ilustrativo de depoimento com selo de exemplo ilustrativo",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/depo-05.jpg",
    alt: "Cartão ilustrativo de depoimento de Carla M. com selo de exemplo ilustrativo",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/depo-06.jpg",
    alt: "Cartão ilustrativo de depoimento de Mariana S. com selo de exemplo ilustrativo",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/depo-07.jpg",
    alt: "Cartão ilustrativo de depoimento de Patrícia L. com selo de exemplo ilustrativo",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/exemplo-ilustrativo.jpg",
    alt: "Cartão de exemplo ilustrativo de avaliação de cliente",
    width: 1200,
    height: 800,
  },
];

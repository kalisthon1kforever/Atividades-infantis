export type ContoBrinde = {
  n: number;
  titulo: string;
  quando: string;
  emoji: string;
};

/** As 10 atividades grátis do e-mail: um conto por noite. */
export const CONTOS_BRINDE: ContoBrinde[] = [
  { n: 1, titulo: "O Urso que Engoliu a Lua", quando: "Se o dia foi difícil e ela está com medo.", emoji: "🐻" },
  { n: 2, titulo: "A Nuvem que Não Queria Chover", quando: "Se ela chorou e não sabe explicar.", emoji: "☁️" },
  { n: 3, titulo: "Tobias, o Tatu Apressado", quando: "Se o dia foi corrido e agitado.", emoji: "🎒" },
  { n: 4, titulo: "A Estrela que Perdeu o Brilho", quando: "Se ela se comparou com alguém.", emoji: "⭐" },
  { n: 5, titulo: "O Trem dos Sonhos", quando: "Se ela resiste na hora de deitar.", emoji: "🚂" },
  { n: 6, titulo: "Lila e o Guarda-Chuva de Estrelas", quando: "Se tem trovão ou barulho de noite.", emoji: "☂️" },
  { n: 7, titulo: "O Golfinho que Contava Ondas", quando: "Se o corpo não desliga.", emoji: "🐬" },
  { n: 8, titulo: "A Casa do Barulho Baixinho", quando: "Se a casa estava barulhenta demais.", emoji: "🏠" },
  { n: 9, titulo: "O Pijama do Vovô Jacaré", quando: "Se ela dormiu fora de casa.", emoji: "🐊" },
  { n: 10, titulo: "O Último Bocejo do Mundo", quando: "Se ela quer só mais uma história.", emoji: "🐼" },
];

export const BRINDE_PDF_PATH = "/brinde/pequenos-passos-contos-para-dormir.pdf";

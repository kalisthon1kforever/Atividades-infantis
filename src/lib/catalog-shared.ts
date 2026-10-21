// helpers puros do catálogo — seguros para client components (sem imports de servidor)
import type { Activity } from "@/lib/types";

export const CATEGORIES = [
  "Atenção visual",
  "Traçado e coordenação",
  "Letras e sílabas",
  "Palavras e leitura",
  "Números e quantidades",
  "Emoções",
  "Rotinas",
  "Vocabulário",
  "Professores",
] as const;

export const CATEGORY_ICON: Record<string, string> = {
  "Atenção visual": "👀",
  "Traçado e coordenação": "✍️",
  "Letras e sílabas": "🔤",
  "Palavras e leitura": "📖",
  "Números e quantidades": "🔢",
  "Emoções": "💗",
  "Rotinas": "🕐",
  "Vocabulário": "🗂️",
  "Professores": "🧑‍🏫",
};

export function categoryIcon(category: string): string {
  return CATEGORY_ICON[category] ?? "🎨";
}

/** "Para que serve" e "como apresentar em uma frase", por padrão de ficha */
export function activityHelp(a: Activity): { para: string; como: string } {
  const d = (a.data ?? ({} as { pattern?: string })) as { pattern?: string };
  switch (d.pattern) {
    case "diferencas":
      return { para: "Treinar o olho observador: comparar, focar e achar detalhes.", como: "Diga: “Vamos achar o que é diferente? Cada achado vale um abraço.”" };
    case "ache-iguais":
      return { para: "Trabalhar a associação por forma igual, base da leitura futura.", como: "Diga: “Aponte os desenhos gêmeos com o dedinho.”" };
    case "ligar-cor":
      return { para: "Associar cores correndo o traço, da esquerda para a direita.", como: "Diga: “Cada bolinha tem uma casinha — juntos desenhos o caminho.”" };
    case "pintar-letra":
      return { para: "Perceber a letra inicial do som que a criança conhece de ouvido.", como: "Fale bem alto a palavra e pergunte: “Que som chega primeiro?”" };
    case "labirinto":
      return { para: "Controlar o traço no espaço — olhar, planejar e desenhar.", como: "Diga: “Leve o amiguinho até o destino sem sair da linha, sem pressa.”" };
    case "picotado":
      return { para: "Regular a força e o ritmo da mão para o recorte.", como: "Siga os pontinhos devagar e comemore cada curva." };
    case "tracejado":
      return { para: "Construir movimento controlado antes de escrever letras.", como: "Trace junto com o dedo na primeira linha, e depois o lápis faz o resto." };
    case "silaba":
      return { para: "Ouvir e separar sílabas — primeiro passo da leitura.", como: "Bata uma palminha por sílaba, bem ritmado, antes de pintar." };
    case "wordcards":
      return { para: "Unir figura, sílabas e palavra — a ponte para a leitura.", como: "Mostre a carta, leiam juntos e guardem para repetir amanhã." };
    case "copiar":
      return { para: "Praticar a escrita copiando de olho na confirmação visual.", como: "Escreva uma letra por vez, devagar, e confira juntos no final." };
    case "contar":
    case "contar-multiplo":
      return { para: "Contar objetos reais em quantidades pequenas, sem pressa.", como: "Passe o dedo em cada figura e conte junto, cantando os números." };
    case "sequencia":
      return { para: "Descobrir o padrão e prever o que vem depois.", como: "Leia a sequência em voz alta e pergunte: “E agora, quem vem?”" };
    case "emocoes":
      return { para: "Nomear o que sente — antes de qualquer regra vem o acolhimento.", como: "Diga: “Qual rostinho parece com você hoje? Não tem resposta errada.”" };
    case "emocoes-cards":
      return { para: "Reconhecer sentimentos em jogos de adivinhação.", como: "Escolham um cartão e adivinhem: alegria? medo? vontade de rir?" };
    case "termometro":
      return { para: "Medir a intensidade do sentimento de 1 a 5, sem julgamento.", como: "Diga: “De 1 a 5, quanto foi o seu dia? Me conta com o dedinho.”" };
    case "rotina-ordem":
    case "rotina-cards":
      return { para: "Dar previsibilidade ao dia — rotina acalma e ensina sequência.", como: "Escolham 3 passos e organize no quadro, na ordem que funciona para vocês." };
    case "nomear-figura":
      return { para: "Ampliar vocabulário falando o nome e procurando a primeira letra.", como: "Diga o nome alto e bonito, e descubram juntos a primeira letra." };
    case "estrela-dia":
      return { para: "Fechar o momento com celebração — o “nós conseguimos” do dia.", como: "Pintem a estrela juntos e mandem um “fomos lá!” para começar." };
    case "professor-plan":
      return { para: "Estrutura pronta de turma com tempo marcado e fechamento leve.", como: "Aplique os cortes de tempo propostos, adaptando ao ritmo da turma." };
    default:
      return { para: "Um momento de 5 a 10 minutos para aprender juntos, sem pressa.", como: "Apresente desenhando o primeiro item e convidando a criança a continuar." };
  }
}

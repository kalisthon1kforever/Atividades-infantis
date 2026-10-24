/** Preços e nomes oficiais. Checkout e área logada leem daqui. */

export type CatalogKey =
  | "amostra"
  | "kit-inicial"
  | "acesso-total"
  | "rotina-visual"
  | "guia-30-dias"
  | "mini-kit-5-min"
  | "cartoes-vocabulario"
  | "combo";

export type CatalogItem = {
  label: string;
  checkoutTitle: string;
  price: number;
  note: string;
};

export const CATALOG: Record<CatalogKey, CatalogItem> = {
  amostra: {
    label: "Amostra gratuita",
    checkoutTitle: "Amostra gratuita",
    price: 0,
    note: "10 contos para dormir, um para cada noite.",
  },
  "kit-inicial": {
    label: "Kit Inicial",
    checkoutTitle: "Pequenos Passos — Kit Inicial",
    price: 37.9,
    note: "Categorias para imprimir + bônus certificado e quadro de conquistas + versão preto e branco.",
  },
  "acesso-total": {
    label: "Acesso Total",
    checkoutTitle: "Pequenos Passos — Acesso Total",
    price: 19.9,
    note: "Tudo do kit + materiais atualizados + recursos para professores + app/navegador.",
  },
  "rotina-visual": {
    label: "Rotina visual",
    checkoutTitle: "Rotina Visual em Figuras",
    price: 9.9,
    note: "Quadro da semana em figuras para colar na geladeira.",
  },
  "guia-30-dias": {
    label: "Guia de 30 dias",
    checkoutTitle: "Guia de 30 Dias",
    price: 7.9,
    note: "Um passo por dia, sem pensar em “o que fazer hoje?”.",
  },
  "mini-kit-5-min": {
    label: "Mini kit de 5 minutos",
    checkoutTitle: "Mini Kit Atividades de 5 Minutos",
    price: 4.9,
    note: "Propostas curtinhas para os dias apertados.",
  },
  "cartoes-vocabulario": {
    label: "Cartões de vocabulário",
    checkoutTitle: "Cartões de Vocabulário Ilustrados",
    price: 13.9,
    note: "12 palavras novas com sílabas para recortar e ler.",
  },
  combo: {
    label: "Combo dos 4 bumps",
    checkoutTitle: "Combo de complementos",
    price: 29.9,
    note: "Rotina visual + guia de 30 dias + mini kit + cartões, pelos quatro juntos.",
  },
};

export const BUMP_KEYS = ["rotina-visual", "guia-30-dias", "mini-kit-5-min", "cartoes-vocabulario"] as const;

export function formatPrice(value: number): string {
  if (value <= 0) return "Grátis";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function priceLabel(key: string): string {
  const item = CATALOG[key as CatalogKey];
  if (!item) return key;
  if (key === "acesso-total") return formatPrice(item.price);
  return formatPrice(item.price);
}

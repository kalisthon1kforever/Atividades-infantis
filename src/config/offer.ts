export const offerConfig = {
  productName: "Pequenos Passos — Alfabetização em Casa",

  /**
   * Preço oficial em reais.
   * Deixe `null` enquanto o valor não for definido.
   * Ex.: priceBRL: 27.9
   */
  priceBRL: null as number | null,

  /**
   * URL oficial do checkout (ex.: Mercado Pago).
   * Deixe "" enquanto não existir. Os CTAs apontam para a seção de oferta.
   */
  checkoutUrl: "",

  guaranteeDays: 7,
} as const;

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

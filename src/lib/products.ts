// Produtos e bumps — rótulos da área logada. Preço vem de catalog-prices.ts.
import { CATALOG, priceLabel as catalogPriceLabel, type CatalogKey } from "./catalog-prices";

export type ProductKey = CatalogKey;

export type ProductInfo = {
  label: string;
  priceLabel: string;
  note: string;
};

export const PRODUCTS: Record<ProductKey, ProductInfo> = {
  amostra: { label: CATALOG.amostra.label, priceLabel: catalogPriceLabel("amostra"), note: CATALOG.amostra.note },
  "kit-inicial": {
    label: CATALOG["kit-inicial"].label,
    priceLabel: catalogPriceLabel("kit-inicial"),
    note: CATALOG["kit-inicial"].note,
  },
  "acesso-total": {
    label: CATALOG["acesso-total"].label,
    priceLabel: catalogPriceLabel("acesso-total"),
    note: CATALOG["acesso-total"].note,
  },
  "rotina-visual": {
    label: CATALOG["rotina-visual"].label,
    priceLabel: catalogPriceLabel("rotina-visual"),
    note: CATALOG["rotina-visual"].note,
  },
  "guia-30-dias": {
    label: CATALOG["guia-30-dias"].label,
    priceLabel: catalogPriceLabel("guia-30-dias"),
    note: CATALOG["guia-30-dias"].note,
  },
  "mini-kit-5-min": {
    label: CATALOG["mini-kit-5-min"].label,
    priceLabel: catalogPriceLabel("mini-kit-5-min"),
    note: CATALOG["mini-kit-5-min"].note,
  },
  "cartoes-vocabulario": {
    label: CATALOG["cartoes-vocabulario"].label,
    priceLabel: catalogPriceLabel("cartoes-vocabulario"),
    note: CATALOG["cartoes-vocabulario"].note,
  },
  combo: { label: CATALOG.combo.label, priceLabel: catalogPriceLabel("combo"), note: CATALOG.combo.note },
};

export function productLabel(key: string): string {
  return PRODUCTS[key as ProductKey]?.label ?? key;
}

export function productPrice(key: string): string {
  return PRODUCTS[key as ProductKey]?.priceLabel ?? key;
}

/** Espelha public.app_can_access/. quem_tem: lista de product_key da pessoa */
export function covers(quemTem: string[], alvo: string): boolean {
  if (alvo === "amostra") return true; // conta logada sempre vê a amostra
  if (quemTem.includes("acesso-total")) return true;
  if (alvo === "kit-inicial") return quemTem.includes("kit-inicial");
  if (alvo === "professores") return false;
  if (alvo === "combo") return quemTem.includes("combo");
  const bumps = ["rotina-visual", "guia-30-dias", "mini-kit-5-min", "cartoes-vocabulario"];
  if (bumps.includes(alvo)) {
    return quemTem.includes(alvo) || quemTem.includes("combo");
  }
  return false;
}

/** O bump guia-30-dias (ou combo/acesso-total) habilita a trilha de 30 dias */
export function trailEnabled(quemTem: string[]): boolean {
  return covers(quemTem, "guia-30-dias");
}

export const ENTITLEMENT_SOURCES = ["quiz-capture", "quiz-checkout", "checkout-mp", "simulado-admin", "admin", "gateway"] as const;

import { BUMP_KEYS, CATALOG, type CatalogKey } from "./catalog-prices";

export type CheckoutProduct = "kit-inicial" | "acesso-total";
export type PayMethod = "pix" | "card" | "boleto";
export type BumpId = (typeof BUMP_KEYS)[number];

export const PRODUCTS: Record<CheckoutProduct, { title: string; price: number }> = {
  "kit-inicial": { title: CATALOG["kit-inicial"].checkoutTitle, price: CATALOG["kit-inicial"].price },
  "acesso-total": { title: CATALOG["acesso-total"].checkoutTitle, price: CATALOG["acesso-total"].price },
};

export const BUMPS: Record<BumpId, { title: string; price: number }> = {
  "rotina-visual": { title: CATALOG["rotina-visual"].checkoutTitle, price: CATALOG["rotina-visual"].price },
  "guia-30-dias": { title: CATALOG["guia-30-dias"].checkoutTitle, price: CATALOG["guia-30-dias"].price },
  "mini-kit-5-min": { title: CATALOG["mini-kit-5-min"].checkoutTitle, price: CATALOG["mini-kit-5-min"].price },
  "cartoes-vocabulario": {
    title: CATALOG["cartoes-vocabulario"].checkoutTitle,
    price: CATALOG["cartoes-vocabulario"].price,
  },
};

export const COMBO = { id: "combo" as const, title: CATALOG.combo.checkoutTitle, price: CATALOG.combo.price };

export type OrderLine = { id: string; title: string; unitPrice: number };

export function isBump(id: string): id is BumpId {
  return (BUMP_KEYS as readonly string[]).includes(id);
}

export function buildOrder(product: CheckoutProduct, bumpIds: string[], combo: boolean): OrderLine[] {
  const base = PRODUCTS[product];
  const lines: OrderLine[] = [{ id: product, title: base.title, unitPrice: base.price }];
  if (combo) {
    lines.push({ id: COMBO.id, title: COMBO.title, unitPrice: COMBO.price });
    return lines;
  }
  for (const id of bumpIds) {
    if (isBump(id)) {
      const bump = BUMPS[id];
      lines.push({ id, title: bump.title, unitPrice: bump.price });
    }
  }
  return lines;
}

export function orderTotal(lines: OrderLine[]) {
  return Math.round(lines.reduce((sum, line) => sum + line.unitPrice, 0) * 100) / 100;
}

export function grantedProducts(product: CheckoutProduct, bumpIds: string[], combo: boolean): CatalogKey[] {
  const keys: CatalogKey[] = [product];
  if (combo) {
    keys.push("combo");
    return keys;
  }
  for (const id of bumpIds) {
    if (isBump(id)) keys.push(id);
  }
  return keys;
}

import { getAreaUser, getEntitlements, getFavorites } from "@/lib/area";
import { fetchVisibleActivities } from "@/lib/catalog";
import { covers, productPrice, PRODUCTS } from "@/lib/products";
import { BibliotecaClient } from "./biblioteca-client";

export const metadata = { title: "Biblioteca — Área da família" };

function lockedHint(key: string) {
  if (key === "kit-inicial") {
    return "Com o Kit Inicial você destrava as fichas para imprimir, no ritmo de 5 a 10 minutos.";
  }
  if (key === "acesso-total") {
    return "O Acesso Total junta o kit, os materiais novos e o cantinho dos professores.";
  }
  if (key === "guia-30-dias") {
    return "A trilha de 30 dias abre com o Guia de 30 dias.";
  }
  if (key === "combo") {
    return "O combo junta os quatro complementos e abre a trilha de 30 dias.";
  }
  return "";
}

const LOCKED_ORDER = [
  "kit-inicial",
  "acesso-total",
  "rotina-visual",
  "guia-30-dias",
  "mini-kit-5-min",
  "cartoes-vocabulario",
  "combo",
] as const;

export default async function BibliotecaPage() {
  const user = await getAreaUser();
  if (!user) return null;

  const products = await getEntitlements(user.id);
  const productKeys = products.map((p) => p.product);
  const [{ items }, favos] = await Promise.all([
    fetchVisibleActivities(productKeys),
    getFavorites(user.id),
  ]);

  const bloqueados = LOCKED_ORDER.filter((key) => !covers(productKeys, key)).map((key) => ({
    key,
    note: PRODUCTS[key].note,
    priceLabel: productPrice(key),
    hint: lockedHint(key),
  }));

  return (
    <BibliotecaClient activities={items} favoritos={favos.map((f) => f.activity_id)} bloqueados={bloqueados} />
  );
}

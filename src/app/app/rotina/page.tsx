import { getAreaUser, getEntitlements, getFavorites } from "@/lib/area";
import { fetchVisibleActivities } from "@/lib/catalog";
import { BibliotecaClient } from "../biblioteca/biblioteca-client";

export const metadata = { title: "Minha rotina — Área da família" };

export default async function RotinaPage() {
  const user = await getAreaUser();
  if (!user) return null;

  const products = await getEntitlements(user.id);
  const productKeys = products.map((p) => p.product);
  const [{ items }, favos] = await Promise.all([
    fetchVisibleActivities(productKeys),
    getFavorites(user.id),
  ]);

  return (
    <BibliotecaClient
      activities={items}
      favoritos={favos.map((f) => f.activity_id)}
      titulo="Minha rotina"
      subtitulo="Passos do dia para organizar junto, sem pressa. Estas são as atividades de rotina que vocês já têm."
      initialCategoria="Rotinas"
    />
  );
}

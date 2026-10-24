import { getAreaUser, getEntitlements, getFavorites } from "@/lib/area";
import { fetchVisibleActivities } from "@/lib/catalog";
import { BibliotecaClient } from "./biblioteca-client";

export const metadata = { title: "Biblioteca — Área da família" };

export default async function BibliotecaPage() {
  const user = await getAreaUser();
  if (!user) return null;

  const products = await getEntitlements(user.id);
  const productKeys = products.map((p) => p.product);
  const [{ items }, favos] = await Promise.all([
    fetchVisibleActivities(productKeys),
    getFavorites(user.id),
  ]);

  return <BibliotecaClient activities={items} favoritos={favos.map((f) => f.activity_id)} />;
}

import { getAreaUser, getEntitlements } from "@/lib/area";
import { fetchActivityById } from "@/lib/catalog";
import { activityHelp, categoryIcon } from "@/lib/catalog-shared";
import { ActivitySheet } from "@/components/activity-sheet";
import Link from "next/link";

export const metadata = { title: "Imprimir atividade — Pequenos Passos" };

export default async function AtividadeImprimirPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAreaUser();
  if (!user) return null;

  const products = await getEntitlements(user.id);
  const activity = await fetchActivityById(decodeURIComponent(id), products.map((p) => p.product));
  const help = activity ? activityHelp(activity) : null;

  if (!activity || !help) {
    return (
      <div className="app-pad">
        <section className="app-card">
          <h1>Ficha não disponível</h1>
          <p className="app-welcome-sub">Este item ficou atrás do produto atual de vocês. Tudo certo por aqui. 💛</p>
          <Link href="/app/biblioteca" className="btn">Voltar</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="print-wrap">
      <div className="print-toolbar no-print">
        <p>Confira a ficha e mande imprimir. Papel A4, sem margens, funciona melhor. 🖨️</p>
        <button type="button" className="btn" onClick={() => window.print()}>
          Imprimir agora
        </button>
        <Link href={`/app/atividade/${activity.id}`} className="btn btn-ghost">
          Voltar para a tela
        </Link>
      </div>
      <ActivitySheet activity={activity} />
    </div>
  );
}

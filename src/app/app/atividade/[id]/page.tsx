import Link from "next/link";
import { getAreaUser, getEntitlements, getFavorites, getProgress, saoPauloDate } from "@/lib/area";
import { fetchActivityById } from "@/lib/catalog";
import { activityHelp, categoryIcon } from "@/lib/catalog-shared";
import { ActivityActions } from "./activity-actions";

export const metadata = { title: "Atividade — Área da família" };

export default async function AtividadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAreaUser();
  if (!user) return null;

  const products = await getEntitlements(user.id);
  const activity = await fetchActivityById(decodeURIComponent(id), products.map((p) => p.product));
  if (!activity) {
    return (
      <div className="app-pad">
        <section className="app-card">
          <h1>Atividade não encontrada</h1>
          <p className="app-welcome-sub">
            Este item pode ter ficado atrás do seu produto atual, ou o link veio estranhinho. Sem
            problema — a biblioteca continua com tudo de bom. 💛
          </p>
          <Link href="/app/biblioteca" className="btn">Voltar para a biblioteca</Link>
        </section>
      </div>
    );
  }

  const help = activityHelp(activity);
  const [progress, favos] = await Promise.all([getProgress(user.id), getFavorites(user.id)]);
  const doneToday = progress.some((p) => p.activity_id === activity.id && p.log_date === saoPauloDate());
  const fav = favos.some((f) => f.activity_id === activity.id);
  const isProfessor = activity.audience === "professor";

  return (
    <div className="app-pad">
      <p className="app-back">
        <Link href="/app/biblioteca">← Biblioteca</Link>
      </p>

      <section className="app-card app-act-page">
        <p className="app-kicker">
          {categoryIcon(activity.category)} {activity.category} {isProfessor ? "· professor" : "· família"}
        </p>
        <h1>{activity.title}</h1>
        <p className="app-act-summary">{activity.summary}</p>

        <p className="app-meta-line app-meta-big">
          <span>⏱️ {activity.duration_min} min</span>
          <span>🧒 {activity.age_min}–{activity.age_max} anos</span>
          <span>{activity.format === "ambos" ? "🖨️ imprimir ou tela" : activity.format === "imprimir" ? "🖨️ para imprimir" : "💻 na tela"}</span>
          {activity.bw ? <span>🖤 funciona em preto e branco</span> : null}
        </p>

        <div className="app-help-box">
          <p>
            <b>Para que serve:</b> {help.para}
          </p>
          <p>
            <b>Como apresentar em uma frase:</b> {help.como}
          </p>
        </div>

        <ActivityActions activityId={activity.id} doneToday={doneToday} favorito={fav} />
      </section>
    </div>
  );
}

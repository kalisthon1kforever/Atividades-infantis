import Link from "next/link";
import { computeStreak, distinctDoneIds, getAreaUser, getEntitlements, getProgress, getTrail } from "@/lib/area";
import { fetchVisibleActivities } from "@/lib/catalog";
import { productPrice, trailEnabled } from "@/lib/products";
import { categoryIcon } from "@/lib/catalog-shared";
import { pickTrailActivity } from "@/lib/trail";
import { CompleteTrailDayButton } from "./complete-trail-day-button";

export const metadata = { title: "Trilha de 30 dias — Área da família" };

export default async function TrilhaPage() {
  const user = await getAreaUser();
  if (!user) return null;

  const products = await getEntitlements(user.id);
  const productKeys = products.map((p) => p.product);
  const unlocked = trailEnabled(productKeys);

  if (!unlocked) {
    return (
      <div className="app-pad">
        <section className="app-card app-locked-card">
          <p className="app-kicker">🔒 Momento do guia completo</p>
          <h1>Trilha de 30 dias</h1>
          <p className="app-welcome-sub">
            Um passo por dia: abriu o app, sentou junto, fechou o dia. A trilha organiza a sequência
            para vocês, sem pensar no “o que fazer hoje?”.
          </p>
          <p className="app-locked-hint">
            A trilha abre com o <b>Acesso Total</b> ({productPrice("acesso-total")}), com o bump{" "}
            <b>Guia de 30 dias</b> ({productPrice("guia-30-dias")}) ou com o{" "}
            <b>Combo dos 4 bumps</b> ({productPrice("combo")}).
          </p>
          <Link href="/oferta?src=app" className="btn">
            Quero o Guia de 30 dias
          </Link>
        </section>
      </div>
    );
  }

  const [{ items }, trail, progress] = await Promise.all([
    fetchVisibleActivities(productKeys),
    getTrail(user.id),
    getProgress(user.id),
  ]);
  const doneIds = distinctDoneIds(progress);
  const sorted = trail.map((t) => t.day).sort((a, b) => a - b);
  const currentDay = Math.min(30, sorted.length + 1);

  const currentActivity = pickTrailActivity(items, doneIds, currentDay);
  const streak = computeStreak(progress);

  return (
    <div className="app-pad">
      <section className="app-welcome">
        <h1>Trilha de 30 dias</h1>
        <p className="app-welcome-sub">
          Um dia por vez, sem pressa. Fechou o dia, aparece o próximo. Faltam {30 - trail.length} dias
          no seu passo. 🔥 {streak > 0 ? `Vocês estão em ${streak} dia${streak === 1 ? "" : "s"} seguidos!` : ""}
        </p>
      </section>

      {/* dia anterior */}
      {currentDay > 1 ? (
        <section className="app-card app-trail-card app-trail-done">
          <p className="app-kicker">Dia {Math.max(1, currentDay - 1)} · fechado</p>
          <p className="app-trail-note">Feito no dia anterior — que constância linda. 💛</p>
        </section>
      ) : null}

      {/* dia atual */}
      <section className="app-card app-trail-card app-trail-now">
        <p className="app-kicker">Hoje · Dia {currentDay}</p>
        {currentActivity ? (
          <>
            <h2>
              {categoryIcon(currentActivity.category)} {currentActivity.title}
            </h2>
            <p className="app-meta-line">
              <span>{currentActivity.duration_min} min</span>
              <span>{currentActivity.category}</span>
            </p>
            <CompleteTrailDayButton day={currentDay} activityId={currentActivity.id} activityTitle={currentActivity.title} />
          </>
        ) : (
          <p>Catálogo montando — volte em instantes. 💛</p>
        )}
      </section>

      {/* amanhã */}
      {currentDay < 30 ? (
        <section className="app-card app-trail-card app-trail-next">
          <p className="app-kicker">Amanhã · Dia {currentDay + 1}</p>
          <p className="app-trail-note">Aparece amanhã — um dia por vez mantém o encanto. 🌙</p>
        </section>
      ) : null}

      <section className="app-card app-small-note">
        <p>
          Já fecharam {trail.length} {trail.length === 1 ? "dia" : "dias"} da trilha. Seguindo no ritmo de vocês. 💛
        </p>
      </section>
    </div>
  );
}

import Link from "next/link";
import {
  computeAchievements,
  computeStreak,
  distinctDoneIds,
  getAreaUser,
  getChildren,
  getEntitlements,
  getLeadByEmail,
  getProfile,
  getProgress,
} from "@/lib/area";
import { fetchVisibleActivities } from "@/lib/catalog";
import { trailEnabled } from "@/lib/products";
import { categoryIcon } from "@/lib/catalog";

export const metadata = { title: "Início — Área da família" };

const SUGGESTION_BY_Q4: Record<string, string> = {
  figuras: "Atenção visual",
  letras: "Letras e sílabas",
  numeros: "Números e quantidades",
  maos: "Traçado e coordenação",
};

export default async function AppHomePage() {
  const user = await getAreaUser();
  if (!user) return null;

  const [products, profile, progress, children, lead] = await Promise.all([
    getEntitlements(user.id),
    getProfile(user.id),
    getProgress(user.id),
    getChildren(user.id),
    getLeadByEmail(user.email),
  ]);
  const productKeys = products.map((p) => p.product);
  const { items: activities } = await fetchVisibleActivities(productKeys);

  const name = profile?.name || user.name || "família";
  const child = children[0];
  const greetName = child?.name || name;

  const doneIds = distinctDoneIds(progress);
  const streak = computeStreak(progress);
  const { stars } = computeAchievements(progress, activities, 0, 0);

  // próximo passo sugerido: categoria da pergunta 4 do quiz, se o lead existir
  const answers = (lead?.answers ?? {}) as Record<string, { key?: string } | undefined>;
  const q4Key = answers.q4?.key;
  const suggestedCat = (q4Key && SUGGESTION_BY_Q4[q4Key]) || null;
  const candidate = activities.filter((a) => {
    if (suggestedCat && a.category === suggestedCat) return !doneIds.has(a.id);
    return !doneIds.has(a.id);
  });
  const suggestion = candidate[0] ?? activities[0] ?? null;
  const suggestionNote =
    suggestedCat && suggestion
      ? "Pela resposta do quiz, esta categoria combina com o momento de vocês."
      : "Continuando de onde vocês pararam — escolhida para caber no dia.";

  const hasTrail = trailEnabled(productKeys);

  return (
    <div className="app-pad">
      <section className="app-welcome">
        <h1>
          Olá, {name === "família" ? "família" : name}. <em>Que bom ter vocês aqui.</em>
        </h1>
        <p className="app-welcome-sub">
          {child ? (
            <>
              Os recados e as recompensas vocês deixam com <strong>{child.name}</strong> — e navegam
              por aqui com tranquilidade. 💛
            </>
          ) : (
            <>
              Tudo por aqui passa por <strong>momentos de 5 a 10 minutos</strong>, no ritmo da
              criança. Sem cobrança: cada passo já é bom.
            </>
          )}
        </p>
      </section>

      <section className="app-chips">
        <div className="app-chip app-chip-star">
          <span className="app-chip-ico">⭐</span>
          <div>
            <b>{stars} estrela{stars === 1 ? "" : "s"}</b>
            <small>cada “fizemos juntos” vale 1</small>
          </div>
        </div>
        <div className="app-chip app-chip-streak">
          <span className="app-chip-ico">🔥</span>
          <div>
            <b>{streak} dia{streak === 1 ? "" : "s"} seguidos</b>
            <small>de momentos juntos</small>
          </div>
        </div>
        <div className="app-chip">
          <span className="app-chip-ico">✅</span>
          <div>
            <b>{doneIds.size} fichas</b>
            <small>já exploradas</small>
          </div>
        </div>
      </section>

      <section className="app-card app-suggest">
        <p className="app-kicker">Próximo passo sugerido</p>
        {suggestion ? (
          <>
            <h2>
              {categoryIcon(suggestion.category)} {suggestion.title}
            </h2>
            <p className="app-suggest-note">{suggestionNote}</p>
            <p className="app-meta-line">
              <span>{suggestion.duration_min} min</span>
              <span>{suggestion.category}</span>
              <span>{suggestion.age_min}–{suggestion.age_max} anos</span>
            </p>
            <div className="app-btn-row">
              <Link href={`/app/atividade/${suggestion.id}`} className="btn">
                Abrir atividade ({suggestion.duration_min} min)
              </Link>
              <Link href="/app/biblioteca" className="btn btn-ghost">
                Ver a biblioteca
              </Link>
            </div>
          </>
        ) : (
          <p className="app-suggest-note">
            O catálogo ainda está sendo preparadinho. Já já tem atividade aqui — enquanto isso, olhe
            a biblioteca. 💛
          </p>
        )}
      </section>

      <section className="app-grid-2">
        <Link href="/app/biblioteca" className="app-tile">
          <span className="app-tile-ico">📚</span>
          <b>Biblioteca</b>
          <small>Atividades por categoria, tempo e idade</small>
        </Link>
        {hasTrail ? (
          <Link href="/app/trilha-30-dias" className="app-tile">
            <span className="app-tile-ico">🗓️</span>
            <b>Trilha de 30 dias</b>
            <small>Um dia por vez, sem pressa</small>
          </Link>
        ) : (
          <Link href="/app/trilha-30-dias" className="app-tile app-tile-locked">
            <span className="app-tile-ico">🗓️</span>
            <b>Guia de 30 dias</b>
            <small className="app-tile-price">R$ 7,90 — ver no funil</small>
          </Link>
        )}
        <Link href="/app/conquistas" className="app-tile">
          <span className="app-tile-ico">⭐</span>
          <b>Conquistas</b>
          <small>Estrelas, selos e certificado</small>
        </Link>
        <Link href="/app/crianca" className="app-tile">
          <span className="app-tile-ico">🧒</span>
          <b>Criança</b>
          <small>Nome e idade de {child ? child.name : "seu pequeno"}</small>
        </Link>
      </section>

      <section className="app-card app-cheer">
        <p>
          💛 {streak >= 3 ? "Vocês criaram um cantinho de rotina de verdade. Respeita o cansaço do dia — e volta amanhã, tá bom?" : "Lembrar: nada aqui precisa ser perfeito. Sentar junto por 5 minutos já é muito."}
        </p>
      </section>
    </div>
  );
}

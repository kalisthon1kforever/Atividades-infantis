import Link from "next/link";
import {
  computeAchievements,
  computeStreak,
  computeWeekSummary,
  distinctDoneIds,
  distinctMomentDays,
  getAreaUser,
  getChildren,
  getEntitlements,
  getLeadByEmail,
  getProfile,
  getProgress,
  marcarPrimeiroAcesso,
} from "@/lib/area";
import { fetchVisibleActivities } from "@/lib/catalog";
import { trailEnabled } from "@/lib/products";
import { categoryIcon } from "@/lib/catalog";
import { pilarDe, sugerirPrimeira, type MetaLead } from "@/lib/funil/modelo";

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

  const [products, profile, progress, children, lead, acesso] = await Promise.all([
    getEntitlements(user.id),
    getProfile(user.id),
    getProgress(user.id),
    getChildren(user.id),
    getLeadByEmail(user.email),
    marcarPrimeiroAcesso(user.email),
  ]);
  const productKeys = products.map((p) => p.product);
  const { items: activities } = await fetchVisibleActivities(productKeys);

  const name = profile?.name || user.name || "";
  const child = children[0];
  const familia = name ? `família de ${name}` : "família";

  const doneIds = distinctDoneIds(progress);
  const streak = computeStreak(progress);
  const momentDays = distinctMomentDays(progress);
  const week = computeWeekSummary(progress);
  const { stars } = computeAchievements(progress, activities, 0, 0);

  const answers = (lead?.answers ?? {}) as { meta?: MetaLead; q4?: { key?: string } };
  const meta = answers.meta ?? {};
  const q4Key = answers.q4?.key;
  const suggestedCat = (q4Key && SUGGESTION_BY_Q4[q4Key]) || null;

  const eligible = activities.filter((item) => !doneIds.has(item.id));
  const porPilar = sugerirPrimeira(eligible, meta.pillar, meta.age);
  const porCategoria = suggestedCat
    ? activities.find((item) => item.category === suggestedCat && !doneIds.has(item.id))
    : null;
  const suggestion =
    porPilar ?? porCategoria ?? eligible[0] ?? activities[0] ?? null;
  const alternative =
    eligible.find((item) => item.id !== suggestion?.id) ??
    activities.find((item) => item.id !== suggestion?.id) ??
    null;

  const pilarNome = meta.pillar ? pilarDe(meta.pillar).nome : null;
  const suggestionNote = pilarNome
    ? `Pelo quiz, o pilar ${pilarNome} abre a atividade de hoje.`
    : suggestedCat
      ? "Pela resposta do quiz, esta categoria combina com o momento de vocês."
      : "A atividade de hoje, escolhida para caber no dia.";

  const hasTrail = trailEnabled(productKeys);

  return (
    <div className="app-pad">
      <section className="app-welcome">
        <h1>Olá, {familia}.</h1>
        <p className="app-welcome-sub">
          {acesso.primeiro ? (
            <>
              Que bom ter vocês aqui. A primeira atividade já está na frente
              {pilarNome ? <>, no pilar <strong>{pilarNome}</strong></> : null} — e cada
              “fizemos juntos” acende uma estrela.
            </>
          ) : child ? (
            <>
              Os recados e as recompensas ficam com <strong>{child.name}</strong>. A atividade de
              hoje está logo abaixo.
            </>
          ) : (
            <>
              A atividade de hoje está na frente. Dá para fazer na tela ou imprimir, no ritmo de
              vocês.
            </>
          )}
        </p>
      </section>

      <section className="app-chips">
        <div className="app-chip app-chip-star">
          <span className="app-chip-ico">📅</span>
          <div>
            <b>{momentDays} {momentDays === 1 ? "dia" : "dias"}</b>
            <small>com momentos juntos</small>
          </div>
        </div>
        <div className="app-chip">
          <span className="app-chip-ico">⭐</span>
          <div>
            <b>{stars} estrela{stars === 1 ? "" : "s"}</b>
            <small>cada “fizemos juntos” vale 1</small>
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

      <section className="app-card app-week">
        <p className="app-kicker">Esta semana</p>
        <p className="app-week-line">
          <span className="app-week-num">{week.distinctDays}</span>{" "}
          {week.distinctDays === 1 ? "dia" : "dias"} com momentos juntos
        </p>
        <p className="app-week-sub">
          {week.count === 0
            ? "Nenhuma atividade marcada ainda — que tal começar pela de hoje? 💛"
            : `${week.count} ${week.count === 1 ? "atividade feita" : "atividades feitas"} na semana.`}
        </p>
      </section>

      <section className="app-card app-suggest">
        <p className="app-kicker">
          {acesso.primeiro ? "Sua primeira atividade" : "Próximo passo sugerido"}
        </p>
        {suggestion ? (
          <>
            <h2>
              {categoryIcon(suggestion.category)} {suggestion.title}
            </h2>
            <p className="app-suggest-note">{suggestionNote}</p>
            <p className="app-meta-line">
              <span>⏱️ {suggestion.duration_min} min</span>
              <span>{suggestion.category}</span>
              {Number.isFinite(suggestion.age_min) && Number.isFinite(suggestion.age_max) ? (
                <span>🧒 {suggestion.age_min}–{suggestion.age_max} anos</span>
              ) : null}
            </p>
            <div className="app-btn-row">
              <Link href={`/app/atividade/${suggestion.id}`} className="btn">
                Começar atividade
              </Link>
              <Link href="/app/biblioteca" className="btn btn-ghost">
                Escolher outra
              </Link>
            </div>
            {alternative && alternative.id !== suggestion.id ? (
              <p className="app-alt-line">
                Ou experimente:{" "}
                <Link href={`/app/atividade/${alternative.id}`}>
                  {categoryIcon(alternative.category)} {alternative.title}
                </Link>
              </p>
            ) : null}
          </>
        ) : (
          <div className="app-empty">
            <p className="app-big-emoji">🌱</p>
            <p className="app-suggest-note">
              O catálogo ainda está sendo preparadinho. Já já tem atividade aqui — enquanto isso,
              olhe a biblioteca. 💛
            </p>
            <Link href="/app/biblioteca" className="btn btn-ghost">
              Explorar a biblioteca
            </Link>
          </div>
        )}
      </section>

      <section className="app-grid-2">
        <Link href="/app/biblioteca" className="app-tile">
          <span className="app-tile-ico">📚</span>
          <b>Atividades</b>
          <small>Busque por categoria, tempo e idade</small>
        </Link>
        <Link href="/app/rotina" className="app-tile">
          <span className="app-tile-ico">🕐</span>
          <b>Minha rotina</b>
          <small>Passos do dia para organizar junto</small>
        </Link>
        {hasTrail ? (
          <Link href="/app/trilha-30-dias" className="app-tile">
            <span className="app-tile-ico">🗓️</span>
            <b>Trilha de 30 dias</b>
            <small>Um dia por vez, sem pressa</small>
          </Link>
        ) : (
          <Link href="/app/biblioteca" className="app-tile">
            <span className="app-tile-ico">🖨️</span>
            <b>Para imprimir</b>
            <small>Escolha a ficha e imprima</small>
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
          {streak >= 3
            ? "Vocês criaram um cantinho de rotina de verdade. Respeita o cansaço do dia — e volta amanhã, tá bom?"
            : "Lembrar: nada aqui precisa ser perfeito. Sentar junto por 5 minutos já é muito."}
        </p>
      </section>
    </div>
  );
}

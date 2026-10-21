import Link from "next/link";
import {
  computeAchievements,
  computeStreak,
  distinctDoneIds,
  getAreaUser,
  getChildren,
  getEntitlements,
  getProgress,
  getTrail,
} from "@/lib/area";
import { fetchVisibleActivities } from "@/lib/catalog";
import { categoryIcon } from "@/lib/catalog-shared";

export const metadata = { title: "Conquistas — Área da família" };

export default async function ConquistasPage() {
  const user = await getAreaUser();
  if (!user) return null;

  const products = await getEntitlements(user.id);
  const productKeys = products.map((p) => p.product);
  const [{ items }, progress, trail] = await Promise.all([
    fetchVisibleActivities(productKeys),
    getProgress(user.id),
    getTrail(user.id),
  ]);
  const trailDone = trail.filter((t) => t.completed).length;

  const doneIds = distinctDoneIds(progress);
  const starCount = progress.length;
  const streak = computeStreak(progress);
  const { list } = computeAchievements(progress, items, 0, trailDone);

  const children = await getChildren(user.id);
  const childName = children[0]?.name;

  // categorias completas (para o quadro)
  const catDone = new Map<string, number>();
  for (const id of doneIds) {
    const a = items.find((x) => x.id === id);
    if (a) catDone.set(a.category, (catDone.get(a.category) ?? 0) + 1);
  }
  const catTotal = new Map<string, number>();
  for (const a of items) catTotal.set(a.category, (catTotal.get(a.category) ?? 0) + 1);

  return (
    <div className="app-pad">
      <section className="app-welcome">
        <h1>Conquistas</h1>
        <p className="app-welcome-sub">
          As recompensas são da criança — selinhos, estrelas e um certificado de quem aprendeu
          junto com quem cuida. 💛
        </p>
      </section>

      <section className="app-chips">
        <div className="app-chip app-chip-star">
          <span className="app-chip-ico">⭐</span>
          <div><b>{starCount}</b><small>estrelas juntas</small></div>
        </div>
        <div className="app-chip app-chip-streak">
          <span className="app-chip-ico">🔥</span>
          <div><b>{streak}</b><small>dias seguidos</small></div>
        </div>
      </section>

      <section className="app-ach-grid">
        {list.map((ach) => (
          <article key={ach.id} className={`app-ach ${ach.unlocked ? "is-on" : ""}`}>
            <span className="app-ach-ico">{ach.emoji}</span>
            <b>{ach.label}</b>
            <small>{ach.unlocked ? "Conquistada! 🎉" : ach.hint}</small>
          </article>
        ))}
      </section>

      <section className="app-card">
        <h2>Categorias</h2>
        <ul className="app-cat-progress">
          {Array.from(catTotal.entries()).map(([cat, total]) => {
            const done = catDone.get(cat) ?? 0;
            const pct = Math.round((done / Math.max(1, total)) * 100);
            return (
              <li key={cat}>
                <span className="app-cat-label">{categoryIcon(cat)} {cat}</span>
                <span className="app-cat-bar"><span style={{ width: `${pct}%` }} /></span>
                <span className="app-cat-count">{done}/{total}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="app-btn-row app-print-row">
        <Link href="/app/conquistas/certificado" className="btn">
          🎓 Abrir certificado (imprimir)
        </Link>
        <Link href="/app/conquistas/quadro" className="btn btn-ghost">
          🖼️ Quadro de conquistas (imprimir)
        </Link>
      </section>
      {!children[0] ? (
        <p className="app-note-msg">
          O certificado usa o nome da criança — dê um nome com carinho na aba <Link href="/app/crianca">Criança</Link>.
        </p>
      ) : null}
      <p className="app-note-msg">
        {childName ? `Sem ranking com outras famílias — a disputa é só com o dia de ontem, ${childName} inclusa.` : "Sem ranking público, sem moeda, sem loja: nada aqui aperta a família."}
      </p>
    </div>
  );
}

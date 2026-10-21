import Link from "next/link";
import {
  computeAchievements,
  distinctDoneIds,
  getAreaUser,
  getChildren,
  getProgress,
  getTrail,
} from "@/lib/area";
import { fetchVisibleActivities } from "@/lib/catalog";
import { PrintStartButton } from "@/components/print-start-button";

export const metadata = { title: "Quadro de conquistas — Pequenos Passos" };

const SELOS: { emoji: string; label: string; note: string }[] = [
  { emoji: "🎉", label: "Primeira atividade", note: "a porta se abriu" },
  { emoji: "⭐", label: "5 estrelas", note: "5 momentinhos juntos" },
  { emoji: "🌟", label: "10 estrelas", note: "10 momentos juntos" },
  { emoji: "💫", label: "20 estrelas", note: "20 momentos juntos" },
  { emoji: "🔥", label: "3 dias seguidos", note: "3 dias na fila" },
  { emoji: "🔥", label: "7 dias seguidos", note: "7 dias na fila" },
  { emoji: "🏅", label: "Uma categoria completa", note: "todas as fichas" },
  { emoji: "🗓️", label: "10 dias da trilha", note: "guia de 30 dias" },
  { emoji: "🎓", label: "Certificado", note: "aprendeu junto com quem cuida" },
];

function match(sel: string, list: { label: string }[]): string {
  return list.find((a) => a.label.toLowerCase().includes(sel.toLowerCase()))?.label ?? sel;
}

export default async function QuadroPage() {
  const user = await getAreaUser();
  if (!user) return null;

  const products = await getEntitlementsSafe(user.id);
  const [{ items }, progress, trail, children] = await Promise.all([
    fetchVisibleActivities(products),
    getProgress(user.id),
    getTrail(user.id),
    getChildren(user.id),
  ]);
  const trailDone = trail.filter((t) => t.completed).length;
  const { list } = computeAchievements(progress, items, 0, trailDone);
  const stars = progress.length;
  const doneCount = distinctDoneIds(progress).size;
  const childName = children[0]?.name || "nossos momentos";

  return (
    <div className="print-wrap">
      <div className="print-toolbar no-print">
        <p>Quadro para colar na geladeira — pinta o quadradinho de cada selo conquistado. 🖼️</p>
        <PrintStartButton />
        <Link href="/app/conquistas" className="btn btn-ghost">← Conquistas</Link>
      </div>

      <article className="board">
        <header className="board-head">
          <div className="board-brand">
            <span>Pequenos</span>
            <b>Passos</b>
          </div>
          <h1>Quadro de conquistas</h1>
          <p className="board-sub">
            Para {childName}: cada vez que aprendermos juntos por 5 a 10 minutinhos, pinta um quadradinho. ⭐
          </p>
        </header>
        <section className="board-grid">
          {SELOS.map((s) => {
            const ach = list.find((a) => a.label.toLowerCase().includes(match(s.label, list).toLowerCase()));
            const unlocked = Boolean(ach?.unlocked);
            return (
              <div key={s.label} className={`board-cell ${unlocked ? "is-on" : ""}`}>
                <span className="board-emoji">{s.emoji}</span>
                <b>{s.label}</b>
                <small>{s.note}</small>
                <span className="board-check">{unlocked ? "✓" : ""}</span>
              </div>
            );
          })}
        </section>
        <footer className="board-foot">
          <p className="board-stars">
            Estrelas juntas: ⭐ ×{stars} — exploradas {doneCount} fichas diferentes até hoje
          </p>
          <p className="board-cheer">Sem ranking, sem moeda, sem loja — a recompensa é o momento juntos. 💛</p>
        </footer>
      </article>
    </div>
  );
}

async function getEntitlementsSafe(userId: string): Promise<string[]> {
  try {
    const { getEntitlements } = await import("@/lib/area");
    const rows = await getEntitlements(userId);
    return rows.map((r) => r.product);
  } catch {
    return [];
  }
}

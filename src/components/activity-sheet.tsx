"use client";

import Link from "next/link";
import { categoryIcon, activityHelp } from "@/lib/catalog-shared";
import type { Activity } from "@/lib/types";

export function ActivitySheet({ activity }: { activity: Activity }) {
  const help = activityHelp(activity);
  const data = (activity.data ?? {}) as Record<string, unknown>;

  return (
    <article className="sheet">
      <header className="sheet-head">
        <div>
          <span className="sheet-brand-1">Pequenos</span>
          <span className="sheet-brand-2">Passos</span>
        </div>
        <span className="sheet-chip">{categoryIcon(activity.category)} {activity.category}</span>
        <span className="sheet-chip sheet-chip-time">⏱️ {activity.duration_min} min</span>
      </header>

      <h1 className="sheet-title">{activity.title}</h1>
      <p className="sheet-hint">{activity.summary}</p>
      <p className="sheet-como">
        <b>Como apresentar:</b> {help.como}
        {activity.bw ? <span className="sheet-bw"> · funciona lindinha em preto e branco</span> : null}
      </p>

      <section className="sheet-body">{renderPattern(activity, data)}</section>

      <footer className="sheet-foot">
        <p>
          <b>Assine o momento juntos:</b> ___________________________ &nbsp;&nbsp; 📅 ______/______/______
        </p>
        <p className="sheet-foot-cheer">Fizeram juntos hoje? Pintem a estrelinha de novo — diferente a cada vez. ⭐</p>
      </footer>
      <div className="print-toolbar no-print">
        <Link href={`/app/atividade/${activity.id}`} className="btn btn-ghost">
          ← Voltar para a tela
        </Link>
        <button type="button" className="btn" onClick={() => window.print()}>
          🖨️ Imprimir agora
        </button>
      </div>
    </article>
  );
}

function renderPattern(a: Activity, d: Record<string, unknown>) {
  switch (d.pattern) {
    case "ache-iguais":
      return (
        <div className="sheet-grid sheet-grid-4">
          {(d.items as string[] ?? []).map((item, i) => (
            <div key={i} className="sheet-box sheet-box-lg">{item}</div>
          ))}
        </div>
      );
    case "ligar-cor": {
      const items = (d.items as string[] | undefined) ?? [];
      return (
        <div className="sheet-ligar">
          <ul className="sheet-list">
            {items.map((item, i) => (
              <li key={i} className="sheet-box sheet-box-row">{item.split(" ")[0]}</li>
            ))}
          </ul>
          <ol className="sheet-list sheet-words">
            {items.map((item, i) => (
              <li key={i} className="sheet-box sheet-box-row sheet-word-line">{item.split(" ")[1] ?? item}</li>
            ))}
          </ol>
        </div>
      );
    }
    case "pintar-letra":
      return (
        <div className="sheet-stack">
          <p className="sheet-wordrow"><b>Palavra:</b> <b className="sheet-word-big">{String(d.palavra ?? "")}</b></p>
          <div className="sheet-grid sheet-grid-4">
            {(d.items as string[] ?? []).map((l, i) => (
              <div key={i} className="sheet-box sheet-box-letter">{l}</div>
            ))}
          </div>
          <p className="sheet-tip">Pinte a letra que começa a palavra acima. 💪</p>
        </div>
      );
    case "contar":
      return (
        <div>
          {((d.grupos as { icon: string; qtd: number }[]) ?? []).map((g, i) => (
            <p key={i} className="sheet-count">{(g.icon + " ").repeat(g.qtd)} <span className="sheet-count-ans">= ____</span></p>
          ))}
        </div>
      );
    case "contar-multiplo":
      return (
        <div className="sheet-stack">
          {((d.grupos as { icon: string; qtd: number }[]) ?? []).map((g, i) => (
            <p key={i} className="sheet-count">{(g.icon + " ").repeat(g.qtd)} <span className="sheet-count-ans">= ____</span></p>
          ))}
        </div>
      );
    case "labirinto":
      return (
        <div className="sheet-maze">
          <span className="sheet-maze-emoji">{String(d.de ?? "🐾")}</span>
          <span className="sheet-maze-path">──── ⟋ ──── ⟉ ──── ⟋ ──── ⟉ ────</span>
          <span className="sheet-maze-emoji">{String(d.ate ?? "🏠")}</span>
        </div>
      );
    case "picotado":
      return (
        <div className="sheet-stack">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="sheet-dots">· · · · · · · · · · · · · · · · · · · · · · · · · · · ·</div>
          ))}
          <p className="sheet-tip">Recorte devagar, em cima dos pontinhos — tesoura curta, com cuidado do adulto. ✂️</p>
        </div>
      );
    case "tracejado":
      return (
        <div className="sheet-stack">
          {((d.linhas as string[]) ?? []).map((l, i) => (
            <p key={i} className="sheet-trace">{l}</p>
          ))}
          <p className="sheet-tip">Trace por cima, sem pressa. Depois, use só toques leves do lápis. ✏️</p>
        </div>
      );
    case "silaba":
      return (
        <div className="sheet-stack">
          {((d.pares as { hidden: string; shown: string; palavra: string; emoji: string }[]) ?? []).map((p, i) => (
            <div key={i} className="sheet-silaba-row">
              <span className="sheet-sil-emoji">{p.emoji}</span>
              <span className="sheet-sil-hidden">__</span>
              <span className="sheet-sil-shown">{p.shown}</span>
              <span className="sheet-sil-word">{p.palavra}</span>
            </div>
          ))}
          <div className="sheet-options">
            <span className="sheet-tip">Sílabas em jogo:</span>
            {((d.opcoes as string[]) ?? []).map((o, i) => (
              <span key={i} className="sheet-box sheet-box-chip">{o}</span>
            ))}
          </div>
        </div>
      );
    case "wordcards":
      return (
        <div className="sheet-cards-grid">
          {((d.cartoes as { word: string; syllables: string[]; emoji: string }[]) ?? []).map((c, i) => (
            <div key={i} className="sheet-card">
              <span className="sheet-card-syll">{c.syllables.join(" ")}</span>
              <span className="sheet-card-emoji">{c.emoji}</span>
              <span className="sheet-card-word">{c.word}</span>
            </div>
          ))}
        </div>
      );
    case "copiar":
      return (
        <div className="sheet-stack">
          {((d.palavras as string[]) ?? []).map((p, i) => (
            <div key={i} className="sheet-copy-row">
              <span className="sheet-copy-word">{p}</span>
              <span className="sheet-copy-line">{"·".repeat(p.length * 3)}</span>
            </div>
          ))}
        </div>
      );
    case "sequencia":
      return (
        <div className="sheet-seq">
          {((d.numeros as string[]) ?? []).map((n, i) => (
            <span key={i} className={`sheet-box sheet-seq-item ${n === "__" ? "sheet-seq-gap" : ""}`}>{n === "__" ? "____" : n}</span>
          ))}
        </div>
      );
    case "emocoes":
      return (
        <div className="sheet-grid sheet-grid-4">
          {((d.rosto as string[]) ?? []).map((f, i) => (
            <div key={i} className="sheet-box sheet-box-lg">{f}</div>
          ))}
        </div>
      );
    case "emocoes-cards":
      return (
        <div className="sheet-cards-grid">
          {((d.rosto as string[]) ?? []).map((f, i) => (
            <div key={i} className="sheet-card sheet-card-solo"><span className="sheet-card-emoji">{f}</span></div>
          ))}
        </div>
      );
    case "termometro":
      return (
        <div className="sheet-stack">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="sheet-thermo-row">
              <span className="sheet-thermo-n">{n}</span>
              <span className={`sheet-thermo-bar sheet-thermo-${n}`} />
            </div>
          ))}
          <p className="sheet-tip">Marque no termômetro o número do dia de vocês — não tem certo nem errado. 💗</p>
        </div>
      );
    case "rotina-ordem":
      return (
        <div className="sheet-stack">
          {((d.passos as string[]) ?? []).map((p, i) => (
            <div key={i} className="sheet-rotina-row">
              <span className="sheet-num-box">___</span>
              <span className="sheet-rotina-step">{p}</span>
            </div>
          ))}
        </div>
      );
    case "rotina-cards":
      return (
        <div className="sheet-cards-grid">
          {((d.passos as string[]) ?? []).map((p, i) => (
            <div key={i} className="sheet-card sheet-card-solo">
              <span className="sheet-card-word">{p}</span>
            </div>
          ))}
          <p className="sheet-tip">Recorte e cole na ordem do dia de vocês no quadro ao lado. 👉</p>
        </div>
      );
    case "nomear-figura":
      return (
        <div className="sheet-grid sheet-grid-3">
          {((d.figuras as string[]) ?? []).map((f, i) => (
            <div key={i} className="sheet-box sheet-box-lg">{f}<span className="sheet-count-ans sheet-fig-line">______</span></div>
          ))}
        </div>
      );
    case "estrela-dia":
      return (
        <div className="sheet-star-wrap">
          <div className="sheet-big-stars">⭐ ⭐ ⭐</div>
          <p className="sheet-tip">Coloriu e terminou? Pintem a estrela grande — vocês conseguiram! 🎉</p>
        </div>
      );
    case "professor-plan":
      return (
        <div className="sheet-stack">
          {((d.partes as { titulo: string; linhas: string[] }[]) ?? []).map((p, i) => (
            <div key={i} className="sheet-plan-part">
              <h2 className="sheet-plan-title">{p.titulo}</h2>
              <ul className="sheet-plan-lines">
                {p.linhas.map((l, j) => (
                  <li key={j}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    default:
      return <p className="sheet-tip">{a.summary}</p>;
  }
}

export function PrintStartButton() {
  return (
    <button type="button" className="btn no-print" onClick={() => window.print()}>
      🖨️ Imprimir
    </button>
  );
}

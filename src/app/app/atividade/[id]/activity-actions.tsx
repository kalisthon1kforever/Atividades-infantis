"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markDoneAction, toggleFavoriteAction } from "../../actions";
import { categoryIcon } from "@/lib/catalog-shared";
import type { Activity } from "@/lib/types";

export function ActivityActions({
  activityId,
  doneToday,
  favorito,
  nextActivity,
}: {
  activityId: string;
  doneToday: boolean;
  favorito: boolean;
  nextActivity?: Activity | null;
}) {
  const [marked, setMarked] = useState(doneToday);
  const [celebrando, setCelebrando] = useState(false);
  const [fav, setFav] = useState(favorito);
  const [pending, startTransition] = useTransition();
  const [stateMessage, setStateMessage] = useState<string | null>(null);

  function marcarFizemos() {
    startTransition(async () => {
      const res = await markDoneAction(activityId);
      if (res.ok) {
        setMarked(true);
        setCelebrando(true);
        setStateMessage(res.message ?? null);
        window.setTimeout(() => setCelebrando(false), 6000);
      } else if (res.error) {
        setStateMessage(res.error);
      }
    });
  }

  function alternarFavorito() {
    const next = !fav;
    setFav(next);
    startTransition(async () => {
      const res = await toggleFavoriteAction(activityId, next);
      if (!res.ok && res.error) {
        setFav(!next);
        setStateMessage(res.error);
      }
    });
  }

  return (
    <div className="app-act-actions">
      <div className="app-btn-row">
        <button type="button" className="btn" onClick={marcarFizemos} disabled={pending || marked}>
          {marked ? "✅ Fizemos juntos hoje" : pending ? "Marcando..." : "💛 Fizemos juntos hoje"}
        </button>
        <Link
          href={`/app/atividade/${activityId}/imprimir`}
          target="_blank"
          className="btn btn-ghost"
        >
          🖨️ Imprimir esta ficha
        </Link>
        <button
          type="button"
          className={`app-fav-btn app-fav-lg ${fav ? "is-on" : ""}`}
          onClick={alternarFavorito}
          disabled={pending}
          aria-label={fav ? "Remover dos favoritos" : "Marcar como favorito"}
        >
          {fav ? "❤️" : "🤍"}
        </button>
      </div>

      {celebrando && stateMessage ? (
        <p className="app-celebrate" role="status">
          ✨ {stateMessage} +1 estrela pra criança! Volte amanhã sem pressa — o momento já está guardado.
        </p>
      ) : null}
      {!celebrando && !marked && stateMessage ? <p className="app-note-msg">{stateMessage}</p> : null}

      {marked ? (
        <section className="app-card app-next">
          <p className="app-kicker">E agora?</p>
          {nextActivity ? (
            <>
              <p className="app-next-line">
                Que tal a próxima? {categoryIcon(nextActivity.category)} <strong>{nextActivity.title}</strong>
              </p>
              <div className="app-btn-row">
                <Link href={`/app/atividade/${nextActivity.id}`} className="btn btn-sm">
                  Abrir próxima atividade
                </Link>
                <Link href="/app/biblioteca" className="btn btn-ghost btn-sm">
                  Voltar para a biblioteca
                </Link>
              </div>
            </>
          ) : (
            <div className="app-btn-row">
              <Link href="/app/biblioteca" className="btn btn-ghost btn-sm">
                Voltar para a biblioteca
              </Link>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

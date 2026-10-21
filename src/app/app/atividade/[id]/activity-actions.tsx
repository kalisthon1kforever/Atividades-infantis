"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markDoneAction, toggleFavoriteAction } from "../../actions";

export function ActivityActions({
  activityId,
  doneToday,
  favorito,
}: {
  activityId: string;
  doneToday: boolean;
  favorito: boolean;
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
        window.setTimeout(() => setCelebrando(false), 5200);
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
    </div>
  );
}

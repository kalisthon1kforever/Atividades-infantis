"use client";

import { useState, useTransition } from "react";
import { completeTrailDayAction } from "../actions";

export function CompleteTrailDayButton({
  day,
  activityId,
  activityTitle,
}: {
  day: number;
  activityId: string;
  activityTitle: string;
}) {
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function fechar() {
    startTransition(async () => {
      const res = await completeTrailDayAction(day, activityId);
      if (res.ok) {
        setDone(true);
        setMessage(res.message ?? null);
      } else if (res.error) {
        setMessage(res.error);
      }
    });
  }

  if (done) {
    return (
      <p className="app-celebrate" role="status">
        ✨ {message} Dia {day} fechado! Amanhã aparece o próximo, sem pressa.
      </p>
    );
  }

  return (
    <>
      <button type="button" className="btn" onClick={fechar} disabled={pending}>
        {pending ? "Fechando o dia..." : `✅ Fechamos o dia ${day} juntos`}
      </button>
      {message && !done ? <p className="app-note-msg">{message}</p> : null}
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const BASE_MS = 30;
const MAX_TYPING_MS = 4200;
const HOLD_MS = 1600;

function pauseAfter(char: string) {
  if (char === "." || char === "!" || char === "?") return 260;
  if (char === "," || char === ":" || char === ";" || char === "—") return 120;
  return 0;
}

export function TypedFeedback({
  body,
  extra,
  onDone,
}: {
  body: string;
  extra?: string;
  onDone: () => void;
}) {
  const bodyChars = useMemo(() => Array.from(body), [body]);
  const extraChars = useMemo(() => Array.from(extra ?? ""), [extra]);
  const total = bodyChars.length + extraChars.length;
  const [count, setCount] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const finished = count >= total;

  useEffect(() => {
    if (finished) {
      const hold = window.setTimeout(() => doneRef.current(), HOLD_MS);
      return () => window.clearTimeout(hold);
    }
    const speed = Math.min(BASE_MS, MAX_TYPING_MS / Math.max(1, total));
    const prev = count <= bodyChars.length ? bodyChars[count - 1] ?? "" : extraChars[count - bodyChars.length - 1] ?? "";
    const startPause = count === 0 || count === bodyChars.length ? 320 : 0;
    const delay = startPause + speed + Math.random() * speed * 0.6 + pauseAfter(prev) * (speed / BASE_MS);
    const tick = window.setTimeout(() => setCount((value) => value + 1), delay);
    return () => window.clearTimeout(tick);
  }, [count, finished, total, bodyChars, extraChars]);

  const bodyShown = bodyChars.slice(0, count).join("");
  const extraShown = extraChars.slice(0, Math.max(0, count - bodyChars.length)).join("");
  const onExtra = extraChars.length > 0 && count >= bodyChars.length;

  function onTap() {
    if (!finished) {
      setCount(total);
      return;
    }
    doneRef.current();
  }

  return (
    <div className="qz-feedback" role="status" aria-live="polite" onClick={onTap}>
      <div className="qz-feedback-card">
        <span className="qz-sr-only">{extra ? `${body} ${extra}` : body}</span>
        <p className="qz-typed" aria-hidden="true">
          <span className="qz-typed-ghost">{body}</span>
          <span className="qz-typed-live">
            {bodyShown}
            {!onExtra && !finished ? <span className="qz-caret" /> : null}
          </span>
        </p>
        {extra ? (
          <p className="qz-typed qz-feedback-extra" aria-hidden="true">
            <span className="qz-typed-ghost">{extra}</span>
            <span className="qz-typed-live">
              {extraShown}
              {onExtra && !finished ? <span className="qz-caret" /> : null}
            </span>
          </p>
        ) : null}
        <span className={finished ? "qz-feedback-tap is-ready" : "qz-feedback-tap"}>
          {finished ? "Toque para continuar →" : "Toque para ver tudo"}
        </span>
      </div>
    </div>
  );
}

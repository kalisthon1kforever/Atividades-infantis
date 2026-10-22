"use client";

import { useEffect, useState } from "react";
import { useExitIntent } from "@/app/qz/exit-intent";
import { track } from "@/app/qz/track";

export function HomeExitPopup() {
  const [open, setOpen] = useState(false);

  useExitIntent(
    true,
    (reason) => {
      setOpen(true);
      track("home_popup_open", { reason });
    },
    "home"
  );

  useEffect(() => {
    if (!open) return;
    function onMessage(event: MessageEvent<{ source?: string; action?: string }>) {
      const data = event.data;
      if (!data || data.source !== "pp-funil") return;
      if (data.action === "close-popup") {
        setOpen(false);
        track("home_popup_close");
      }
      if (data.action === "popup-sample") {
        track("home_popup_sample");
        window.location.assign("/qz?etapa=captura");
      }
      if (data.action === "checkout-total") {
        track("home_popup_paid");
        window.location.assign("/qz?etapa=checkout-total");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open]);

  if (!open) return null;
  return (
    <div className="qz-popup-layer" role="dialog" aria-modal="true">
      <iframe className="qz-popup-frame" src="/funil/popup.html" title="Oferta especial Pequenos Passos" />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { track } from "@/app/qz/track";

export function AcessoCliente() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mail = params.get("email") || "";
    track("quiz_popup_open", { reason: "pagina" });
    history.pushState({ acesso: 1 }, "", location.href);

    function onMessage(event: MessageEvent<{ source?: string; action?: string }>) {
      const data = event.data;
      if (!data || data.source !== "pp-funil") return;
      if (data.action === "popup-sample") {
        track("quiz_popup_sample");
        window.location.assign("/qz");
      }
      if (data.action === "checkout-total") {
        track("quiz_popup_paid");
        const destino = new URL("/checkout", window.location.origin);
        destino.searchParams.set("produto", "acesso-total");
        if (mail) destino.searchParams.set("email", mail);
        window.location.assign(destino.toString());
      }
    }

    function onPop() {
      history.pushState({ acesso: 1 }, "", location.href);
    }

    window.addEventListener("message", onMessage);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return (
    <div className="qz-popup-layer" role="dialog" aria-modal="true" aria-label="Acesso Total por R$ 19,90">
      <iframe
        className="qz-popup-frame"
        src="/funil/popup.html?obrigatorio=1"
        title="Acesso Total por R$ 19,90"
      />
    </div>
  );
}

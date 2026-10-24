"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/app/qz/track";

type CheckoutMessage = {
  source?: string;
  action?: string;
  email?: string;
  name?: string;
  product?: string;
  bumps?: string[];
  combo?: boolean;
  method?: string;
  ultimaHora?: boolean;
};

export default function CheckoutPage() {
  const [src, setSrc] = useState("/funil/checkout.html");
  const [oferta19, setOferta19] = useState(false);
  const produtoRef = useRef("kit-inicial");
  const emailRef = useRef("");
  const busyRef = useRef(false);

  useEffect(() => {
    track("quiz_checkout_view");
    const params = new URLSearchParams(window.location.search);
    const produto = params.get("produto") === "acesso-total" ? "acesso-total" : "kit-inicial";
    const email = params.get("email") || "";
    produtoRef.current = produto;
    emailRef.current = email;
    const url = new URL("/funil/checkout.html", window.location.origin);
    url.searchParams.set("produto", produto);
    if (email) url.searchParams.set("email", email);
    setSrc(`${url.pathname}${url.search}`);

    function abrirSaida() {
      if (produtoRef.current !== "kit-inicial" || busyRef.current) return;
      setOferta19(true);
    }

    if (produto === "kit-inicial") {
      history.pushState({ kit: 1 }, "", location.href);
    }

    function onPop() {
      if (produtoRef.current !== "kit-inicial" || busyRef.current) return;
      history.pushState({ kit: 1 }, "", location.href);
      abrirSaida();
    }

    function onVis() {
      if (document.visibilityState === "hidden") abrirSaida();
    }

    async function onMessage(event: MessageEvent<CheckoutMessage>) {
      const data = event.data;
      if (!data || data.source !== "pp-funil") return;
      if (data.action === "exit-intent") {
        abrirSaida();
        return;
      }
      if (data.action === "close-popup") {
        setOferta19(false);
        return;
      }
      if (data.action === "popup-sample") {
        window.location.assign("/qz");
        return;
      }
      if (data.action === "checkout-total") {
        const destino = new URL("/checkout", window.location.origin);
        destino.searchParams.set("produto", "acesso-total");
        if (emailRef.current) destino.searchParams.set("email", emailRef.current);
        window.location.assign(destino.toString());
        return;
      }
      if (data.action !== "submit-checkout" || busyRef.current) return;
      busyRef.current = true;
      const frame = document.querySelector<HTMLIFrameElement>("iframe.qz-popup-frame");
      frame?.contentWindow?.postMessage({ source: "pp-checkout", action: "busy" }, "*");
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            name: data.name,
            product: data.product === "acesso-total" ? "acesso-total" : produto,
            bumps: data.bumps || [],
            combo: Boolean(data.combo),
            method: data.method || "card",
            ultimaHora: data.ultimaHora === true && produto === "kit-inicial",
          }),
        });
        const json = (await response.json()) as { initPoint?: string; message?: string };
        if (!response.ok || !json.initPoint) {
          busyRef.current = false;
          frame?.contentWindow?.postMessage(
            { source: "pp-checkout", action: "error", message: json.message || "Não foi possível abrir o pagamento." },
            "*",
          );
          return;
        }
        track("quiz_checkout_submit", { product: produto });
        window.location.assign(json.initPoint);
      } catch {
        busyRef.current = false;
        frame?.contentWindow?.postMessage(
          { source: "pp-checkout", action: "error", message: "Sem conexão agora. Tente de novo em instantes." },
          "*",
        );
      }
    }

    window.addEventListener("message", onMessage);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return (
    <div className="qz-popup-layer">
      <iframe className="qz-popup-frame" src={src} title="Checkout seguro Pequenos Passos" />
      {oferta19 ? (
        <div className="qz-popup-layer" style={{ zIndex: 90 }} role="dialog" aria-modal="true" aria-label="Acesso Total por R$ 19,90">
          <iframe className="qz-popup-frame" src="/funil/popup.html" title="Acesso Total por R$ 19,90" />
        </div>
      ) : null}
    </div>
  );
}

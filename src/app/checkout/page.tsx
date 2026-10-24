"use client";

import { FormEvent, useEffect, useState } from "react";
import { AVISO_COMPLEMENTAR, GARANTIA_DIAS, PRECO_KIT, reais, STORAGE_KEY } from "@/lib/funil/modelo";
import { track } from "@/app/qz/track";

export default function CheckoutPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"pix" | "card" | "boleto">("pix");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    track("quiz_checkout_view");
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("email") || "";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const salvo = raw ? (JSON.parse(raw) as { email?: string }) : {};
      setEmail(fromQuery || salvo.email || "");
    } catch {
      setEmail(fromQuery);
    }
  }, []);

  async function pagar(event: FormEvent) {
    event.preventDefault();
    if (!nome.trim() || !email.includes("@")) {
      setErro("Preencha nome e e-mail para seguir ao pagamento.");
      return;
    }
    setEnviando(true);
    setErro("");
    track("quiz_checkout_submit");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: nome.trim(),
          product: "kit-inicial",
          bumps: [],
          combo: false,
          method,
        }),
      });
      const json = (await response.json()) as { initPoint?: string; message?: string };
      if (!response.ok || !json.initPoint) {
        setErro(json.message || "Não foi possível abrir o pagamento.");
        setEnviando(false);
        return;
      }
      window.location.assign(json.initPoint);
    } catch {
      setErro("Sem conexão agora. Tente de novo em instantes.");
      setEnviando(false);
    }
  }

  return (
    <main className="fn-root">
      <header className="fn-top">
        <p className="fn-brand">Pequenos Passos</p>
      </header>
      <section className="fn-card">
        <h1>Seu pedido</h1>
        <ul className="fn-order">
          <li>
            <span>Kit Completo — 13 cadernos</span>
            <b>{reais(PRECO_KIT)}</b>
          </li>
          <li>
            <span>Acesso à Área Família + app</span>
            <b>incluso</b>
          </li>
        </ul>
        <p className="fn-seals">Pagamento seguro · {GARANTIA_DIAS} dias de garantia · PIX, cartão ou boleto</p>
        <form onSubmit={pagar}>
          <label>
            Nome
            <input value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" required />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <fieldset>
            <legend>Como pagar</legend>
            {(
              [
                ["pix", "PIX"],
                ["card", "Cartão"],
                ["boleto", "Boleto"],
              ] as const
            ).map(([id, label]) => (
              <label key={id} className="fn-pay">
                <input
                  type="radio"
                  name="method"
                  checked={method === id}
                  onChange={() => setMethod(id)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          {erro ? <p className="fn-erro">{erro}</p> : null}
          <p className="fn-guarantee">Garantia de {GARANTIA_DIAS} dias, incondicional</p>
          <button className="fn-primary fn-block" type="submit" disabled={enviando}>
            {enviando ? "Abrindo o pagamento…" : `Pagar ${reais(PRECO_KIT)}`}
          </button>
        </form>
        <p className="fn-fine">
          Login e senha provisória da Área Família chegam no e-mail depois da confirmação. Os PDFs seguem disponíveis para imprimir.
        </p>
        <p className="fn-fine">{AVISO_COMPLEMENTAR}</p>
      </section>
    </main>
  );
}

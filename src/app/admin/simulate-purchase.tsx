"use client";

import { useState } from "react";
import { simulatePurchaseAction, type AdminActionResult } from "./actions";
import { BUMP_KEYS } from "@/lib/catalog-prices";
import { PRODUCTS } from "@/lib/products";

export function SimulatePurchase({ email: fixedEmail, name: fixedName }: { email?: string; name?: string }) {
  const [email, setEmail] = useState(fixedEmail ?? "");
  const [name, setName] = useState(fixedName ?? "");
  const [product, setProduct] = useState<"kit-inicial" | "acesso-total">("kit-inicial");
  const [bumps, setBumps] = useState<string[]>([]);
  const [combo, setCombo] = useState(false);
  const [state, setState] = useState<AdminActionResult>({});
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!email.includes("@")) {
      setState({ error: "Coloque um e-mail válido." });
      return;
    }
    setPending(true);
    try {
      setState(await simulatePurchaseAction({ email, name, product, bumps, combo }));
    } catch (err) {
      setState({ error: err instanceof Error ? err.message : "Erro inesperado." });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-card">
      <h2>Simular compra completa</h2>
      <p className="admin-hint">Não cobra no Mercado Pago. Cria o pedido, libera os produtos e manda a senha só por e-mail.</p>
      {fixedEmail ? null : (
        <div className="admin-inline">
          <input type="email" placeholder="e-mail da pessoa" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="nome" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}
      <div className="admin-inline">
        <select value={product} onChange={(e) => setProduct(e.target.value as "kit-inicial" | "acesso-total")}>
          <option value="kit-inicial">{PRODUCTS["kit-inicial"].label}</option>
          <option value="acesso-total">{PRODUCTS["acesso-total"].label}</option>
        </select>
        <label>
          <input type="checkbox" checked={combo} onChange={(e) => setCombo(e.target.checked)} /> combo
        </label>
      </div>
      {combo ? null : (
        <div className="admin-inline">
          {BUMP_KEYS.map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={bumps.includes(key)}
                onChange={(e) => {
                  setBumps((current) => (e.target.checked ? [...current, key] : current.filter((item) => item !== key)));
                }}
              />{" "}
              {PRODUCTS[key].label}
            </label>
          ))}
        </div>
      )}
      <button type="button" className="btn" disabled={pending} onClick={submit}>
        {pending ? "Simulando..." : "Simular compra completa"}
      </button>
      {state.error ? <p className="ent-error" role="alert">{state.error}</p> : null}
      {state.message ? <p className="admin-ok">{state.message}</p> : null}
    </section>
  );
}

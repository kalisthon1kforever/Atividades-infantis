"use client";

import { useState } from "react";
import {
  addNoteAction,
  grantProductAction,
  markMustChangeAction,
  resendAccessAction,
  revokeProductAction,
  type AdminActionResult,
} from "../actions";
import { SimulatePurchase } from "../simulate-purchase";
import { PRODUCTS, type ProductKey } from "@/lib/products";

const initialState: AdminActionResult = {};

export function PersonActions({
  userId,
  email,
  name,
  owned,
}: {
  userId: string;
  email: string;
  name: string;
  owned: string[];
}) {
  const [product, setProduct] = useState<ProductKey>("kit-inicial");
  const [state, setState] = useState<AdminActionResult>({});
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");

  async function run(fn: () => Promise<AdminActionResult>) {
    setPending(true);
    try {
      setState(await fn());
    } catch (err) {
      setState({ error: err instanceof Error ? err.message : "Erro inesperado." });
    } finally {
      setPending(false);
    }
  }

  const feedback = state.error ? (
    <p className="ent-error" role="alert">{state.error}</p>
  ) : state.message ? (
    <p className="admin-ok">{state.message}</p>
  ) : null;

  return (
    <div className="admin-actions-grid">
      {feedback ? <div className="admin-feedback">{feedback}</div> : null}

      <section className="admin-card">
        <h2>Produtos</h2>
        <p>Tem hoje: <b>{owned.length > 0 ? owned.join(", ") : "só a amostra"}</b></p>
        <div className="admin-inline">
          <select value={product} onChange={(e) => setProduct(e.target.value as ProductKey)}>
            {Object.entries(PRODUCTS)
              .filter(([k]) => k !== "amostra")
              .map(([k, v]) => (
                <option key={k} value={k}>{v.label} — {v.priceLabel}</option>
              ))}
          </select>
          <button type="button" className="btn" disabled={pending} onClick={() => run(() => grantProductAction(email, product))}>
            {pending ? "..." : "Liberar"}
          </button>
          {owned.includes(product) ? (
            <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => run(() => revokeProductAction(email, product))}>
              Revogar este
            </button>
          ) : null}
        </div>
        {owned.length > 0 ? (
          <div className="admin-inline">
            <span>Revogar rápido:</span>
            {owned.map((p) => (
              <button key={p} type="button" className="admin-mini" disabled={pending} onClick={() => run(() => revokeProductAction(email, p))}>
                ✕ {p}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <SimulatePurchase email={email} name={name} />

      <section className="admin-card">
        <h2>Acesso e senha</h2>
        <p className="admin-hint">O admin nunca vê a senha. Reenviar gera senha temporária NOVA e marca a troca obrigatória.</p>
        <div className="admin-inline">
          <button type="button" className="btn" disabled={pending} onClick={() => run(() => resendAccessAction(email, name))}>
            {pending ? "Enviando..." : "✉️ Reenviar e-mail de acesso (senha nova)"}
          </button>
          <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => run(() => markMustChangeAction(email, true))}>
            Marcar senha p/ troca
          </button>
        </div>
      </section>

      <section className="admin-card">
        <h2>Comentário interno</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Ex.: falou no WhatsApp que comprou kit + combo em 20/10..."
        />
        <div className="admin-inline">
          <button
            type="button"
            className="btn"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const res = await addNoteAction(email, userId, note);
                if (res.ok) setNote("");
                return res;
              })
            }
          >
            Salvar comentário
          </button>
        </div>
      </section>
    </div>
  );
}

export function NoteList({ notes }: { notes: { created_at?: string; note: string }[] }) {
  if (notes.length === 0) return <p className="admin-hint">Sem anotações ainda.</p>;
  return (
    <ul className="admin-notes">
      {notes.map((n, i) => (
        <li key={i}>
          {n.note}
          <small>{n.created_at ? new Date(n.created_at).toLocaleString("pt-BR") : ""}</small>
        </li>
      ))}
    </ul>
  );
}

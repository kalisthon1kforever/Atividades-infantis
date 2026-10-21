import Link from "next/link";
import { formatBr, fetchAllRows } from "@/lib/admin-data";
import type { LeadRow } from "@/lib/types";

export const metadata = { title: "Funil — Admin" };

const QUESTIONS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export default async function AdminFunilPage() {
  const leads = (await fetchAllRows<LeadRow & Record<string, unknown>>("/rest/v1/leads", {
    select: "*",
  })) as (LeadRow & Record<string, unknown>)[];

  return (
    <div className="admin-pad">
      <h1>Funil — leads do quiz</h1>
      <p className="admin-lead">
        Cada linha é uma captura do POST /api/quiz-lead, já persistida no Supabase.
      </p>

      {leads.length === 0 ? (
        <section className="admin-card">
          <p>Nenhum lead salvo ainda. Passe pelo quiz /qz (nome + e-mail) para ver o fluxo inteiro.</p>
        </section>
      ) : (
        <section className="admin-card admin-wide">
          <table className="admin-table admin-table-flow">
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Canal</th>
                <th>Respostas (q1→q6)</th>
                <th>Compra?</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const answers = (l.answers ?? {}) as Record<string, { key?: string; label?: string }>;
                return (
                  <tr key={String(l.id)}>
                    <td>{formatBr(l.created_at)}</td>
                    <td>{String(l.name || "—")}</td>
                    <td><b>{l.email}</b></td>
                    <td>{String(l.channel || "email")}</td>
                    <td className="admin-answers">
                      {QUESTIONS.map((q) => {
                        const el = answers[q];
                        return (
                          <span key={q} className={`admin-ans ${el?.key ? "is-on" : ""}`}>
                            <b>{q}</b> {el ? (el.label || el.key) : "—"}
                          </span>
                        );
                      })}
                    </td>
                    <td>
                      {l.converted ? (
                        <span className="admin-badge admin-badge-ok">✓ {l.purchased?.join(", ")}</span>
                      ) : (
                        <Link className="admin-badge" href={`/admin/pessoas?q=${encodeURIComponent(l.email)}`}>
                          ficha
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <p className="admin-note">
        Tabela <code>leads</code> — colunas: nome, e-mail, canal, as 6 respostas (JSON), data e
        se virou compra (com o produto). Registros novos chegam pelo próprio quiz.
      </p>
    </div>
  );
}

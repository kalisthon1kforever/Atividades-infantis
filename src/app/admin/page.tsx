import { serviceFetch } from "@/lib/supabase/service";
import { productLabel } from "@/lib/products";
import { formatBr, fetchAllRows } from "@/lib/admin-data";

export const metadata = { title: "Painel — Admin" };

export default async function AdminPainelPage() {
  const [leads, entitles, profiles, progress, activities] = await Promise.all([
    serviceFetch<Record<string, unknown>[]>("/rest/v1/leads", { searchParams: { select: "*" } }),
    serviceFetch<Record<string, unknown>[]>("/rest/v1/entitlements", { searchParams: { select: "*" } }),
    serviceFetch<Record<string, unknown>[]>("/rest/v1/profiles", { searchParams: { select: "*" } }),
    serviceFetch<{ activity_id: string }[]>("/rest/v1/activity_progress", { searchParams: { select: "user_id,activity_id,log_date" } }),
    fetchAllRows<Record<string, unknown>>("/rest/v1/activities", { select: "id,title,category" }),
  ]);

  const leadsRows = leads.ok ? leads.data ?? [] : [];
  const entRows = entitles.ok ? entitles.data ?? [] : [];
  const profRows = profiles.ok ? profiles.data ?? [] : [];
  const progRows = progress.ok ? progress.data ?? [] : [];

  const compras = entRows.filter(
    (e) => String(e.product ?? "") !== "amostra",
  );
  const convertidos = leadsRows.filter((l) => l.converted === true).length;

  const seven = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const ativos7d = profRows.filter((p) => {
    const last = typeof p.last_access === "string" ? new Date(p.last_access).getTime() : 0;
    return last >= seven;
  });

  const counts = new Map<string, number>();
  for (const row of progRows) {
    counts.set(row.activity_id, (counts.get(row.activity_id) ?? 0) + 1);
  }
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, n]) => {
      const a = activities.find((x) => String(x.id) === id);
      return { id, title: a ? String(a.title) : id, category: a ? String(a.category) : "", n };
    });

  const cards = [
    { label: "Leads do funil", value: leadsRows.length, hint: `${convertidos} viraram compra` },
    { label: "Compras registradas", value: compras.length, hint: compras.length ? compras.map((c) => productLabel(String(c.product ?? ""))).slice(0, 3).join(", ") : "pagamento real continua off" },
    { label: "Contas ativas (7 dias)", value: ativos7d.length, hint: `${profRows.length} perfis no total` },
    { label: "Momentos feitos", value: progRows.length, hint: "linhas de “fizemos juntos”" },
  ];

  return (
    <div className="admin-pad">
      <h1>Painel</h1>
      <p className="admin-lead">Só números que estão no banco. Nada inventado, nada inflado.</p>

      <section className="admin-cards">
        {cards.map((c) => (
          <article key={c.label} className="admin-card">
            <small>{c.label}</small>
            <b>{c.value}</b>
            <p>{c.hint}</p>
          </article>
        ))}
      </section>

      <section className="admin-card admin-wide">
        <h2>Atividades mais concluídas</h2>
        {top.length === 0 ? (
          <p>Sem marcações ainda — as primeiras “fizemos juntos” aparecem aqui. 💛</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Atividade</th><th>Categoria</th><th>Fizemos juntos</th></tr>
            </thead>
            <tbody>
              {top.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td><b>{t.n}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-card admin-wide">
        <h2>Últimas pessoas ativas</h2>
        {profRows.length === 0 ? (
          <p>Ninguém entrou na área ainda.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Nome</th><th>Último acesso</th></tr>
            </thead>
            <tbody>
              {profRows
                .sort((a, b) => String(b.last_access).localeCompare(String(a.last_access)))
                .slice(0, 8)
                .map((p) => (
                  <tr key={String(p.user_id)}>
                    <td>{String(p.name || "—")}</td>
                    <td>{formatBr(p.last_access)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

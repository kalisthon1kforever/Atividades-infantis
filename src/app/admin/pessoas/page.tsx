import Link from "next/link";
import { adminListUsers, type AdminUser } from "@/lib/supabase/service";
import { fetchAllRows, formatBr } from "@/lib/admin-data";
import { productLabel } from "@/lib/products";
import type { EntitlementRow, ProfileRow, ProgressRow } from "@/lib/types";

export const metadata = { title: "Pessoas — Admin" };

export default async function AdminPessoasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();

  const users = await adminListUsers(1, 200);
  const [entRows, profRows, progRows] = await Promise.all([
    fetchAllRows<EntitlementRow>("/rest/v1/entitlements", { select: "user_id,product,source,created_at" }),
    fetchAllRows<ProfileRow>("/rest/v1/profiles", { select: "user_id,name,last_access" }),
    fetchAllRows<ProgressRow>("/rest/v1/activity_progress", { select: "user_id,activity_id,log_date" }),
  ]);

  const list: (AdminUser & { entProducts: string[]; lastAccess?: string; done: number })[] = (
    users.ok ? users.data ?? [] : []
  ).map((u) => ({
    ...u,
    entProducts: entRows.filter((e) => e.user_id === u.id).map((e) => e.product),
    lastAccess: profRows.find((p) => p.user_id === u.id)?.last_access,
    done: progRows.filter((p) => p.user_id === u.id).length,
  })).filter((u) => {
    if (!q) return true;
    const name = u.user_metadata?.name ? String(u.user_metadata.name) : "";
    return u.email.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  return (
    <div className="admin-pad">
      <h1>Pessoas</h1>
      <p className="admin-lead">{list.length} contas no Auth. Busca por e-mail ou nome.</p>

      <form className="admin-search" action="/admin/pessoas" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar e-mail ou nome..."
        />
        <button type="submit" className="btn">Buscar</button>
        {q ? <Link href="/admin/pessoas" className="admin-reset">limpar</Link> : null}
      </form>

      {list.length === 0 ? (
        <section className="admin-card"><p>Nada encontrado para “{q}”. Vamos checar com outro termo?</p></section>
      ) : (
        <section className="admin-card admin-wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Nome</th>
                <th>Produtos</th>
                <th>Último acesso</th>
                <th>Feitas</th>
                <th>Ficha</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.email}</b></td>
                  <td>{(u.user_metadata?.name as string) || "—"}</td>
                  <td>
                    {u.entProducts.length === 0 ? (
                      <span className="admin-badge">amostra</span>
                    ) : (
                      u.entProducts.map((p) => <span key={p} className="admin-badge admin-badge-ok">{productLabel(p)}</span>)
                    )}
                  </td>
                  <td>{formatBr(u.lastAccess)}</td>
                  <td>{u.done}</td>
                  <td><Link href={`/admin/pessoas/${u.id}`} className="admin-badge">abrir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="admin-note">
        Vindo do GoTrue (admin users) + <code>entitlements</code>/<code>activity_progress</code> via
        service_role. O admin nunca vê senha — só reenvia e-mail de acesso com senha temporária nova.
      </p>
    </div>
  );
}

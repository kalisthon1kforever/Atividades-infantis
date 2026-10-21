import Link from "next/link";
import { fetchAllRows } from "@/lib/admin-data";
import { productLabel } from "@/lib/products";
import { publishActivityAction } from "../actions";
import type { Activity } from "@/lib/types";

export const metadata = { title: "Catálogo — Admin" };

export default async function AdminCatalogoPage() {
  const rows = (await fetchAllRows<Activity>("/rest/v1/activities", {
    select: "id,title,summary,category,duration_min,age_min,age_max,format,bw,audience,product_key,is_published",
    order: "category.asc",
  })) as Activity[];

  return (
    <div className="admin-pad">
      <h1>
        Catálogo{" "}
        <Link href="/admin/catalogo/novo" className="admin-badge">
          + nova ficha
        </Link>
      </h1>
      <p className="admin-lead">{rows.length} fichas — publicar/ocultar afeta a biblioteca na hora.</p>

      {rows.length === 0 ? (
        <section className="admin-card">
          <p>Catálogo vazio no banco. Rode o seed em supabase/migrations para carregar as fichas.</p>
        </section>
      ) : (
        <section className="admin-card admin-wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ficha</th>
                <th>Categoria</th>
                <th>Tempo/idade</th>
                <th>Formato</th>
                <th>Produto</th>
                <th>Status</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={String(a.id)}>
                  <td>
                    <b>{String(a.title)}</b>
                    <br />
                    <small>{String(a.id)}</small>
                  </td>
                  <td>{String(a.category)}</td>
                  <td>
                    {String(a.duration_min)}min · {String(a.age_min)}–{String(a.age_max)}
                  </td>
                  <td>
                    {String(a.format)}
                    {a.bw ? " · p&b" : ""}
                    {a.audience === "professor" ? " · prof" : ""}
                  </td>
                  <td>
                    <span className="admin-badge">{productLabel(String(a.product_key))}</span>
                  </td>
                  <td>
                    <div className="admin-pair">
                      <form action={publishActivityAction.bind(null, String(a.id), true)}>
                        <button type="submit" className={`admin-mini ${a.is_published ? "is-on" : ""}`}>
                          ▲ publicar
                        </button>
                      </form>
                      <form action={publishActivityAction.bind(null, String(a.id), false)}>
                        <button type="submit" className={`admin-mini ${!a.is_published ? "is-on" : ""}`}>
                          ▼ ocultar
                        </button>
                      </form>
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/catalogo/${String(a.id)}`} className="admin-badge">
                      editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

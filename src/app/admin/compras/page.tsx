import { serviceFetch } from "@/lib/supabase/service";
import { productLabel } from "@/lib/products";

export const metadata = { title: "Compras — Admin" };

type OrderRow = {
  id: string;
  payment_id: string;
  email: string;
  nome: string;
  produtos: string[] | null;
  total: number | string;
  status: string;
  origem: string;
  created_at: string;
};

export default async function ComprasPage() {
  const res = await serviceFetch<OrderRow[]>("/rest/v1/checkout_orders", {
    searchParams: {
      select: "id,payment_id,email,nome,produtos,total,status,origem,created_at",
      order: "created_at.desc",
      limit: "100",
    },
  });

  if (!res.ok) {
    return (
      <section className="admin-card">
        <h1>Compras</h1>
        <p>
          A tabela de pedidos ainda não está no banco. Cole{" "}
          <b>supabase/migrations/20261021000000_checkout_orders.sql</b> no SQL Editor,
          depois da migration da área logada.
        </p>
      </section>
    );
  }

  const rows = res.data ?? [];
  return (
    <section className="admin-card">
      <h1>Compras</h1>
      <p className="admin-hint">{rows.length} pedido(s). A senha não aparece aqui.</p>
      {rows.length === 0 ? <p>Nenhuma compra registrada ainda. Use “Simular compra completa” na ficha da pessoa.</p> : null}
      {rows.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Quando</th>
              <th>Pessoa</th>
              <th>Produtos</th>
              <th>Total</th>
              <th>Origem</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.created_at).toLocaleString("pt-BR")}</td>
                <td>
                  {row.nome || "—"}
                  <br />
                  <small>{row.email}</small>
                </td>
                <td>{(row.produtos || []).map((item) => productLabel(item)).join(", ") || "—"}</td>
                <td>R$ {Number(row.total).toFixed(2).replace(".", ",")}</td>
                <td>{row.origem}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}

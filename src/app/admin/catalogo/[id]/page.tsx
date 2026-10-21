import Link from "next/link";
import { fetchAllRows } from "@/lib/admin-data";
import { ActivityForm } from "../activity-form";
import type { Activity } from "@/lib/types";

export const metadata = { title: "Editar ficha — Admin" };

export default async function EditarFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = (await fetchAllRows<Activity>("/rest/v1/activities", {
    select: "*",
    id: `eq.${decodeURIComponent(id)}`,
  })) as Activity[];

  const initial = rows[0];
  if (!initial) {
    return (
      <div className="admin-pad">
        <p>Ficha “{id}” não está no banco.</p>
        <Link href="/admin/catalogo" className="admin-badge">← catálogo</Link>
      </div>
    );
  }

  return (
    <div className="admin-pad">
      <h1>Editar: {initial.title}</h1>
      <p className="admin-lead"><Link href="/admin/catalogo" className="admin-badge">← catálogo</Link> id <code>{initial.id}</code></p>
      <section className="admin-card admin-wide">
        <ActivityForm initial={initial} />
      </section>
    </div>
  );
}

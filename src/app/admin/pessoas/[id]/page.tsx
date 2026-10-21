import Link from "next/link";
import { adminGetUser, type AdminUser } from "@/lib/supabase/service";
import { fetchActivityTitles, fetchAllRows, formatBr } from "@/lib/admin-data";
import { computeStreak } from "@/lib/area";
import type { ChildRow, EntitlementRow, ProgressRow, TrailRow } from "@/lib/types";
import { PersonActions, NoteList } from "../person-actions";

export const metadata = { title: "Pessoa — Admin" };

export default async function PessoaFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await adminGetUser(id);
  if (!me.ok || !me.data) {
    return (
      <div className="admin-pad">
        <p>Não encontrei esta conta ({id}).</p>
      </div>
    );
  }
  const user: AdminUser = me.data;
  const email = user.email;

  const [entRows, progRows, trailRows, childRows, notes] = await Promise.all([
    fetchAllRows<EntitlementRow>("/rest/v1/entitlements", { select: "user_id,product,source,created_at", user_id: `eq.${id}` }),
    fetchAllRows<ProgressRow>("/rest/v1/activity_progress", { select: "user_id,activity_id,log_date", user_id: `eq.${id}` }),
    fetchAllRows<TrailRow>("/rest/v1/trail_days", { select: "user_id,day,completed,completed_at", user_id: `eq.${id}` }),
    fetchAllRows<ChildRow>("/rest/v1/children", { select: "id,user_id,name,age", user_id: `eq.${id}` }),
    fetchAllRows<{ id: string; note: string; created_at?: string }>("/rest/v1/admin_notes", {
      select: "id,note,created_at",
      email: `eq.${email}`,
      order: "created_at.desc",
    }),
  ]);

  const name = String((user.user_metadata as Record<string, unknown> | undefined)?.name ?? "");
  const owned = entRows.map((e) => e.product);
  const doneIds = Array.from(new Set(progRows.map((p) => p.activity_id)));
  const titles = await fetchActivityTitles(doneIds);
  const streak = computeStreak(progRows);
  const trailDone = trailRows.filter((t) => t.completed).length;
  const lastDone = progRows[0]?.log_date ?? null;

  return (
    <div className="admin-pad">
      <p className="admin-back"><Link href="/admin/pessoas">← Pessoas</Link></p>

      <section className="admin-card admin-wide">
        <h1>{name || user.email}</h1>
        <p className="admin-meta-line">
          <b>{email}</b> · conta criada {formatBr(user.created_at)} · último login {formatBr(user.last_sign_in_at)}
        </p>
        <p className="admin-meta-line">
          papel: <b>{String(user.app_metadata?.role ?? "familia")}</b> · troca de senha pendente:{" "}
          <b>{user.app_metadata?.must_change_password === true ? "SIM" : "não"}</b>
        </p>
        <p className="admin-meta-line">
          streak: <b>{streak}</b> · trilha: {trailDone} dias fechados · último “fizemos juntos”: {lastDone ? formatBr(lastDone) : "nenhum ainda"}
        </p>
        {childRows.length > 0 ? (
          <p className="admin-meta-line">
            criança(s): {childRows.map((c) => `${c.name} (${c.age} anos)`).join(", ")}
          </p>
        ) : null}
      </section>

      <PersonActions userId={id} email={email} name={name} owned={owned} />

      <section className="admin-card admin-wide">
        <h2>Atividades concluídas</h2>
        {doneIds.length === 0 ? (
          <p>Sem marcações ainda.</p>
        ) : (
          <ul className="admin-list-inline">
            {doneIds.slice(0, 40).map((aid) => (
              <li key={aid}>
                {titles[aid] ? <b>{titles[aid]}</b> : <code>{aid}</code>}
              </li>
            ))}
          </ul>
        )}
        {doneIds.length > 40 ? <small>+{doneIds.length - 40} outras…</small> : null}
      </section>

      <section className="admin-card admin-wide">
        <h2>Anotações internas</h2>
        <NoteList notes={notes.map((n) => ({ note: n.note, created_at: n.created_at }))} />
      </section>
    </div>
  );
}

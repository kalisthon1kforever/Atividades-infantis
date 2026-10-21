import { deleteChildAction } from "../actions";
import { getAreaUser, getChildren } from "@/lib/area";
import { ChildForm } from "./child-form";

export const metadata = { title: "Criança — Área da família" };

export default async function CriancaPage() {
  const user = await getAreaUser();
  if (!user) return null;
  const children = await getChildren(user.id);

  return (
    <div className="app-pad">
      <section className="app-welcome">
        <h1>Criança</h1>
        <p className="app-welcome-sub">
          Esta é a área das recompensas — o nome aqui aparece nos selos, na trilha e no certificado.
          A navegação continua com o adulto.
        </p>
      </section>

      {children.map((c) => (
        <section key={c.id} className="app-card">
          <h2>{c.name}</h2>
          <p className="app-meta-line">
            <span>🧒 {c.age} anos</span>
          </p>
          <ChildForm child={{ id: c.id, name: c.name, age: c.age }} />
          <form action={deleteChildAction.bind(null, c.id)} className="app-inline-form">
            <button type="submit" className="app-link-danger">
              Remover {c.name}
            </button>
          </form>
        </section>
      ))}

      <section className="app-card">
        <h2>Adicionar criança novo(a)</h2>
        <ChildForm />
      </section>
    </div>
  );
}

import { signOutAction } from "../actions";
import { getAreaUser, getChildren, getEntitlements } from "@/lib/area";
import { productLabel } from "@/lib/products";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Conta — Área da família" };

export default async function ContaPage() {
  const user = await getAreaUser();
  if (!user) return null;

  const [products, children] = await Promise.all([getEntitlements(user.id), getChildren(user.id)]);
  const productKeys = products.map((p) => p.product);

  return (
    <div className="app-pad">
      <section className="app-welcome">
        <h1>Conta</h1>
        <p className="app-welcome-sub">O que está liberado, senha e saída — sem enrolação.</p>
      </section>

      <section className="app-card">
        <h2>Seus acessos</h2>
        <p className="app-meta-line app-meta-big"><span>📧 {user.email}</span></p>
        {productKeys.length === 0 ? (
          <p>
            Você tem acesso à <b>amostra (10 atividades)</b> agora mesmo. Se faltar algo que você
            achou que estava dentro da sua compra, fala com a gente ou devolve pelo funil /qz.
          </p>
        ) : (
          <ul className="app-int-list">
            {productKeys.map((k) => (
              <li key={k}>
                <b>{productLabel(k)}</b>
                {products.find((p) => p.product === k)?.source ? (
                  <small> · origem: {products.find((p) => p.product === k)?.source}</small>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="app-card">
        <h2>Trocar senha</h2>
        <ChangePasswordForm />
      </section>

      <section className="app-card">
        <h2>Criança(s) acompanhadas</h2>
        {children.length === 0 ? (
          <p>Nenhum nome guardado ainda — fica lindo dar um nome pro quadro de conquistas. 💛</p>
        ) : (
          <ul className="app-int-list">
            {children.map((c) => (
              <li key={c.id}><b>{c.name}</b> · {c.age} anos</li>
            ))}
          </ul>
        )}
      </section>

      <form action={signOutAction}>
        <button type="submit" className="btn btn-ghost app-signout">
          Sair da conta
        </button>
      </form>
    </div>
  );
}

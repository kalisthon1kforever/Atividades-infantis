"use client";

import { useActionState, useState } from "react";
import { forgotPasswordAction, signInAction, type AuthActionState } from "./actions";

const initialState: AuthActionState = {};

export function EntrarForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotState, forgotAction, forgotPending] = useActionState(forgotPasswordAction, initialState);

  return (
    <>
      <section className="ent-card">
        <h1>Entrar na área de quem comprou</h1>
        <p className="ent-lead">
          Bem-vindo, família! Use o e-mail que você recebeu e a senha temporária que
          começa com <strong>“Pp”</strong>. No primeiro acesso, você escolhe uma senha só de vocês.
        </p>

        <form action={formAction} className="ent-form">
          <input type="hidden" name="next" value={nextPath} />
          <label>
            E-mail
            <input type="email" name="email" autoComplete="email" required placeholder="voce@email.com" />
          </label>
          <label>
            Senha
            <input type="password" name="password" autoComplete="current-password" required placeholder="Sua senha" />
          </label>
          {state.error ? <p className="ent-error" role="alert">{state.error}</p> : null}
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button type="button" className="ent-link" onClick={() => setShowForgot((v) => !v)}>
          Esqueci minha senha
        </button>
      </section>

      {showForgot ? (
        <section className="ent-card ent-card-soft">
          <h2>Esqueci minha senha</h2>
          <p className="ent-lead">A gente manda um link com muito carinho para você criar uma senha nova.</p>
          <form action={forgotAction} className="ent-form">
            <label>
              E-mail da conta
              <input type="email" name="email" autoComplete="email" required placeholder="voce@email.com" />
            </label>
            {forgotState.error ? <p className="ent-error" role="alert">{forgotState.error}</p> : null}
            {forgotState.message ? <p className="ent-ok">{forgotState.message}</p> : null}
            <button type="submit" className="btn btn-ghost" disabled={forgotPending}>
              {forgotPending ? "Enviando..." : "Enviar link de nova senha"}
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}

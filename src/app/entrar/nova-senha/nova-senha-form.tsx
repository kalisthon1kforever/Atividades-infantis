"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthActionState } from "../actions";

const initialState: AuthActionState = {};

export function NovaSenhaForm({ obrigatoria }: { obrigatoria: boolean }) {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <section className="ent-card">
      <h1>{obrigatoria ? "Escolha sua senha nova" : "Criar uma senha nova"}</h1>
      <p className="ent-lead">
        {obrigatoria ? (
          <>
            Antes de abrir as atividades, escolha uma senha só de vocês — a temporária
            que a gente enviou mora aqui no e-mail que a gente mandou, e se aposenta agora. 💛
          </>
        ) : (
          <>Crie a senha nova da sua conta. Pelo menos 8 caracteres, com calma.</>
        )}
      </p>
      <form action={formAction} className="ent-form">
        {!obrigatoria ? (
          <label>
            Senha atual
            <input type="password" name="current" autoComplete="current-password" placeholder="Sua senha atual" />
          </label>
        ) : null}
        <label>
          Senha nova
          <input type="password" name="password" autoComplete="new-password" required minLength={8} placeholder="Mínimo 8 caracteres" />
        </label>
        <label>
          Confirmar senha nova
          <input type="password" name="confirm" autoComplete="new-password" required minLength={8} placeholder="Repita a senha" />
        </label>
        {state.error ? <p className="ent-error" role="alert">{state.error}</p> : null}
        {state.message ? <p className="ent-ok">{state.message}</p> : null}
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Guardando..." : obrigatoria ? "Salvar e entrar na área" : "Salvar senha nova"}
        </button>
      </form>
    </section>
  );
}

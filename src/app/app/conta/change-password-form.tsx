"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthActionState } from "@/app/entrar/actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, {} as AuthActionState);

  return (
    <form action={formAction} className="app-form">
      <label>
        Senha atual
        <input type="password" name="current" autoComplete="current-password" required placeholder="Sua senha atual" />
      </label>
      <label>
        Senha nova
        <input type="password" name="password" autoComplete="new-password" required minLength={8} placeholder="Mínimo 8 caracteres" />
      </label>
      <label>
        Confirmar senha nova
        <input type="password" name="confirm" autoComplete="new-password" required minLength={8} placeholder="Repita a senha" />
      </label>
      {state?.error ? <p className="ent-error" role="alert">{state.error}</p> : null}
      {state?.message ? <p className="ent-ok">{state.message}</p> : null}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Guardando..." : "Trocar senha"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { saveChildAction } from "../actions";

type SavedChildCard = { id: string; name: string; age: number };

export function ChildForm({ child }: { child?: SavedChildCard }) {
  const [state, formAction, pending] = useActionState(saveChildAction, { error: undefined, message: undefined });

  return (
    <form action={formAction} className="app-form">
      {child ? <input type="hidden" name="id" value={child.id} /> : null}
      <label>
        {child ? "Nome da criança" : "Novo nome (ou apelido)"}
        <input type="text" name="name" defaultValue={child?.name ?? ""} required maxLength={60} placeholder="Nome ou apelidinho" />
      </label>
      <label>
        Idade aproximada (3–8 anos)
        <input
          type="number"
          name="age"
          min={1}
          max={10}
          defaultValue={child?.age ?? 5}
        />
      </label>
      {state?.error ? <p className="ent-error" role="alert">{state.error}</p> : null}
      {state?.message ? <p className="ent-ok">{state.message}</p> : null}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Guardando..." : child ? "Salvar mudanças" : "Salvar criança"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { saveActivityAction, type AdminActionResult } from "../actions";
import { CATEGORIES } from "@/lib/catalog-shared";

type Initial = Partial<{
  id: string;
  title: string;
  summary: string;
  category: string;
  duration_min: number;
  age_min: number;
  age_max: number;
  format: string;
  bw: boolean;
  audience: string;
  product_key: string;
  tags: string[];
  is_published: boolean;
  data: unknown;
}>;

export function ActivityForm({ initial }: { initial?: Initial }) {
  const [state, formAction, pending] = useActionState(saveActivityAction, {} as AdminActionResult);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-grid">
        <label>
          id (slug, fixo)
          <input name="id" required defaultValue={initial?.id ?? ""} placeholder="kit-nova-ficha" />
        </label>
        <label>
          Título
          <input name="title" required defaultValue={initial?.title ?? ""} placeholder="Labirinto do coelhinho" />
        </label>
        <label className="admin-form-wide">
          Resumo (uma frase)
          <input name="summary" required defaultValue={initial?.summary ?? ""} />
        </label>
        <label>
          Categoria
          <select name="category" defaultValue={initial?.category ?? "Atenção visual"}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Duração (5/10/15)
          <select name="duration_min" defaultValue={String(initial?.duration_min ?? 10)}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
        <label>
          Idade mín
          <input type="number" name="age_min" min={1} max={9} defaultValue={initial?.age_min ?? 3} />
        </label>
        <label>
          Idade máx
          <input type="number" name="age_max" min={1} max={10} defaultValue={initial?.age_max ?? 8} />
        </label>
        <label>
          Formato
          <select name="format" defaultValue={initial?.format ?? "imprimir"}>
            <option value="imprimir">imprimir</option>
            <option value="tela">tela</option>
            <option value="ambos">ambos</option>
          </select>
        </label>
        <label>
          Preto e branco
          <select name="bw" defaultValue={initial?.bw ? "true" : "false"}>
            <option value="true">sim</option>
            <option value="false">não</option>
          </select>
        </label>
        <label>
          Público
          <select name="audience" defaultValue={initial?.audience ?? "familia"}>
            <option value="familia">família</option>
            <option value="professor">professor</option>
          </select>
        </label>
        <label>
          produto_key
          <select name="product_key" defaultValue={initial?.product_key ?? "kit-inicial"}>
            <option value="amostra">amostra</option>
            <option value="kit-inicial">kit-inicial</option>
            <option value="rotina-visual">rotina-visual</option>
            <option value="guia-30-dias">guia-30-dias</option>
            <option value="mini-kit-5-min">mini-kit-5-min</option>
            <option value="cartoes-vocabulario">cartoes-vocabulario</option>
            <option value="professores">professores</option>
          </select>
        </label>
        <label>
          Tags (vírgula)
          <input name="tags" defaultValue={(initial?.tags ?? []).join(", ")} placeholder="numeros, contagem" />
        </label>
        <label>
          Publicada
          <select name="is_published" defaultValue={initial?.is_published === false ? "false" : "true"}>
            <option value="true">publicada</option>
            <option value="false">oculta</option>
          </select>
        </label>
        <label className="admin-form-wide">
          Conteúdo (JSON do padrão da ficha — ex.: {"{"}&quot;pattern&quot;:&quot;sequencia&quot;,&quot;numeros&quot;:[&quot;1&quot;,&quot;2&quot;,&quot;__&quot;]&{"}"})
          <textarea name="data" rows={5} className="admin-mono" defaultValue={
            typeof initial?.data === "object" && initial?.data !== null
              ? JSON.stringify(initial.data, null, 2)
              : '{\n  "pattern": "sequencia",\n  "numeros": ["1","2","__"]\n}'
          } />
        </label>
      </div>

      {state?.error ? <p className="ent-error" role="alert">{state.error}</p> : null}
      {state?.message ? <p className="admin-ok">{state.message}</p> : null}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Salvando..." : "Salvar ficha"}
      </button>
    </form>
  );
}

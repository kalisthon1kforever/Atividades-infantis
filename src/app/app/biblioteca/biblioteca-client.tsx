"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toggleFavoriteAction } from "../actions";
import { categoryIcon } from "@/lib/catalog-shared";
import { productLabel } from "@/lib/products";
import type { Activity } from "@/lib/types";

type Props = {
  activities: Activity[];
  favoritos: string[];
  bloqueados: { key: string; note: string; priceLabel: string; hint: string }[];
};

const TEMPO: { label: string; value: number | null }[] = [
  { label: "Qualquer tempo", value: null },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
];

export function BibliotecaClient({ activities, favoritos: favoInit, bloqueados }: Props) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [tempo, setTempo] = useState<number | null>(null);
  const [idade, setIdade] = useState<number | null>(null);
  const [formato, setFormato] = useState<"todos" | "imprimir" | "tela">("todos");
  const [soPreto, setSoPreto] = useState(false);
  const [publico, setPublico] = useState<"familia" | "professor">("familia");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [favoritos, setFavoritos] = useState<string[]>(favoInit);
  const [buscando, startTransition] = useTransition();

  function toggleFavorito(id: string) {
    const novo = favoritos.includes(id) ? favoritos.filter((x) => x !== id) : [...favoritos, id];
    setFavoritos(novo);
    startTransition(async () => {
      await toggleFavoriteAction(id, novo.includes(id));
    });
  }

  const categorias = useMemo(
    () => Array.from(new Set(activities.map((a) => a.category))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [activities],
  );

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return activities.filter((a) => {
      if (categoria && a.category !== categoria) return false;
      if (tempo && a.duration_min !== tempo) return false;
      if (idade !== null && !(a.age_min <= idade && idade <= a.age_max)) return false;
      if (formato !== "todos" && a.format !== "ambos" && a.format !== formato) return false;
      if (soPreto && !a.bw) return false;
      if (publico === "familia" && a.audience !== "familia") return false;
      if (publico === "professor" && a.audience !== "professor") return false;
      if (soFavoritos && !favoritos.includes(a.id)) return false;
      if (q) {
        const blob = `${a.title} ${a.category} ${a.summary} ${a.tags.join(" ")}`.toLowerCase();
        if (!q.split(/\s+/).every((w) => blob.includes(w))) return false;
      }
      return true;
    });
  }, [activities, busca, categoria, tempo, idade, formato, soPreto, publico, soFavoritos, favoritos]);

  const temFiltro = Boolean(busca || categoria || tempo || soPreto || soFavoritos || (idade !== null) || formato !== "todos" || publico !== "familia");

  function limpar() {
    setBusca("");
    setCategoria(null);
    setTempo(null);
    setIdade(null);
    setFormato("todos");
    setSoPreto(false);
    setSoFavoritos(false);
    setPublico("familia");
  }

  function highlight(text: string): React.ReactNode {
    const q = busca.trim();
    if (!q) return text;
    const words = q.split(/\s+/).filter((w) => w.length > 1);
    if (words.length === 0) return text;
    const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(re);
    return parts.map((p, i) =>
      words.some((w) => p.toLowerCase() === w.toLowerCase()) ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>,
    );
  }

  return (
    <div className="app-pad">
      <section className="app-welcome">
        <h1>Biblioteca</h1>
        <p className="app-welcome-sub">
          Escolha pela categoria, pelo tempo que vocês têm hoje ou pela idade do pequeno. O coração
          manda 🧡
        </p>
      </section>

      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder={buscando ? "Buscando..." : "Buscar por título, tag ou categoria..."}
        className="app-search"
        aria-label="Buscar atividades"
      />

      <div className="app-filter-chips">
        <div className="app-chip-scroll" role="list" aria-label="Categorias">
          <button type="button" className={`app-chip-btn ${!categoria ? "is-on" : ""}`} onClick={() => setCategoria(null)}>
            Tudo
          </button>
          {categorias.map((c) => (
            <button type="button" key={c} className={`app-chip-btn ${categoria === c ? "is-on" : ""}`} onClick={() => setCategoria(c === categoria ? null : c)}>
              {categoryIcon(c)} {c}
            </button>
          ))}
        </div>
        <div className="app-filter-row">
          <select value={tempo ?? ""} onChange={(e) => setTempo(e.target.value ? Number(e.target.value) : null)} aria-label="Tempo">
            {TEMPO.map((t) => (
              <option key={t.label} value={t.value ?? ""}>{t.label}</option>
            ))}
          </select>
          <select value={idade ?? ""} onChange={(e) => setIdade(e.target.value ? Number(e.target.value) : null)} aria-label="Idade">
            <option value="">Qualquer idade</option>
            {[3, 4, 5, 6, 7, 8].map((i) => (
              <option key={i} value={i}>{i} anos</option>
            ))}
          </select>
          <select value={formato} onChange={(e) => setFormato(e.target.value as typeof formato)} aria-label="Formato">
            <option value="todos">Imprimir e tela</option>
            <option value="imprimir">Para imprimir</option>
            <option value="tela">Só tela</option>
          </select>
          <select value={publico} onChange={(e) => setPublico(e.target.value as typeof publico)} aria-label="Público">
            <option value="familia">Família</option>
            <option value="professor">Professor</option>
          </select>
          <label className="app-toggle">
            <input type="checkbox" checked={soPreto} onChange={(e) => setSoPreto(e.target.checked)} />
            Preto e branco
          </label>
          <label className="app-toggle">
            <input type="checkbox" checked={soFavoritos} onChange={(e) => setSoFavoritos(e.target.checked)} />
            ❤️ Favoritos
          </label>
        </div>
      </div>

      {lista.length === 0 ? (
        <section className="app-card app-empty">
          <p className="app-big-emoji">🌱</p>
          <p>Nada apareceu com esse filtro. Sem problema — as fichas continuam aqui de bem com vocês 💛</p>
          {temFiltro ? (
            <button type="button" className="btn btn-ghost" onClick={limpar}>
              Limpar filtros
            </button>
          ) : null}
        </section>
      ) : (
        <section className="app-cards">
          {lista.map((a) => (
            <article key={a.id} className="app-act-card">
              <button
                type="button"
                className={`app-fav-btn ${favoritos.includes(a.id) ? "is-on" : ""}`}
                onClick={() => toggleFavorito(a.id)}
                aria-label={favoritos.includes(a.id) ? "Remover dos favoritos" : "Marcar como favorito"}
              >
                {favoritos.includes(a.id) ? "❤️" : "🤍"}
              </button>
              <Link href={`/app/atividade/${a.id}`} className="app-act-main">
                <span className="app-act-ico">{categoryIcon(a.category)}</span>
                <h3>{highlight(a.title)}</h3>
                <p>{highlight(a.summary)}</p>
                <p className="app-meta-line">
                  <span>{a.duration_min} min</span>
                  <span>{a.age_min}–{a.age_max} anos</span>
                  <span>{a.format === "ambos" ? "imprimir ou tela" : a.format}</span>
                  <span>{a.category}</span>
                </p>
              </Link>
            </article>
          ))}
        </section>
      )}

      {bloqueados.length > 0 ? (
        <>
          <h2 className="app-more-title">Mais para o cantinho de vocês</h2>
          <section className="app-cards">
            {bloqueados.map((b) => (
              <article key={b.key} className="app-act-card app-locked">
                <span className="app-act-ico">🔒</span>
                <h3>{productLabel(b.key)}</h3>
                <p>{b.note}</p>
                <p className="app-locked-price">
                  <b>{b.priceLabel}</b>
                  <Link href="/oferta?src=app" className="btn btn-sm">
                    Quero já
                  </Link>
                </p>
                {b.hint ? <p className="app-locked-hint">{b.hint}</p> : null}
              </article>
            ))}
          </section>
        </>
      ) : null}

      <button type="button" className="btn btn-ghost app-back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        Voltar para o topo ↑
      </button>
    </div>
  );
}

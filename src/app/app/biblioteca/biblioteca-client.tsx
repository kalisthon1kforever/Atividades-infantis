"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toggleFavoriteAction } from "../actions";
import { categoryIcon } from "@/lib/catalog-shared";
import { AREAS, areaDe, type AreaId } from "@/lib/catalog-areas";
import { PILARES } from "@/lib/funil/modelo";
import type { Activity } from "@/lib/types";

type Props = {
  activities: Activity[];
  favoritos: string[];
  titulo?: string;
  subtitulo?: string;
  initialCategoria?: string | null;
};

const TEMPO: { label: string; value: number | null }[] = [
  { label: "Qualquer tempo", value: null },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
];

export function BibliotecaClient({
  activities,
  favoritos: favoInit,
  titulo = "Biblioteca",
  subtitulo = "Escolha pela categoria, pelo tempo que vocês têm hoje ou pela idade do pequeno. O coração manda 🧡",
  initialCategoria = null,
}: Props) {
  const [busca, setBusca] = useState("");
  const [pilar, setPilar] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<string | null>(initialCategoria);
  const [area, setArea] = useState<AreaId | null>(null);
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

  function escolherArea(id: AreaId | null) {
    setArea(id);
    setCategoria(null);
    setPilar(null);
  }

  function escolherCategoria(c: string | null) {
    setCategoria(c);
    setArea(null);
  }

  function escolherPilar(id: string | null) {
    setPilar(id);
    setArea(null);
  }

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return activities.filter((a) => {
      if (area && areaDe(a) !== area) return false;
      if (pilar) {
        const cats = PILARES.find((item) => item.id === pilar)?.categorias;
        if (cats && !cats.includes(a.category)) return false;
      }
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
  }, [activities, busca, pilar, categoria, area, tempo, idade, formato, soPreto, publico, soFavoritos, favoritos]);

  const temFiltro = Boolean(busca || pilar || categoria || area || tempo || soPreto || soFavoritos || (idade !== null) || formato !== "todos" || publico !== "familia");

  function limpar() {
    setBusca("");
    setPilar(null);
    setCategoria(null);
    setArea(null);
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
        <h1>{titulo}</h1>
        <p className="app-welcome-sub">{subtitulo}</p>
      </section>

      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder={buscando ? "Buscando..." : "Buscar por título, tag ou categoria..."}
        className="app-search"
        aria-label="Buscar atividades"
      />

      <div className="app-areas" role="list" aria-label="Áreas de descoberta">
        <button type="button" className={`app-chip-btn ${!area ? "is-on" : ""}`} onClick={() => escolherArea(null)}>
          Tudo
        </button>
        {AREAS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`app-chip-btn ${area === item.id ? "is-on" : ""}`}
            onClick={() => escolherArea(item.id === area ? null : item.id)}
            title={item.descricao}
          >
            {item.emoji} {item.nome}
          </button>
        ))}
      </div>

      <div className="app-filter-chips">
        <div className="app-chip-scroll" role="list" aria-label="Pilares">
          <button type="button" className={`app-chip-btn ${!pilar ? "is-on" : ""}`} onClick={() => escolherPilar(null)}>
            Todos os pilares
          </button>
          {PILARES.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`app-chip-btn ${pilar === item.id ? "is-on" : ""}`}
              onClick={() => escolherPilar(item.id === pilar ? null : item.id)}
            >
              {item.emoji} {item.nome}
            </button>
          ))}
        </div>
        <div className="app-chip-scroll" role="list" aria-label="Categorias">
          <button type="button" className={`app-chip-btn ${!categoria ? "is-on" : ""}`} onClick={() => escolherCategoria(null)}>
            Tudo
          </button>
          {categorias.map((c) => (
            <button type="button" key={c} className={`app-chip-btn ${categoria === c ? "is-on" : ""}`} onClick={() => escolherCategoria(c === categoria ? null : c)}>
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
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
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

      <button type="button" className="btn btn-ghost app-back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        Voltar para o topo ↑
      </button>
    </div>
  );
}

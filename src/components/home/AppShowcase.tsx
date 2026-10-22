"use client";

import { useEffect, useState } from "react";

type ScreenKey = "inicio" | "biblioteca" | "trilha" | "conquistas";

const FEATURES: { key: ScreenKey; icon: string; title: string; text: string }[] = [
  {
    key: "inicio",
    icon: "🏠",
    title: "Próximo passo sugerido",
    text: "Abriu o app, já aparece a atividade certa para hoje, no tempo que vocês têm.",
  },
  {
    key: "biblioteca",
    icon: "🔎",
    title: "Biblioteca com busca",
    text: "Filtre por tempo, idade e módulo. Achou, imprimiu ou fez direto na tela.",
  },
  {
    key: "trilha",
    icon: "🗺️",
    title: "Trilha de 30 dias",
    text: "Um passo por dia, sem pensar no “o que fazer hoje?”.",
  },
  {
    key: "conquistas",
    icon: "⭐",
    title: "Estrelas e conquistas",
    text: "Cada “fizemos juntos” vira estrelinha, e o certificado sai no final.",
  },
];

function Screen({ screen }: { screen: ScreenKey }) {
  if (screen === "biblioteca") {
    return (
      <div className="hm-ph-screen" key="biblioteca">
        <p className="hm-ph-title">Biblioteca</p>
        <div className="hm-ph-search">🔎 letras…</div>
        <div className="hm-ph-filters">
          <span className="is-on">5 min</span>
          <span>4–6 anos</span>
          <span>imprimir</span>
        </div>
        {[
          ["🔤", "Qual é a letra?", "5 min"],
          ["🔤", "Tracejado das letras", "10 min"],
          ["🔤", "Qual é a sílaba?", "10 min"],
        ].map(([icon, title, time]) => (
          <div className="hm-ph-item" key={title}>
            <span>{icon}</span>
            <b>{title}</b>
            <small>{time}</small>
          </div>
        ))}
      </div>
    );
  }
  if (screen === "trilha") {
    return (
      <div className="hm-ph-screen" key="trilha">
        <p className="hm-ph-title">Trilha de 30 dias</p>
        <p className="hm-ph-sub">Dia 6 de 30 · vocês estão indo muito bem</p>
        <div className="hm-ph-days">
          {Array.from({ length: 15 }, (_, index) => (
            <span key={index} className={index < 5 ? "is-done" : index === 5 ? "is-today" : ""}>
              {index < 5 ? "✓" : index + 1}
            </span>
          ))}
        </div>
        <div className="hm-ph-card">
          <small>Hoje</small>
          <b>✂️ Labirinto do sapinho</b>
          <span className="hm-ph-btn">Fizemos juntos hoje</span>
        </div>
      </div>
    );
  }
  if (screen === "conquistas") {
    return (
      <div className="hm-ph-screen" key="conquistas">
        <p className="hm-ph-title">Conquistas</p>
        <div className="hm-ph-stars">⭐⭐⭐⭐⭐</div>
        <p className="hm-ph-sub">12 estrelinhas · 4 dias seguidos</p>
        <div className="hm-ph-badges">
          <span>🏅 Primeira ficha</span>
          <span>🔥 3 dias seguidos</span>
          <span>🔤 Amigo das letras</span>
        </div>
        <div className="hm-ph-card hm-ph-cert">
          <b>🎓 Certificado</b>
          <small>Libera ao completar a trilha</small>
        </div>
      </div>
    );
  }
  return (
    <div className="hm-ph-screen" key="inicio">
      <p className="hm-ph-title">Olá, família da Ana!</p>
      <div className="hm-ph-stats">
        <span>
          <b>⭐ 12</b>
          <small>estrelas</small>
        </span>
        <span>
          <b>🔥 4</b>
          <small>dias seguidos</small>
        </span>
      </div>
      <div className="hm-ph-card">
        <small>Próximo passo sugerido</small>
        <b>🔍 Ache os iguais</b>
        <p>5 min · Atenção visual · 3–5 anos</p>
        <span className="hm-ph-btn">Abrir atividade</span>
      </div>
    </div>
  );
}

export function AppShowcase() {
  const [active, setActive] = useState<ScreenKey>("inicio");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const index = FEATURES.findIndex((feature) => feature.key === current);
        return FEATURES[(index + 1) % FEATURES.length].key;
      });
    }, 3600);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div className="hm-app">
      <div className="hm-phone" aria-label="Prévia da área da família no celular">
        <div className="hm-phone-notch" aria-hidden="true" />
        <Screen screen={active} />
        <nav className="hm-ph-nav" aria-hidden="true">
          {FEATURES.map((feature) => (
            <span key={feature.key} className={feature.key === active ? "is-on" : ""}>
              {feature.icon}
            </span>
          ))}
        </nav>
      </div>
      <ul className="hm-app-list">
        {FEATURES.map((feature) => (
          <li key={feature.key}>
            <button
              type="button"
              className={feature.key === active ? "is-on" : ""}
              onClick={() => {
                setActive(feature.key);
                setPaused(true);
              }}
            >
              <span className="hm-app-ico" aria-hidden="true">
                {feature.icon}
              </span>
              <span>
                <b>{feature.title}</b>
                <small>{feature.text}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { deliverables, modules, wordCards } from "@/data/content";
import type { Deliverable } from "@/data/content";
import { SheetPreview } from "./SheetPreview";
import { WordCard } from "./WordCard";
import {
  BookIcon,
  CardsIcon,
  ChecklistIcon,
  PagesIcon,
  PdfIcon,
  StarIcon,
} from "./icons";

function DeliverableIcon({ icon }: { icon: Deliverable["icon"] }) {
  switch (icon) {
    case "pages":
      return <PagesIcon />;
    case "activities":
      return <StarIcon />;
    case "cards":
      return <CardsIcon />;
    case "guide":
      return <BookIcon />;
    case "checklist":
      return <ChecklistIcon />;
    case "pdf":
      return <PdfIcon />;
  }
}

export function WhatYouGet() {
  return (
    <section className="section" aria-labelledby="recebe-titulo">
      <div className="container">
        <div className="section-head">
          <span className="kicker">O kit</span>
          <h2 id="recebe-titulo">
            Tudo o que você <span className="hl">recebe</span>
          </h2>
          <p className="lead">
            Seis entregáveis que trabalham juntos: material, organização e
            acompanhamento para usar em casa.
          </p>
        </div>

        <div className="deliverables-grid">
          {deliverables.map((item) => (
            <article className="card deliverable-card" key={item.title}>
              <span className="deliverable-icon">
                <DeliverableIcon icon={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className="section-head" style={{ marginTop: "1rem" }}>
          <h2>
            5 módulos para praticar{" "}
            <span className="hl">uma habilidade por vez</span>
          </h2>
          <p className="lead">
            As 100 atividades estão divididas em cinco módulos. Você escolhe a
            habilidade que faz sentido para o momento da criança.
          </p>
        </div>

        <div className="modules-grid">
          {modules.map((mod) => (
            <article className="card module-card" key={mod.number}>
              <div className="module-top">
                <span className="module-num">Módulo {mod.number}</span>
                <span className="module-count">{mod.activities}</span>
              </div>
              <h3>{mod.title}</h3>
              <SheetPreview kind={mod.preview} />
              <p>{mod.description}</p>
              <ul className="module-skills">
                {mod.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div style={{ marginTop: "clamp(2.4rem, 5vw, 3.2rem)" }}>
          <div className="section-head" style={{ marginBottom: "1rem" }}>
            <h2>
              20 cartões de palavras{" "}
              <span className="hl">para recortar e usar</span>
            </h2>
            <p className="lead">
              Sílabas separadas no topo, ilustração central e palavra na base.
            </p>
          </div>
          <p className="preview-note">
            Prévia ilustrativa do formato dos cartões — as ilustrações finais do
              material são próprias do kit.
          </p>
          <div className="marquee">
            <div className="marquee-track">
              {wordCards.map((card) => (
                <WordCard key={`a-${card.word}`} card={card} />
              ))}
              {wordCards.map((card) => (
                <WordCard key={`b-${card.word}`} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

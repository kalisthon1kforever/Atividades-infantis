import type { Module } from "@/data/content";
import { modules } from "@/data/content";
import { SheetPreview } from "./SheetPreview";

export function Modules() {
  return (
    <section className="section" id="modulos">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Organização</span>
          <h2 className="title">
            E não é tudo: <span className="hl">5 módulos educativos</span>
          </h2>
          <p className="lead">
            As 100 atividades estão divididas em 5 módulos de 20, cada um
            dedicado a uma habilidade específica.
          </p>
        </div>
        <div className="modules-grid">
          {modules.map((module) => (
            <article className="card module-card" key={module.number}>
              <div className="module-top">
                <span className="module-num">Módulo {module.number}</span>
                <span className="module-count">{module.activities}</span>
              </div>
              <SheetPreview kind={module.preview} />
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <ul className="module-skills">
                {module.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

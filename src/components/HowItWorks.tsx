import { steps, usagePrinciples } from "@/data/content";
import { CheckIcon } from "./icons";

export function HowItWorks() {
  return (
    <section className="section section-alt" aria-labelledby="como-titulo">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Como funciona</span>
          <h2 id="como-titulo">
            Três passos simples para <span className="hl">começar hoje</span>
          </h2>
          <p className="lead">
            Sem preparo complexo, sem tela para a criança e sem obrigatoriedade
            de concluir todas as páginas.
          </p>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <article className="card step-card" key={step.number}>
              <span className="step-num" aria-hidden="true">
                {step.number}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
        <div className="principles">
          <h3>O princípio do uso guiado</h3>
          <ul>
            {usagePrinciples.map((p) => (
              <li key={p}>
                <span className="tick">
                  <CheckIcon />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="day-note">
          Como regra de referência, recomendamos no máximo três atividades por
          dia, conforme a disposição da criança.
        </p>
      </div>
    </section>
  );
}

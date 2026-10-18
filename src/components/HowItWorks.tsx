import { steps, usagePrinciples } from "@/data/content";
import { CheckIcon } from "./icons";

export function HowItWorks() {
  return (
    <section className="section" id="acesso">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Passo a passo</span>
          <h2 className="title">
            Como funciona <span className="hl">o acesso</span>
          </h2>
          <p className="lead">
            Do pagamento à folha impressa, o caminho é curto e direto.
          </p>
        </div>
        <ol className="tl">
          {steps.map((step) => (
            <li className="tl-step" key={step.number}>
              <span className="tl-num" aria-hidden="true">
                {step.number}
              </span>
              <div className="tl-body">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="principles">
          <h3>Jeito Pequenos Passos de usar</h3>
          <ul>
            {usagePrinciples.map((principle) => (
              <li key={principle}>
                <span className="tick">
                  <CheckIcon />
                </span>
                <span>{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

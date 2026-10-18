import { faq } from "@/data/content";
import { CtaButton } from "./CtaButton";

export function Faq() {
  return (
    <section className="section" aria-labelledby="faq-titulo">
      <div className="container-narrow">
        <div className="section-head">
          <span className="kicker">Dúvidas frequentes</span>
          <h2 id="faq-titulo">
            Perguntas <span className="hl">frequentes</span>
          </h2>
          <p className="lead">
            Respostas diretas sobre impressão, idade, uso e entrega.
          </p>
        </div>
        <div className="faq-list">
          {faq.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
        <div className="cta-row" style={{ justifyContent: "center", marginTop: "2rem" }}>
          <CtaButton>QUERO MEU KIT COMPLETO</CtaButton>
        </div>
      </div>
    </section>
  );
}

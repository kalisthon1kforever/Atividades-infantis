import { solutionBenefits } from "@/data/content";

export function Solution() {
  return (
    <section className="section section-alt" aria-labelledby="solucao-titulo">
      <div className="container">
        <div className="section-head">
          <span className="kicker">A solução</span>
          <h2 id="solucao-titulo">
            Pequenos Passos organiza o caminho para você{" "}
            <span className="hl">escolher e fazer junto</span>
          </h2>
          <p className="lead">
            Um kit de material digital pronto para imprimir, com atividades
            agrupadas por habilidade e um guia para acompanhar o uso em casa.
          </p>
        </div>
        <div className="solution-grid">
          {solutionBenefits.map((item, index) => (
            <article className="card solution-card" key={item.title}>
              <span className="solution-num" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

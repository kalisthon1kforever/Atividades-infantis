import { problemPoints } from "@/data/content";

export function Problem() {
  return (
    <section className="section" aria-labelledby="problema-titulo">
      <div className="container">
        <div className="section-head">
          <span className="kicker">O dia a dia</span>
          <h2 id="problema-titulo">
            Já aconteceu de salvar atividades e <span className="hl">nunca chegar a usá-las</span>?
          </h2>
          <p className="lead">
            Não é falta de vontade. A rotina aperta e faltam organização e um
            ponto de partida claro.
          </p>
        </div>
        <div className="problem-grid">
          {problemPoints.map((item) => (
            <article className="card problem-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
        <p className="problem-idea">
          Ter muitas atividades não basta quando falta organização para decidir
          o que fazer hoje.
        </p>
      </div>
    </section>
  );
}

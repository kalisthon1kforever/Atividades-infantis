import { forWhom, notForWhom } from "@/data/content";

export function ForWhom() {
  return (
    <section className="section" aria-labelledby="publico-titulo">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Transparência</span>
          <h2 id="publico-titulo">
            Para quem é — e{" "}
            <span className="hl-coral">para quem não é</span>
          </h2>
          <p className="lead">
            O material funciona melhor quando as expectativas são claras desde o
            começo.
          </p>
        </div>
        <div className="whom-grid">
          <article className="card whom-card whom-yes">
            <h3>É para você se…</h3>
            <ul>
              {forWhom.map((item) => (
                <li key={item}>
                  <span className="whom-mark" aria-hidden="true">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="card whom-card whom-no">
            <h3>Não é para você se…</h3>
            <ul>
              {notForWhom.map((item) => (
                <li key={item}>
                  <span className="whom-mark" aria-hidden="true">
                    ✕
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
        <p className="whom-note">
          O material é educativo e complementar. Não é terapia, diagnóstico nem
          tratamento.
        </p>
      </div>
    </section>
  );
}

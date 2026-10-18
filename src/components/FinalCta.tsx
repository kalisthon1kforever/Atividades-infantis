import { CtaButton } from "./CtaButton";

export function FinalCta() {
  return (
    <section className="section final" aria-labelledby="final-titulo">
      <div className="container-narrow">
        <h2 id="final-titulo">
          Seu próximo 15 minutos com seu filho pode ser{" "}
          <span className="hl">diferente</span>.
        </h2>
        <p className="lead" style={{ marginBottom: "1.6rem" }}>
          Escolha uma atividade, imprima e faça junto. Sem tela, sem inventar
          nada do zero e no ritmo da criança.
        </p>
        <div className="cta-row">
          <CtaButton large>QUERO MEU KIT COMPLETO</CtaButton>
        </div>
        <p className="disclaimer">
          Material educativo complementar. Não substitui a escola nem
          acompanhamento profissional.
        </p>
      </div>
    </section>
  );
}

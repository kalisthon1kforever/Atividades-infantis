import Image from "next/image";
import { CtaButton } from "./CtaButton";

const pains = [
  "Atividades salvas no celular que nunca viram papel",
  "Noites gastas preparando material do zero",
  "Dúvida constante sobre qual habilidade praticar hoje",
];

export function Problem() {
  return (
    <section className="banner" aria-labelledby="banner-title">
      <div className="container">
        <div className="banner-grid">
          <div>
            <p className="banner-kicker">Sem material organizado</p>
            <h2 id="banner-title">
              Cada dia de improviso é uma chance de aprendizagem que não
              acontece
            </h2>
            <p>
              Sem um material organizado por habilidade, a rotina empurra tudo
              para depois: imagem salva no celular, preparação que consome a
              noite e a mesma pergunta toda semana — por onde começar?
            </p>
            <ul className="banner-list">
              {pains.map((item) => (
                <li key={item}>
                  <span className="b-mark" aria-hidden="true">
                    ✕
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="cta-row">
              <CtaButton>QUERO MEU KIT COMPLETO</CtaButton>
            </div>
          </div>
          <div className="banner-photo">
            <Image
              src="/images/atividades-fazer-hoje.jpg"
              alt="Atividades para fazer hoje, sem preparar nada do zero"
              width={1122}
              height={1066}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

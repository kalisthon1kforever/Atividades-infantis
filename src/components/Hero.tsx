import Image from "next/image";
import { CtaButton } from "./CtaButton";
import { CheckIcon, MailIcon } from "./icons";

const checks = [
  "100 atividades prontas para imprimir",
  "5 módulos organizados por habilidade",
  "20 cartões de palavras para recortar",
  "Guia de apoio e checklist de acompanhamento",
  "PDF para usar em casa, no ritmo da criança",
];

export function Hero() {
  return (
    <header className="hero">
      <div className="container hero-grid">
        <div>
          <span className="hero-badge">
            <span className="dot" aria-hidden="true" />
            Material educativo complementar para casa
          </span>
          <h1>
            <span className="c-g">100 atividades prontas para imprimir</span>{" "}
            <span className="c-o">sem preparar nada do zero</span>{" "}
            <span className="c-b">para fazer 15 minutos ao lado do seu filho</span>
            <span className="h1-sub">
              Pratique letras, palavras, números e atenção com material
              organizado por habilidade, para usar em casa e no ritmo da
              criança.
            </span>
          </h1>
          <ul className="checks hero-checks">
            {checks.map((item) => (
              <li key={item}>
                <span className="tick">
                  <CheckIcon />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="cta-row">
            <CtaButton large>QUERO MEU KIT COMPLETO</CtaButton>
          </div>
          <p className="note" style={{ marginTop: "1.1rem" }}>
            <MailIcon />
            <span>PDF para download após a confirmação do pagamento</span>
          </p>
        </div>
        <div className="hero-photo-wrap">
          <Image
            className="hero-photo"
            src="/images/kit-completo.jpg"
            alt="Capa do kit Pequenos Passos — Alfabetização em Casa, com a lista completa de entregáveis e amostras das atividades impressas"
            width={1024}
            height={1076}
            priority
            sizes="(max-width: 900px) 100vw, 420px"
          />
        </div>
      </div>
    </header>
  );
}

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
            <span className="hl">100 atividades prontas para imprimir</span> que
            transformam 15 minutos do dia em um momento de aprendizagem com seu
            filho.
          </h1>
          <p className="hero-sub">
            Pratique letras, palavras, números e atenção com atividades
            organizadas por habilidade, para fazer em casa e no ritmo da
            criança — sem precisar inventar tudo do zero.
          </p>
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
            src="/hero-familia.png"
            alt="Mãe e criança fazendo atividades educativas impressas em uma mesa, com letras, números e cartões ilustrados"
            width={1536}
            height={864}
            priority
            sizes="(max-width: 900px) 100vw, 480px"
          />
          <span className="hero-chip hero-chip-1">Sem tela</span>
          <span className="hero-chip hero-chip-2">Cerca de 15 minutos</span>
        </div>
      </div>
    </header>
  );
}

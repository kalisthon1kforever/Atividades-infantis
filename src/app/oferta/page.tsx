import type { Metadata } from "next";
import Image from "next/image";
import { CtaButton } from "@/components/CtaButton";
import { WordCard } from "@/components/WordCard";
import { SheetPreview } from "@/components/SheetPreview";
import { CheckIcon, ShieldIcon, XIcon } from "@/components/icons";
import {
  deliverables,
  modules,
  wordCards,
  steps,
  forWhom,
  notForWhom,
  problemPoints,
  solutionBenefits,
  faq,
  reviewsNote,
  reviewImages,
} from "@/data/content";

export const metadata: Metadata = {
  title: "Pequenos Passos — Garanta o seu Kit Completo",
  description:
    "Kit digital completo de alfabetização em casa: 119 páginas, 100 atividades, 20 cartões de palavras, guia e checklist. PDF para imprimir no ritmo da criança.",
};

const painItems = problemPoints.slice(0, 4);
const reviewCard = reviewImages[4];

export default function OfertaPage() {
  return (
    <div className="of-shell">
      <header className="of-hero">
        <div className="of-symbols" aria-hidden="true">
          <span>👧👦</span>
          <span>🧶</span>
          <span>❤️</span>
          <span>📵</span>
          <span>🧸</span>
        </div>
        <p className="of-logo-word">
          <span className="l1">PEQUENOS</span>
          <span className="l2">PASSOS</span>
        </p>
        <span className="of-logo-pill">Alfabetização em Casa</span>
      </header>

      <section className="of-pad">
        <div className="of-cols">
          <div>
            <h2 className="of-section-title">Você também vive isso?</h2>
            <ul className="of-pain-list">
              {painItems.map((item) => (
                <li key={item.title}>
                  <span className="of-xmark" aria-hidden="true">
                    <XIcon />
                  </span>
                  <div>
                    {item.title}
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Image
              className="of-photo"
              src="/images/aprender-amor.jpg"
              alt="Mãe e filha fazendo uma atividade educativa juntas na mesa de casa"
              width={1200}
              height={1200}
            />
          </div>

          <div>
            <h2 className="of-section-title">
              A solução é mais simples do que parece
            </h2>
            <ul className="of-sol-list">
              {solutionBenefits.map((item) => (
                <li key={item.title}>
                  <span className="of-vmark" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <div>
                    {item.title}
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="of-pad">
        <div className="of-depo-card">
          <h3>Depoimentos</h3>
          <Image
            src={reviewCard.src}
            alt={reviewCard.alt}
            width={1200}
            height={800}
          />
          <p className="of-depo-note">{reviewsNote}</p>
        </div>
      </section>

      <section className="of-pad">
        <div className="of-card-green">
          <h2 className="of-section-title">
            O que você recebe no Kit Completo
          </h2>
          <ul className="of-check-list">
            {deliverables.map((item) => (
              <li key={item.title}>
                <span className="tick" aria-hidden="true">
                  <CheckIcon />
                </span>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          <Image
            className="of-photo"
            style={{ marginTop: "1rem" }}
            src="/images/atividades-prontas.jpg"
            alt="Atividades prontas para imprimir com letras, números, atenção e rotina"
            width={1122}
            height={1094}
          />
        </div>
      </section>

      <section className="of-pad">
        <div className="of-card-blue">
          <h2 className="of-section-title">Como funciona?</h2>
          <div className="of-steps">
            {steps.map((step) => (
              <div className="of-step" key={step.number}>
                <span className="of-step-num">{step.number}</span>
                <div className="of-step-emoji" aria-hidden="true">
                  {step.number === 1 ? "🖨️" : step.number === 2 ? "📄" : "🤝"}
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="of-pad">
        <h2 className="of-section-title">5 módulos de atividades</h2>
        <div className="of-modules">
          {modules.map((mod) => (
            <figure className="of-module" key={mod.number}>
              <div className="of-module-head">
                <span className="of-module-icon" aria-hidden="true">
                  {["🔍", "✏️", "🔤", "📖", "🔢"][mod.number - 1]}
                </span>
                <span>
                  <b>Módulo {mod.number}</b>
                  <small>{mod.title}</small>
                </span>
              </div>
              <SheetPreview kind={mod.preview} />
              <p>{mod.description}</p>
            </figure>
          ))}
        </div>
      </section>

      <section className="of-pad">
        <div className="of-card-blue">
          <h2 className="of-section-title">Cartões de palavras</h2>
          <div className="of-cards-grid">
            {wordCards.slice(0, 9).map((card) => (
              <WordCard key={card.word} card={card} />
            ))}
          </div>
          <p className="of-more">E mais:</p>
          <p className="of-depo-note">
            São 20 cartões no total, com sílabas separadas no topo, ilustração
            central e a palavra completa na base — prontos para recortar e
            brincar.
          </p>
        </div>
      </section>

      <section className="of-pad">
        <div className="of-duo">
          <div className="of-yes">
            <h3>Para quem é?</h3>
            <ul>
              {forWhom.slice(0, 2).map((item) => (
                <li key={item}>
                  <span className="of-vmark" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="of-no">
            <h3>Não é para quem?</h3>
            <ul>
              {notForWhom.map((item) => (
                <li key={item}>
                  <span className="of-xmark" aria-hidden="true">
                    <XIcon />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="of-pad" id="oferta-kits">
        <div className="of-offer-band">
          <h2>Garanta agora o seu Kit Completo</h2>
          <div className="of-offer-grid">
            <Image
              className="of-offer-img"
              src="/images/oferta-capas.jpg"
              alt="Capas do kit Pequenos Passos — Alfabetização em Casa"
              width={849}
              height={1200}
            />
            <div className="of-offer-card">
              <span className="of-pill">Kit digital completo</span>
              <h3>Alfabetização em Casa</h3>
              <ul className="of-check-list">
                {deliverables.map((item) => (
                  <li key={item.title}>
                    <span className="tick" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="of-garantia-card">
              <ShieldIcon className="shield" />
              <h3>Garantia de 7 dias</h3>
              <p>
                Se o material não fizer sentido para a sua família, basta
                pedir o reembolso em até 7 dias após a compra.
              </p>
            </div>
          </div>
          <div className="of-btnrow">
            <CtaButton large>Quero meu Kit Completo →</CtaButton>
            <p className="of-mini-note">
              Pagamento único • Material em PDF para uso pessoal com impressão
              ilimitada.
            </p>
          </div>
        </div>
      </section>

      <section className="of-pad">
        <h2 className="of-section-title">Perguntas frequentes</h2>
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
        <Image
          className="of-faq-illus"
          src="/images/atividades-fazer-hoje.jpg"
          alt="Atividades para fazer hoje, sem preparar nada do zero"
          width={1122}
          height={1066}
        />
      </section>

      <a className="of-cta-band" href="#oferta-kits">
        <span>Quero meu Kit Completo →</span>
      </a>
    </div>
  );
}

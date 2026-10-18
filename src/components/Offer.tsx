import Image from "next/image";
import { deliverables } from "@/data/content";
import { formatBRL, offerConfig } from "@/config/offer";
import { CtaButton } from "./CtaButton";
import { CheckIcon, MailIcon, ShieldIcon } from "./icons";
import { Faq } from "./Faq";

export function Offer() {
  const price = offerConfig.priceBRL;

  return (
    <section className="section section-alt" id="oferta">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Oferta</span>
          <h2 className="title">
            Garanta <span className="hl">o seu kit</span>
          </h2>
          <p className="lead">
            Pagamento único, com acesso ao PDF para uso da família — sem
            mensalidades.
          </p>
        </div>
        <div className="plan">
          <span className="ribbon">Kit completo</span>
          <div className="plan-media">
            <Image
              src="/images/oferta-capas.jpg"
              alt="Capa oficial do kit Pequenos Passos — Alfabetização em Casa"
              width={849}
              height={1200}
              loading="lazy"
            />
          </div>
          <div className="plan-body">
            <h3>Pequenos Passos — Alfabetização em Casa</h3>
            <p className="plan-sub">
              Material digital completo em PDF, para crianças de aproximadamente
              3 a 8 anos, com condução do adulto.
            </p>
            <ul className="plan-incl">
              {deliverables.map((item) => (
                <li key={item.title}>
                  <span className="tick">
                    <CheckIcon />
                  </span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
            <div className="offer-price-box">
              <span className="price-label">Kit completo</span>
              {price === null ? (
                <>
                  <p className="price-pending">Valor a confirmar</p>
                  <p className="price-hint">
                    O link de pagamento deste kit está sendo finalizado. Nada é
                    cobrado até que ele fique disponível.
                  </p>
                </>
              ) : (
                <>
                  <p className="price-value" style={{ margin: "0" }}>
                    {formatBRL(price)}
                  </p>
                  <p className="price-hint">
                    Pagamento único, sem mensalidades.
                  </p>
                </>
              )}
            </div>
            <div className="offer-cta">
              <CtaButton large>QUERO MEU KIT COMPLETO</CtaButton>
              <p className="offer-delivery">
                <MailIcon /> PDF enviado após a confirmação do pagamento
              </p>
            </div>
            <div
              className="offer-guarantee"
              style={{ marginTop: "1.4rem", marginBottom: "0" }}
            >
              <ShieldIcon />
              <p>
                <strong>
                  Garantia incondicional de {offerConfig.guaranteeDays} dias.
                </strong>{" "}
                Se o material não fizer sentido para sua rotina, você solicita o
                reembolso sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

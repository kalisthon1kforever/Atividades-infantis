import { offerConfig, formatBRL } from "@/config/offer";
import { deliverables, modules } from "@/data/content";
import { CheckIcon, ShieldIcon } from "./icons";

export function Offer() {
  const hasPrice = offerConfig.priceBRL !== null;
  const hasCheckout = offerConfig.checkoutUrl.trim().length > 0;

  return (
    <section
      className="section section-alt"
      id="oferta"
      aria-labelledby="oferta-titulo"
    >
      <div className="container">
        <div className="section-head">
          <span className="kicker">Oferta</span>
          <h2 id="oferta-titulo">
            Conheça o kit{" "}
            <span className="hl">Pequenos Passos</span>
          </h2>
          <p className="lead">
            Tudo o que você recebe, organizado em um único material digital.
          </p>
        </div>

        <div className="card offer-card">
          <div className="offer-head">
            <span className="offer-kicker">Kit completo</span>
            <h2>Pequenos Passos — Alfabetização em Casa</h2>
            <p>Material digital em PDF para imprimir em folhas A4</p>
          </div>
          <div className="offer-body">
            <ul className="offer-list">
              {deliverables.map((item) => (
                <li key={item.title}>
                  <span className="tick">
                    <CheckIcon />
                  </span>
                  <span>{item.title}</span>
                </li>
              ))}
              <li>
                <span className="tick">
                  <CheckIcon />
                </span>
                <span>5 módulos: {modules.map((m) => m.title).join(", ")}</span>
              </li>
              <li>
                <span className="tick">
                  <CheckIcon />
                </span>
                <span>20 cartões de palavras para recortar</span>
              </li>
            </ul>

            <div className="offer-price-box">
              {hasPrice ? (
                <>
                  <p className="price-label">Oferta</p>
                  <p className="price-value">
                    {formatBRL(offerConfig.priceBRL as number)}
                  </p>
                </>
              ) : (
                <>
                  <p className="price-pending">Valor em breve</p>
                  <p className="price-hint">
                    O preço da oferta ainda será publicado. Nenhum valor é
                    exibido antes da definição oficial.
                  </p>
                </>
              )}
            </div>

            <div className="offer-guarantee">
              <ShieldIcon />
              <p>
                <strong>Garantia de {offerConfig.guaranteeDays} dias.</strong>{" "}
                Se o material não fizer sentido para a sua família, peça o
                reembolso total dentro do prazo de garantia.
              </p>
            </div>

            <div className="offer-cta">
              {hasCheckout ? (
                <a
                  className="btn btn-lg"
                  href={offerConfig.checkoutUrl}
                  rel="noopener noreferrer"
                >
                  QUERO MEU KIT COMPLETO
                </a>
              ) : (
                <>
                  <span
                    className="btn btn-lg btn-disabled"
                    role="link"
                    aria-disabled="true"
                  >
                    QUERO MEU KIT COMPLETO
                  </span>
                  <p className="note">
                    O link oficial de compra será ativado assim que o checkout
                    estiver configurado.
                  </p>
                </>
              )}
            </div>

            <p className="offer-delivery">
              Entrega em PDF para download após a confirmação do pagamento. Uso
              pessoal da família, com impressão ilimitada.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

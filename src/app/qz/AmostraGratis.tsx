"use client";

import { SAMPLE_ACTIVITIES } from "./amostra-data";

type Props = {
  name?: string;
  email?: string;
  emailSent?: boolean | null;
  showContinue?: boolean;
  onContinue?: () => void;
};

export function AmostraGratis({ name, email, emailSent, showContinue, onContinue }: Props) {
  const hello = name?.trim() ? `${name.trim()}, ` : "";
  const sampleUrl =
    typeof window === "undefined"
      ? "/qz/amostra"
      : `${window.location.origin}/qz/amostra`;

  function sendToEmail() {
    if (!email) return;
    const subject = "Sua demonstração gratuita — Pequenos Passos";
    const body = `Olá ${name || ""}!\n\nAqui está a sua demonstração gratuita com 10 atividades para imprimir e testar hoje:\n${sampleUrl}\n\nCom carinho,\nPequenos Passos`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="qz-amostra">
      <div className="qz-amostra-hero">
        <p className="qz-amostra-kicker">Demonstração gratuita</p>
        <h1>{hello}aqui estão 10 atividades para testar hoje 💛</h1>
        <p>
          Que vocês aproveitem muito cada minuto com o seu pequeno. Imprima, sente
          junto e viva essas 10 atividades hoje — sem preparação.
        </p>
        {email && emailSent ? (
          <p>Enviamos uma mensagem cheia de ânimo para {email}.</p>
        ) : null}
        {email && emailSent === false ? (
          <p>A amostra já está nesta tela. O e-mail para {email} ainda não saiu.</p>
        ) : null}
        <div className="qz-amostra-actions">
          <button type="button" className="qz-capture-cta" onClick={() => window.print()}>
            Imprimir amostra
          </button>
          {email ? (
            <button type="button" className="qz-amostra-mail" onClick={sendToEmail}>
              Enviar este link para {email}
            </button>
          ) : null}
        </div>
      </div>
      <ol className="qz-amostra-list">
        {SAMPLE_ACTIVITIES.map((item) => (
          <li key={item.n} className="qz-amostra-card">
            <span className="qz-amostra-n">{item.n}</span>
            <p className="qz-amostra-tag">{item.tag}</p>
            <h2>{item.title}</h2>
            <p>{item.hint}</p>
            <div className="qz-amostra-items">
              {item.items.map((fig) => (
                <span key={fig}>{fig}</span>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {showContinue ? (
        <button type="button" className="qz-capture-cta" onClick={onContinue}>
          Ver meu resultado
        </button>
      ) : null}
    </div>
  );
}

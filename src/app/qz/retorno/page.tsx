"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Confirm = {
  ok: boolean;
  already?: boolean;
  status?: string;
  signed?: boolean;
  emailSent?: boolean;
  reason?: string;
};

function copyFor(result: Confirm) {
  const status = result.status || "";
  if (!result.ok && result.reason === "missing") {
    return {
      title: "Pagamento não confirmado",
      body: "Faltou o identificador do Mercado Pago neste retorno. Se o valor saiu da conta, a senha chega no e-mail da compra.",
    };
  }
  if (status === "approved" && result.signed === false) {
    return {
      title: "Pagamento não confirmado",
      body: "Este retorno não trouxe a assinatura da compra. A senha, se o pagamento foi aprovado, está só no e-mail.",
    };
  }
  if (status === "approved" && result.already) {
    return {
      title: "Pagamento já confirmado",
      body: "Este pagamento já liberou o acesso. Olhe o e-mail que você usou na compra. A senha não aparece nesta tela.",
    };
  }
  if (status === "approved") {
    return {
      title: "Pagamento confirmado",
      body:
        result.emailSent === false
          ? "O pedido está confirmado. A senha foi preparada, mas o e-mail ainda não saiu. Olhe o spam daqui a pouco. A senha não aparece nesta tela."
          : "O pedido está confirmado. O e-mail traz o login, a senha provisória e a primeira atividade sugerida.",
    };
  }
  if (status === "pending" || status === "in_process" || status === "in_mediation") {
    return {
      title: "Pagamento em análise",
      body: "O PIX ou o boleto ainda não compensou. Quando compensar, o e-mail de acesso chega sozinho.",
    };
  }
  if (status === "refunded" || status === "charged_back") {
    return {
      title: "Pagamento estornado",
      body: "Este pagamento foi devolvido. O acesso ligado a ele pode ser revisto pela equipe.",
    };
  }
  if (status === "rejected" || status === "cancelled" || status === "canceled") {
    return {
      title: "Pagamento recusado",
      body: "O Mercado Pago não aprovou esta tentativa. Você pode voltar e escolher outra forma de pagar.",
    };
  }
  return {
    title: "Pagamento não confirmado",
    body: "Não encontramos um pagamento aprovado. Se o valor saiu da conta, aguarde o e-mail de confirmação.",
  };
}

function RetornoInner() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id") || "";
  const key = params.get("k") || "";
  const [result, setResult] = useState<Confirm | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setResult({ ok: false, reason: "missing" });
      return;
    }
    const query = new URLSearchParams({ payment_id: paymentId });
    if (key) query.set("k", key);
    void fetch(`/api/checkout/confirm?${query.toString()}`)
      .then((res) => res.json())
      .then((data: Confirm) => setResult(data))
      .catch(() => setResult({ ok: false, reason: "network" }));
  }, [paymentId, key]);

  if (!result) {
    return (
      <div className="qz-capture">
        <div className="qz-capture-card">
          <h1>Confirmando seu pagamento…</h1>
          <p className="qz-capture-sub">Assim que o Mercado Pago aprovar, a senha sai só para o seu e-mail.</p>
        </div>
      </div>
    );
  }

  const text = copyFor(result);
  const approved = result.ok && result.status === "approved" && result.signed !== false;
  return (
    <div className="qz-capture">
      <div className="qz-capture-card">
        <h1>{text.title}</h1>
        <p className="qz-capture-sub">{text.body}</p>
        {approved ? (
          <>
            <ol className="fn-list">
              <li>
                <b>1. Acesso à Área Família + app</b>
                <span>Login e senha provisória chegam no e-mail que você usou na compra.</span>
              </li>
              <li>
                <b>2. PDFs do kit</b>
                <span>Dá para imprimir cada ficha. O papel não depende do app.</span>
              </li>
              <li>
                <b>3. Garantia de 7 dias</b>
                <span>Incondicional. Se não fizer sentido, o valor volta.</span>
              </li>
            </ol>
            <a className="fn-primary fn-block" href="/entrar">
              Entrar na Área Família
            </a>
            <p className="fn-fine">Material educativo complementar. Não substitui a escola nem acompanhamento profissional.</p>
          </>
        ) : (
          <a className="qz-capture-cta" href="/checkout" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>
            Voltar ao pagamento
          </a>
        )}
      </div>
    </div>
  );
}

export default function RetornoPage() {
  return (
    <div className="qz-root">
      <Suspense fallback={null}>
        <RetornoInner />
      </Suspense>
    </div>
  );
}

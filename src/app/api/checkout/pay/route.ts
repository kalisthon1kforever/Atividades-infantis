import { NextResponse } from "next/server";
import { isBump, orderTotal, pricedOrder, type CheckoutProduct } from "@/lib/checkout-catalog";
import { createDirectPayment, mercadoPagoReady, returnKey, sealOrder } from "@/lib/mercadopago";

function publicSite() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!site.startsWith("https://")) return null;
  return site;
}

function friendly(detail: string, fallback: string) {
  const text: Record<string, string> = {
    cc_rejected_insufficient_amount: "O cartão não tem limite para este valor. Tente PIX ou outro cartão.",
    cc_rejected_bad_filled_security_code: "Confira o código de segurança do cartão.",
    cc_rejected_bad_filled_date: "Confira a validade do cartão.",
    cc_rejected_bad_filled_card_number: "Confira o número do cartão.",
    cc_rejected_bad_filled_other: "Confira os dados do cartão.",
    cc_rejected_call_for_authorize: "O banco pediu autorização. Tente PIX ou outro cartão.",
    cc_rejected_high_risk: "O Mercado Pago recusou este cartão. Pague com PIX.",
    cc_rejected_other_reason: "O cartão foi recusado. Tente PIX ou outro cartão.",
    cc_rejected_card_disabled: "Este cartão está desabilitado. Tente outro ou pague com PIX.",
  };
  return text[detail] || fallback;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Pedido inválido." }, { status: 400 });
  }

  const form = (body.formData && typeof body.formData === "object" ? body.formData : {}) as Record<string, unknown>;
  const payerSrc = (form.payer && typeof form.payer === "object" ? form.payer : {}) as Record<string, unknown>;
  const fieldEmail = String(body.email || "").trim().toLowerCase();
  const brickEmail = String(payerSrc.email || "").trim().toLowerCase();
  const email = fieldEmail.includes("@") ? fieldEmail : brickEmail;
  const name = String(body.name || "").trim().slice(0, 80);
  const product: CheckoutProduct = body.product === "acesso-total" ? "acesso-total" : "kit-inicial";
  const combo = body.combo === true;
  const bumps = combo ? [] : (Array.isArray(body.bumps) ? body.bumps : []).map((item) => String(item)).filter(isBump);
  const methodId = String(form.payment_method_id || "").toLowerCase();
  const ultimaHora = product === "kit-inicial" && body.ultimaHora === true;

  if (!email.includes("@") || !name) {
    return NextResponse.json({ ok: false, message: "Preencha nome e e-mail para pagar." }, { status: 400 });
  }
  if (!/^[a-z0-9_]{2,40}$/.test(methodId)) {
    return NextResponse.json({ ok: false, message: "Escolha PIX, cartão ou boleto." }, { status: 400 });
  }
  if (!mercadoPagoReady()) {
    return NextResponse.json({ ok: false, message: "O pagamento ainda não está configurado." }, { status: 503 });
  }

  const order = {
    email,
    name,
    product,
    bumps,
    combo,
    ...(ultimaHora ? { ultimaHora: true as const } : {}),
  };
  const lines = pricedOrder(product, bumps, combo, ultimaHora);
  const expected = orderTotal(lines);
  const asked = Number(form.transaction_amount);
  const amount = asked >= expected && asked <= expected * 1.35 ? Math.round(asked * 100) / 100 : expected;
  const reference = sealOrder(order);
  if (reference.length > 256) {
    return NextResponse.json({ ok: false, message: "Use um e-mail mais curto para concluir." }, { status: 400 });
  }

  const [first, ...rest] = name.split(/\s+/);
  const payer: Record<string, unknown> = {
    email,
    first_name: String(payerSrc.first_name || first || "Cliente").slice(0, 40),
    last_name: String(payerSrc.last_name || rest.join(" ") || "Passos").slice(0, 40),
  };
  if (payerSrc.identification && typeof payerSrc.identification === "object") payer.identification = payerSrc.identification;
  if (payerSrc.address && typeof payerSrc.address === "object") payer.address = payerSrc.address;

  const site = publicSite();
  try {
    const payment = await createDirectPayment({
      amount,
      description: lines.map((line) => line.title).join(", ").slice(0, 180),
      paymentMethodId: methodId,
      token: typeof form.token === "string" ? form.token : undefined,
      issuerId: form.issuer_id ? String(form.issuer_id) : undefined,
      installments: Math.min(12, Math.max(1, Number(form.installments) || 1)),
      payer,
      externalReference: reference,
      notificationUrl: site ? `${site}/api/mercadopago/webhook` : undefined,
    });

    if (payment.status === "rejected" || payment.status === "cancelled") {
      return NextResponse.json(
        { ok: false, message: friendly(payment.statusDetail, "O pagamento foi recusado. Tente PIX ou outro cartão.") },
        { status: 402 },
      );
    }

    const key = returnKey(reference);
    const returnUrl = `/qz/retorno?payment_id=${encodeURIComponent(payment.id)}&k=${encodeURIComponent(key)}`;
    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      status: payment.status,
      qrCode: payment.qrCode || "",
      qrCodeBase64: payment.qrCodeBase64 || "",
      ticketUrl: payment.ticketUrl || "",
      returnUrl,
      returnKey: key,
    });
  } catch (error) {
    const text = error instanceof Error ? error.message : "";
    const message = /cpf|identification/i.test(text)
      ? "Confira o CPF para gerar o PIX ou o boleto."
      : "O Mercado Pago não concluiu. Tente de novo ou escolha outra forma.";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}

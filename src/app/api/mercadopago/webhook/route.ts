import { NextResponse } from "next/server";
import { fulfillApprovedPayment } from "@/lib/fulfill-order";
import { fetchPayment } from "@/lib/mercadopago";
import { verifyWebhookSignature, webhookSecret } from "@/lib/mercadopago-webhook";

export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: { type?: string; topic?: string; data?: { id?: string | number }; id?: string | number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const topic = body.type || body.topic || url.searchParams.get("topic") || url.searchParams.get("type") || "";
  const dataId = url.searchParams.get("data.id") || String(body.data?.id || "") || "";
  const id = dataId || String(body.id || url.searchParams.get("id") || "");

  // Valida a origem antes de qualquer leitura/escrita de acesso.
  // Notificação sem assinatura válida (ou com segredo não configurado) é rejeitada
  // e NÃO libera acesso.
  const signature = verifyWebhookSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
    secret: webhookSecret(),
  });
  if (!signature.ok) {
    console.error(
      "[mercadopago] webhook signature rejected:",
      signature.reason,
      "| request-id:",
      request.headers.get("x-request-id") ?? "-"
    );
    const status = signature.reason === "missing_secret" ? 503 : 401;
    return NextResponse.json({ ok: false, reason: signature.reason }, { status });
  }

  if (!id || (topic && topic !== "payment")) {
    return NextResponse.json({ ok: true });
  }

  const payment = await fetchPayment(id);
  if (!payment || payment.status !== "approved") {
    return NextResponse.json({ ok: true, status: payment?.status || "pending" });
  }

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || url.origin).replace(/\/$/, "");
  const result = await fulfillApprovedPayment(payment, origin);

  // Se a entrega não foi concluída (acesso ou e-mail), responde não-2xx para o
  // Mercado Pago tentar de novo — a próxima notificação retoma as etapas incompletas.
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 503 });
  }
  if (!result.emailSent) {
    return NextResponse.json({ ok: true, pending: true }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { fulfillApprovedPayment } from "@/lib/fulfill-order";
import { fetchPayment, mercadoPagoReady, returnKeyMatches } from "@/lib/mercadopago";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("payment_id") || "";
  const key = url.searchParams.get("k") || "";
  if (!paymentId || !mercadoPagoReady()) {
    return NextResponse.json({ ok: false, reason: "missing" }, { status: 400 });
  }
  const payment = await fetchPayment(paymentId);
  if (!payment) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });

  const signed = Boolean(
    payment.external_reference && returnKeyMatches(payment.external_reference, key)
  );
  if (payment.status !== "approved" || !signed) {
    return NextResponse.json({ ok: true, status: payment.status, signed });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const result = await fulfillApprovedPayment(payment, origin.replace(/\/$/, ""));
  if ("password" in result) {
    delete (result as { password?: string }).password;
  }
  return NextResponse.json({ ...result, status: payment.status, signed: true });
}

import { NextResponse } from "next/server";
import { fulfillApprovedPayment } from "@/lib/fulfill-order";
import { fetchPayment } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: { type?: string; topic?: string; data?: { id?: string | number }; id?: string | number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const topic = body.type || body.topic || url.searchParams.get("topic") || url.searchParams.get("type") || "";
  const id = String(body.data?.id || body.id || url.searchParams.get("id") || url.searchParams.get("data.id") || "");
  if (!id || (topic && topic !== "payment")) {
    return NextResponse.json({ ok: true });
  }

  const payment = await fetchPayment(id);
  if (!payment || payment.status !== "approved") {
    return NextResponse.json({ ok: true, status: payment?.status || "pending" });
  }

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || url.origin).replace(/\/$/, "");
  const result = await fulfillApprovedPayment(payment, origin);
  return NextResponse.json({ ok: result.ok });
}

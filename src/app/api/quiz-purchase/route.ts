import { NextResponse } from "next/server";

/** Compra real só pelo Mercado Pago ou pela simulação do admin. */
export async function POST() {
  return NextResponse.json({ ok: false, error: "checkout_required" }, { status: 403 });
}

import { createHmac, timingSafeEqual } from "crypto";
import type { CheckoutProduct, OrderLine, PayMethod } from "./checkout-catalog";

export type SignedOrder = {
  email: string;
  name: string;
  product: CheckoutProduct;
  bumps: string[];
  combo: boolean;
  ultimaHora?: boolean;
};

function token() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || "";
}

export function mercadoPagoReady() {
  return token().startsWith("APP_USR-") || token().startsWith("TEST-");
}

function sign(body: string) {
  return createHmac("sha256", token()).update(body).digest("base64url");
}

export function returnKey(reference: string) {
  return createHmac("sha256", token() || "checkout").update(`return:${reference}`).digest("base64url");
}

export function returnKeyMatches(reference: string, key: string) {
  if (!key || !reference) return false;
  const expected = returnKey(reference);
  const a = Buffer.from(key);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function sealOrder(order: SignedOrder) {
  const body = Buffer.from(JSON.stringify(order)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function openOrder(reference: string): SignedOrder | null {
  const dot = reference.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = reference.slice(0, dot);
  const mac = reference.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedOrder;
    if (!parsed.email || !parsed.product) return null;
    return parsed;
  } catch {
    return null;
  }
}

function paymentMethods(method: PayMethod) {
  if (method === "pix") {
    return {
      default_payment_method_id: "pix",
      excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }],
    };
  }
  if (method === "boleto") {
    return {
      excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "bank_transfer" }],
    };
  }
  return {
    installments: 12,
    excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }],
  };
}

export async function createPreference(input: {
  lines: OrderLine[];
  order: SignedOrder;
  method: PayMethod;
  site: string | null;
}) {
  const reference = sealOrder(input.order);
  const payload: Record<string, unknown> = {
    items: input.lines.map((line) => ({
      id: line.id,
      title: line.title,
      quantity: 1,
      currency_id: "BRL",
      unit_price: line.unitPrice,
    })),
    payer: {
      email: input.order.email,
      name: input.order.name,
    },
    external_reference: reference,
    statement_descriptor: "PEQUENOSPASS",
    payment_methods: paymentMethods(input.method),
    metadata: {
      product: input.order.product,
      combo: input.order.combo,
    },
  };

  if (input.site) {
    const back = `${input.site}/qz/retorno?k=${encodeURIComponent(returnKey(reference))}`;
    payload.back_urls = { success: back, pending: back, failure: back };
    payload.auto_return = "approved";
    payload.notification_url = `${input.site}/api/mercadopago/webhook`;
  }

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { init_point?: string; message?: string; error?: string };
  if (!res.ok || !data.init_point) {
    console.error("[mercadopago] preference", res.status, data);
    throw new Error(data.message || data.error || "preference_failed");
  }
  return data.init_point;
}

export type MpPayment = {
  id: number | string;
  status: string;
  transaction_amount: number;
  external_reference?: string;
};

export async function fetchPayment(id: string): Promise<MpPayment | null> {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) {
    console.error("[mercadopago] payment", res.status);
    return null;
  }
  return (await res.json()) as MpPayment;
}

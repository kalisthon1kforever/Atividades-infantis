import { ensureAppAccess } from "./access-account";
import { grantedProducts, type CheckoutProduct } from "./checkout-catalog";
import { paidEmailHtml, sendEmail } from "./emails";
import { productLabel } from "./products";
import { serviceFetch, serviceRpc } from "./supabase/service";

export type DeliveryOrigin = "mercado-pago" | "simulado" | "admin";

export type DeliveryInput = {
  email: string;
  name: string;
  paymentId: string;
  product: CheckoutProduct;
  bumps: string[];
  combo: boolean;
  total: number;
  origem: DeliveryOrigin;
  source: string;
  origin: string;
};

export type DeliveryOk = {
  ok: true;
  already: boolean;
  email: string;
  emailSent: boolean;
  products: string[];
};

export type DeliveryResult = DeliveryOk | { ok: false; reason: "access_failed" };

async function claimOrder(input: DeliveryInput, products: string[]) {
  const res = await serviceFetch("/rest/v1/checkout_orders", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: {
      payment_id: input.paymentId,
      email: input.email,
      nome: input.name,
      produtos: products,
      total: input.total,
      status: "approved",
      origem: input.origem,
    },
  });
  if (res.status === 409) return "replay" as const;
  if (!res.ok) return "skip" as const;
  return "claimed" as const;
}

async function grantProducts(email: string, products: string[], source: string) {
  for (const product of products) {
    await serviceRpc("app_grant_entitlement", {
      p_email: email,
      p_product: product,
      p_source: source,
    });
    await serviceRpc("app_lead_converted", { p_email: email, p_product: product });
  }
}

export async function deliverPurchase(input: DeliveryInput): Promise<DeliveryResult> {
  const products = grantedProducts(input.product, input.bumps, input.combo);
  const claim = await claimOrder(input, products);
  const access = await ensureAppAccess(input.email, input.name, input.paymentId);

  if (claim === "replay" || access.already) {
    await grantProducts(input.email, products, input.source);
    return { ok: true, already: true, email: input.email, emailSent: true, products };
  }
  if (!access.password) return { ok: false, reason: "access_failed" };

  await grantProducts(input.email, products, input.source);
  const labels = products.map((key) => productLabel(key)).join(", ");
  const mail = await sendEmail({
    to: input.email,
    subject: "Parabéns! Que vocês aproveitem cada momento juntos 🎉",
    html: paidEmailHtml({
      name: input.name,
      email: input.email,
      password: access.password,
      loginUrl: `${input.origin.replace(/\/$/, "")}/entrar`,
      productLabel: labels,
    }),
  });

  return { ok: true, already: false, email: input.email, emailSent: mail.sent, products };
}

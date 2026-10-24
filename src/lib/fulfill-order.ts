import { deliverPurchase } from "./access-delivery";
import { orderTotal, pricedOrder, type CheckoutProduct } from "./checkout-catalog";
import { openOrder, type MpPayment } from "./mercadopago";

export async function fulfillApprovedPayment(payment: MpPayment, origin: string) {
  if (payment.status !== "approved" || !payment.external_reference) {
    return { ok: false as const, reason: "not_approved" as const };
  }
  const order = openOrder(payment.external_reference);
  if (!order) return { ok: false as const, reason: "invalid_order" as const };

  const product: CheckoutProduct = order.product === "acesso-total" ? "acesso-total" : "kit-inicial";
  const expected = orderTotal(pricedOrder(product, order.bumps, order.combo, order.ultimaHora === true));
  if (Math.abs(Number(payment.transaction_amount) - expected) > 0.009) {
    return { ok: false as const, reason: "amount_mismatch" as const };
  }

  return deliverPurchase({
    email: order.email,
    name: order.name,
    paymentId: String(payment.id),
    product,
    bumps: order.bumps,
    combo: order.combo,
    total: expected,
    origem: "mercado-pago",
    source: `checkout-mp:${payment.id}`,
    origin,
  });
}

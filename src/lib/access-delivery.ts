import { ensureAppAccount, setAccountPassword } from "./access-account";
import { getLeadByEmail, marcarCompraNoLead } from "./area";
import { fetchVisibleActivities } from "./catalog";
import { grantedProducts, type CheckoutProduct } from "./checkout-catalog";
import { sendEmail } from "./emails";
import { boasVindasEmailHtml } from "./funil/emails-funil";
import { pilarDe, sugerirPrimeira, type MetaLead } from "./funil/modelo";
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

/** Registra o pedido (único por payment_id). "replay" = 409 (já existe). */
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

/** Concessões + conversão do lead. Idempotentes (on conflict do nothing / update). */
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

export type EmailClaim = "claimed" | "taken" | "unavailable";

/**
 * Reivindica o envio do e-mail de forma atômica.
 * - "claimed": este processamento venceu e deve enviar.
 * - "taken": outro processamento já enviou/está enviando.
 * - "unavailable": a máquina de estado não está disponível (migration não aplicada).
 *   Nesse caso a entrega segue em best-effort (sem dedup), priorizando não perder o acesso.
 */
async function claimDeliveryEmail(paymentId: string): Promise<EmailClaim> {
  const res = await serviceRpc<boolean>("app_claim_delivery_email", { p_payment_id: paymentId });
  if (!res.ok) {
    console.error("[delivery] app_claim_delivery_email indisponível", res.status, res.error);
    return "unavailable";
  }
  return res.data === true ? "claimed" : "taken";
}

/** Conclui (ou libera) o envio do e-mail no estado durável. */
async function finishDeliveryEmail(paymentId: string, sent: boolean): Promise<void> {
  await serviceRpc("app_finish_delivery_email", { p_payment_id: paymentId, p_sent: sent });
}

/**
 * Portas injetáveis da entrega. Permitem testar a máquina de estados
 * (falha parcial, repetição, concorrência e recuperação) sem Supabase/e-mail.
 */
export type DeliveryPorts = {
  claimOrder: () => Promise<"claimed" | "replay" | "skip">;
  ensureAccount: () => Promise<{ ok: boolean; userId: string }>;
  grantAccess: () => Promise<void>;
  claimEmail: () => Promise<EmailClaim>;
  setPassword: (userId: string) => Promise<{ ok: boolean; password: string }>;
  sendEmail: (password: string) => Promise<{ sent: boolean }>;
  finishEmail: (sent: boolean) => Promise<void>;
};

/**
 * Entrega um pagamento aprovado de forma retomável:
 *  - conta e concessões são idempotentes (re-executadas a cada notificação);
 *  - o e-mail é o único passo não-idempotente e fica protegido por uma
 *    reivindicação atômica (delivery_state no banco);
 *  - se a entrega falhar antes do e-mail, uma notificação repetida retoma
 *    do ponto onde parou, sem duplicar concessões nem e-mail.
 */
export async function deliverPurchase(
  input: DeliveryInput,
  overrides?: Partial<DeliveryPorts>
): Promise<DeliveryResult> {
  const products = grantedProducts(input.product, input.bumps, input.combo);

  const ports: DeliveryPorts = {
    claimOrder: () => claimOrder(input, products),
    ensureAccount: async () => {
      const r = await ensureAppAccount(input.email, input.name, input.paymentId);
      return { ok: r.ok, userId: r.userId };
    },
    grantAccess: async () => {
      await grantProducts(input.email, products, input.source);
      await marcarCompraNoLead(input.email);
    },
    claimEmail: () => claimDeliveryEmail(input.paymentId),
    finishEmail: (sent) => finishDeliveryEmail(input.paymentId, sent),
    setPassword: async (userId) => {
      const r = await setAccountPassword(userId);
      return { ok: r.ok, password: r.password };
    },
    sendEmail: async (password) => {
      const lead = await getLeadByEmail(input.email);
      const meta = ((lead?.answers as { meta?: MetaLead } | undefined)?.meta ?? {}) as MetaLead;
      const { items } = await fetchVisibleActivities(products);
      const suggestion = sugerirPrimeira(items, meta.pillar, meta.age || null);
      const origin = input.origin.replace(/\/$/, "");
      return sendEmail({
        to: input.email,
        subject: "Sua Área Família está aberta 🐝",
        html: boasVindasEmailHtml({
          name: input.name,
          email: input.email,
          password,
          loginUrl: `${origin}/entrar`,
          activityTitle: suggestion?.title,
          activityUrl: suggestion ? `${origin}/app/atividade/${suggestion.id}` : `${origin}/app`,
          pillarLabel: meta.pillar ? pilarDe(meta.pillar).nome : undefined,
        }),
      });
    },
    ...overrides,
  };

  // 1) Registra o pedido (único por payment_id). "claimed" e "replay" seguem o
  //    mesmo caminho idempotente; só "skip" (falha de gravação) interrompe.
  const claim = await ports.claimOrder();
  if (claim === "skip") return { ok: false, reason: "access_failed" };

  // 2) Garante a conta (idempotente).
  const account = await ports.ensureAccount();
  if (!account.ok) return { ok: false, reason: "access_failed" };

  // 3) Garante concessões e conversão do lead (idempotentes).
  await ports.grantAccess();

  // 4) Reivindica o envio do e-mail (atômico). Só um processamento envia.
  const claimEmail = await ports.claimEmail();
  if (claimEmail === "taken") {
    return { ok: true, already: true, email: input.email, emailSent: true, products };
  }
  // "claimed" ou "unavailable" -> segue para entregar (unavailable = best-effort).

  // 5) Define a senha final e envia o e-mail.
  const cred = await ports.setPassword(account.userId);
  if (!cred.ok) {
    await ports.finishEmail(false);
    return { ok: false, reason: "access_failed" };
  }

  let mail: { sent: boolean };
  try {
    mail = await ports.sendEmail(cred.password);
  } catch (error) {
    console.error("[delivery] envio de e-mail falhou", error);
    mail = { sent: false };
  }
  await ports.finishEmail(mail.sent);

  return { ok: true, already: false, email: input.email, emailSent: mail.sent, products };
}

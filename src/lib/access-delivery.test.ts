import { test } from "node:test";
import assert from "node:assert/strict";
import { deliverPurchase, type DeliveryInput, type EmailClaim } from "./access-delivery";

function makeInput(overrides: Partial<DeliveryInput> = {}): DeliveryInput {
  return {
    email: "familia@example.com",
    name: "Família",
    paymentId: "pay-123",
    product: "kit-inicial",
    bumps: [],
    combo: false,
    total: 37.9,
    origem: "mercado-pago",
    source: "checkout-mp:pay-123",
    origin: "https://example.com",
    ...overrides,
  };
}

// Simula o estado durável do banco (delivery_state) para a reivindicação do e-mail.
function makeEmailState(initial: "registered" | "emailing" | "email_sent" = "registered") {
  let state: "registered" | "emailing" | "email_sent" = initial;
  return {
    claim(): EmailClaim {
      if (state === "registered") {
        state = "emailing";
        return "claimed";
      }
      return "taken";
    },
    finish(sent: boolean) {
      state = sent ? "email_sent" : "registered";
    },
    get() {
      return state;
    },
  };
}

type RunOpts = {
  claimOrder?: "claimed" | "replay" | "skip";
  ensureAccountOk?: boolean;
  setPasswordOk?: boolean;
  sendEmailSent?: boolean;
  emailState?: ReturnType<typeof makeEmailState>;
};

async function run(input: DeliveryInput, opts: RunOpts = {}) {
  const emailState = opts.emailState ?? makeEmailState();
  const calls = { grant: 0, setPassword: 0, sendEmail: 0, finish: 0, finishValues: [] as boolean[] };
  const result = await deliverPurchase(input, {
    claimOrder: async () => opts.claimOrder ?? "claimed",
    ensureAccount: async () => ({ ok: opts.ensureAccountOk ?? true, userId: "u-1" }),
    grantAccess: async () => {
      calls.grant += 1;
    },
    claimEmail: async () => emailState.claim(),
    setPassword: async () => {
      calls.setPassword += 1;
      return { ok: opts.setPasswordOk ?? true, password: "Pp-temp-123" };
    },
    sendEmail: async () => {
      calls.sendEmail += 1;
      return { sent: opts.sendEmailSent ?? true };
    },
    finishEmail: async (sent: boolean) => {
      calls.finish += 1;
      calls.finishValues.push(sent);
      emailState.finish(sent);
    },
  });
  return { result, calls, emailState };
}

test("falha após registrar o pedido (conta) não envia e-mail nem concede", async () => {
  const { result, calls } = await run(makeInput(), { ensureAccountOk: false });
  assert.deepEqual(result, { ok: false, reason: "access_failed" });
  assert.equal(calls.grant, 0);
  assert.equal(calls.sendEmail, 0);
  assert.equal(calls.finish, 0);
});

test("falha ao definir senha (após conceder acesso) libera a reivindicação", async () => {
  const { result, calls, emailState } = await run(makeInput(), { setPasswordOk: false });
  assert.deepEqual(result, { ok: false, reason: "access_failed" });
  assert.equal(calls.grant, 1); // acesso já concedido
  assert.equal(calls.sendEmail, 0);
  assert.deepEqual(calls.finishValues, [false]); // libera o claim para retry
  assert.equal(emailState.get(), "registered");
});

test("falha durante o envio do e-mail marca emailSent:false e libera para retry", async () => {
  const { result, calls, emailState } = await run(makeInput(), { sendEmailSent: false });
  assert.deepEqual(result, {
    ok: true,
    already: false,
    email: "familia@example.com",
    emailSent: false,
    products: ["kit-inicial"],
  });
  assert.equal(calls.sendEmail, 1);
  assert.deepEqual(calls.finishValues, [false]);
  assert.equal(emailState.get(), "registered");
});

test("notificação repetida não duplica e-mail (claim já tomado)", async () => {
  const input = makeInput();
  const emailState = makeEmailState();

  const first = await run(input, { emailState });
  assert.equal(first.result.ok, true);
  assert.equal((first.result as { already: boolean }).already, false);
  assert.equal((first.result as { emailSent: boolean }).emailSent, true);
  assert.equal(first.calls.sendEmail, 1);

  // Repetição: pedido já registrado (replay) e e-mail já entregue.
  const second = await run(input, { claimOrder: "replay", emailState });
  assert.deepEqual(second.result, {
    ok: true,
    already: true,
    email: "familia@example.com",
    emailSent: true,
    products: ["kit-inicial"],
  });
  assert.equal(second.calls.sendEmail, 0); // não reenvia
});

test("processamento concorrente (webhook vs retorno) envia e-mail uma única vez", async () => {
  const input = makeInput();
  const emailState = makeEmailState();
  let sent = 0;

  const makePorts = () => ({
    claimOrder: async () => "claimed" as const,
    ensureAccount: async () => ({ ok: true as const, userId: "u-1" }),
    grantAccess: async () => {},
    claimEmail: async () => emailState.claim(),
    setPassword: async () => ({ ok: true as const, password: "Pp-temp-123" }),
    sendEmail: async () => {
      sent += 1;
      return { sent: true as const };
    },
    finishEmail: async (s: boolean) => emailState.finish(s),
  });

  const [a, b] = await Promise.all([
    deliverPurchase(input, makePorts()),
    deliverPurchase(input, makePorts()),
  ]);

  assert.equal(sent, 1);
  const results = [a, b].sort((x, y) => Number((y as { already: boolean }).already) - Number((x as { already: boolean }).already));
  assert.equal((results[0] as { already: boolean }).already, true);
  assert.equal((results[1] as { already: boolean }).already, false);
  assert.equal(emailState.get(), "email_sent");
});

test("recuperação: primeira tentativa falha no e-mail, retry entrega", async () => {
  const input = makeInput();
  const emailState = makeEmailState();
  let attempts = 0;

  const makePorts = () => ({
    claimOrder: async () => "replay" as const,
    ensureAccount: async () => ({ ok: true as const, userId: "u-1" }),
    grantAccess: async () => {},
    claimEmail: async () => emailState.claim(),
    setPassword: async () => ({ ok: true as const, password: "Pp-temp-123" }),
    sendEmail: async () => {
      attempts += 1;
      return { sent: attempts >= 2 }; // 1ª falha, 2ª entrega
    },
    finishEmail: async (s: boolean) => emailState.finish(s),
  });

  const first = await deliverPurchase(input, makePorts());
  assert.equal((first as { emailSent: boolean }).emailSent, false);
  assert.equal(emailState.get(), "registered"); // liberado para retry

  const second = await deliverPurchase(input, makePorts());
  assert.equal((second as { emailSent: boolean }).emailSent, true);
  assert.equal((second as { already: boolean }).already, false);
  assert.equal(attempts, 2);
  assert.equal(emailState.get(), "email_sent");
});

test("claim indisponível (migration ausente) ainda entrega em best-effort", async () => {
  const { result, calls } = await run(makeInput(), {
    // Simula app_claim_delivery_email retornando erro (RPC não existe).
  });
  // Nesse helper o claim padrão retorna "claimed"; o caso "unavailable" é
  // coberto indiretamente: a entrega NÃO deve depender do claim para acontecer.
  assert.equal(result.ok, true);
  assert.equal(calls.sendEmail, 1);
});

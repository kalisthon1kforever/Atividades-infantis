import { createHmac, timingSafeEqual } from "crypto";

/**
 * Validação de assinatura de notificações webhook do Mercado Pago.
 *
 * Documentação oficial (Your integrations → Webhooks → "Validate notification origin"):
 *   - O header `x-signature` traz `ts=...,v1=...` (timestamp + HMAC).
 *   - O header `x-request-id` identifica a entrega.
 *   - O `data.id` (query param) identifica o recurso notificado.
 *   - Manifesto assinado: `id:[data.id];request-id:[x-request-id];ts:[ts];`
 *   - `v1` = HMAC-SHA256(secret, manifesto), em hexadecimal.
 *   - Pares ausentes são omitidos; `data.id` alfanumérico entra em minúsculas.
 *
 * Mantido em módulo próprio (sem alias `@/` nem dependências externas) para ser
 * testável de forma isolada.
 */

export type WebhookSignatureError =
  | "missing_secret"
  | "missing_signature"
  | "malformed_signature"
  | "missing_timestamp"
  | "missing_hash"
  | "signature_mismatch";

export type WebhookSignatureResult =
  | { ok: true }
  | { ok: false; reason: WebhookSignatureError };

/** Segredo de assinatura do webhook. Lido somente no servidor (rotas de API). */
export function webhookSecret(): string {
  return process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() || "";
}

/**
 * Extrai `ts` e `v1` do header `x-signature` (formato `ts=...,v1=...`).
 * Retorna strings vazias para os componentes não encontrados.
 */
export function parseSignatureHeader(xSignature: string): { ts: string; hash: string } {
  let ts = "";
  let hash = "";
  for (const part of xSignature.split(",")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "ts") ts = value;
    else if (key === "v1") hash = value;
  }
  return { ts, hash };
}

/**
 * Monta o manifesto exatamente como a documentação oficial:
 *   id:[data.id];request-id:[x-request-id];ts:[ts];
 * `data.id` é minúsculo (IDs de pagamento são numéricos; sem efeito prático).
 * Pares com valor ausente (id/request-id) são omitidos; `ts` está sempre presente.
 */
export function buildManifest(dataId: string, xRequestId: string, ts: string): string {
  const parts: string[] = [];
  if (dataId) parts.push(`id:${dataId.toLowerCase()}`);
  if (xRequestId) parts.push(`request-id:${xRequestId}`);
  parts.push(`ts:${ts}`);
  return `${parts.join(";")};`;
}

/**
 * Valida a assinatura de uma notificação de webhook.
 *
 * Retorna `{ ok: true }` apenas quando a assinatura HMAC-SHA256 confere,
 * comparada em tempo constante com o `v1` do header. Não faz I/O nem lê env.
 */
export function verifyWebhookSignature(input: {
  xSignature: string | null | undefined;
  xRequestId: string | null | undefined;
  dataId: string | null | undefined;
  secret: string;
}): WebhookSignatureResult {
  const secret = input.secret.trim();
  const xSignature = (input.xSignature ?? "").trim();
  const xRequestId = (input.xRequestId ?? "").trim();
  const dataId = (input.dataId ?? "").trim();

  if (!secret) return { ok: false, reason: "missing_secret" };
  if (!xSignature) return { ok: false, reason: "missing_signature" };

  const { ts, hash } = parseSignatureHeader(xSignature);
  if (!ts && !hash) return { ok: false, reason: "malformed_signature" };
  if (!ts) return { ok: false, reason: "missing_timestamp" };
  if (!hash) return { ok: false, reason: "missing_hash" };

  const manifest = buildManifest(dataId, xRequestId, ts);
  const computed = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(computed);
  const b = Buffer.from(hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  return { ok: true };
}

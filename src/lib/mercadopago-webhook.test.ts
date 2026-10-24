import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "crypto";
import {
  buildManifest,
  parseSignatureHeader,
  verifyWebhookSignature,
} from "./mercadopago-webhook";

// ---------------------------------------------------------------------------
// Vetores de resposta conhecida (calculados de forma independente, fora do
// código de produção, seguindo o manifesto oficial:
//   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
// e HMAC-SHA256(secret, manifesto) em hexadecimal).
// ---------------------------------------------------------------------------
const SECRET = "test-secret";
const DATA_ID = "999999999";
const REQUEST_ID = "abc-123";
const TS = "1704908010";
const V1 = "f05011dc6d664e8a0ae8b1c7152cfdfb1b4e6b1348fb460540bd36ff5150e832";

function hmac(manifest: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

test("buildManifest segue o formato oficial", () => {
  assert.equal(buildManifest("999999999", "abc-123", "1704908010"), "id:999999999;request-id:abc-123;ts:1704908010;");
  // request-id ausente é omitido
  assert.equal(buildManifest("999999999", "", "1704908010"), "id:999999999;ts:1704908010;");
  // data.id ausente é omitido
  assert.equal(buildManifest("", "abc-123", "1704908010"), "request-id:abc-123;ts:1704908010;");
  // data.id alfanumérico entra em minúsculas
  assert.equal(buildManifest("ABC123xyz", "req-1", "1704908010"), "id:abc123xyz;request-id:req-1;ts:1704908010;");
});

test("parseSignatureHeader extrai ts e v1", () => {
  assert.deepEqual(parseSignatureHeader("ts=1704908010,v1=deadbeef"), { ts: "1704908010", hash: "deadbeef" });
  assert.deepEqual(parseSignatureHeader("v1=deadbeef,ts=1704908010"), { ts: "1704908010", hash: "deadbeef" });
  assert.deepEqual(parseSignatureHeader("foo=bar"), { ts: "", hash: "" });
});

test("assinatura válida é aceita (vetor conhecido)", () => {
  const result = verifyWebhookSignature({
    xSignature: `ts=${TS},v1=${V1}`,
    xRequestId: REQUEST_ID,
    dataId: DATA_ID,
    secret: SECRET,
  });
  assert.deepEqual(result, { ok: true });
});

test("assinatura válida sem x-request-id é aceita", () => {
  const v1 = hmac("id:999999999;ts:1704908010;");
  const result = verifyWebhookSignature({
    xSignature: `ts=${TS},v1=${v1}`,
    xRequestId: null,
    dataId: DATA_ID,
    secret: SECRET,
  });
  assert.deepEqual(result, { ok: true });
});

test("assinatura ausente é rejeitada", () => {
  const result = verifyWebhookSignature({
    xSignature: null,
    xRequestId: REQUEST_ID,
    dataId: DATA_ID,
    secret: SECRET,
  });
  assert.deepEqual(result, { ok: false, reason: "missing_signature" });
});

test("assinatura inválida (segredo errado) é rejeitada", () => {
  const result = verifyWebhookSignature({
    xSignature: `ts=${TS},v1=${V1}`,
    xRequestId: REQUEST_ID,
    dataId: DATA_ID,
    secret: "outro-segredo",
  });
  assert.deepEqual(result, { ok: false, reason: "signature_mismatch" });
});

test("assinatura adulterada (data.id trocado) é rejeitada", () => {
  const result = verifyWebhookSignature({
    xSignature: `ts=${TS},v1=${V1}`,
    xRequestId: REQUEST_ID,
    dataId: "888888888",
    secret: SECRET,
  });
  assert.deepEqual(result, { ok: false, reason: "signature_mismatch" });
});

test("header malformado (sem ts nem v1) é rejeitado", () => {
  const result = verifyWebhookSignature({
    xSignature: "nao-e-uma-assinatura",
    xRequestId: REQUEST_ID,
    dataId: DATA_ID,
    secret: SECRET,
  });
  assert.deepEqual(result, { ok: false, reason: "malformed_signature" });
});

test("header sem timestamp é rejeitado", () => {
  const result = verifyWebhookSignature({
    xSignature: `v1=${V1}`,
    xRequestId: REQUEST_ID,
    dataId: DATA_ID,
    secret: SECRET,
  });
  assert.deepEqual(result, { ok: false, reason: "missing_timestamp" });
});

test("header sem hash (v1) é rejeitado", () => {
  const result = verifyWebhookSignature({
    xSignature: `ts=${TS}`,
    xRequestId: REQUEST_ID,
    dataId: DATA_ID,
    secret: SECRET,
  });
  assert.deepEqual(result, { ok: false, reason: "missing_hash" });
});

test("segredo não configurado é rejeitado (fail-closed)", () => {
  const result = verifyWebhookSignature({
    xSignature: `ts=${TS},v1=${V1}`,
    xRequestId: REQUEST_ID,
    dataId: DATA_ID,
    secret: "",
  });
  assert.deepEqual(result, { ok: false, reason: "missing_secret" });
});

test("notificação repetida é determinística e aceita em toda entrega", () => {
  const inputs = {
    xSignature: `ts=${TS},v1=${V1}`,
    xRequestId: REQUEST_ID,
    dataId: DATA_ID,
    secret: SECRET,
  };
  for (let i = 0; i < 5; i += 1) {
    assert.deepEqual(verifyWebhookSignature(inputs), { ok: true });
  }
});

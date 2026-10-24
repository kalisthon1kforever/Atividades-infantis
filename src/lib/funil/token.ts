import { createHmac, timingSafeEqual } from "crypto";
import type { PilarId } from "./modelo";

export type GiftPayload = { email: string; pillar: PilarId; age: string };

function secret() {
  return (
    process.env.FUNIL_TOKEN_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    "pp-funil-local"
  );
}

function mac(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function signGift(payload: GiftPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(body)}`;
}

export function openGift(token: string): GiftPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, mac(body))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as GiftPayload;
    if (!parsed.email?.includes("@") || !parsed.pillar) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function signSair(email: string): string {
  const clean = email.trim().toLowerCase();
  const body = Buffer.from(clean).toString("base64url");
  return `${body}.${mac(`sair:${clean}`)}`;
}

export function openSair(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  try {
    const email = Buffer.from(body, "base64url").toString("utf8").trim().toLowerCase();
    if (!email.includes("@") || !safeEqual(signature, mac(`sair:${email}`))) return null;
    return email;
  } catch {
    return null;
  }
}

import { NextResponse } from "next/server";
import { isBump, orderTotal, pricedOrder, type CheckoutProduct, type PayMethod } from "@/lib/checkout-catalog";
import { createPreference, mercadoPagoReady, sealOrder } from "@/lib/mercadopago";

function publicSite() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!site.startsWith("https://")) return null;
  return site;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Pedido inválido." }, { status: 400 });
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const name = String(body.name || "").trim().slice(0, 80);
  const product: CheckoutProduct = body.product === "acesso-total" ? "acesso-total" : "kit-inicial";
  const method: PayMethod = body.method === "pix" || body.method === "boleto" ? body.method : "card";
  const combo = body.combo === true;
  const bumps = combo
    ? []
    : (Array.isArray(body.bumps) ? body.bumps : []).map((item) => String(item)).filter(isBump);

  if (!email.includes("@") || !name) {
    return NextResponse.json(
      { ok: false, message: "Preencha nome e e-mail para seguir ao pagamento." },
      { status: 400 }
    );
  }

  if (!mercadoPagoReady()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "O checkout ainda não tem o Access Token de produção do Mercado Pago. Cole em MERCADOPAGO_ACCESS_TOKEN no .env e reinicie o servidor.",
      },
      { status: 503 }
    );
  }

  const ultimaHora = product === "kit-inicial" && body.ultimaHora === true;
  const order = {
    email,
    name,
    product,
    bumps: combo ? [] : bumps,
    combo,
    ...(ultimaHora ? { ultimaHora: true as const } : {}),
  };
  const lines = pricedOrder(product, order.bumps, combo, ultimaHora);
  const reference = sealOrder(order);
  if (reference.length > 256) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível montar o pedido. Use um e-mail mais curto." },
      { status: 400 }
    );
  }

  try {
    const initPoint = await createPreference({
      lines,
      order,
      method,
      site: publicSite(),
    });
    return NextResponse.json({ ok: true, initPoint, total: orderTotal(lines) });
  } catch {
    return NextResponse.json(
      { ok: false, message: "O Mercado Pago não abriu o pagamento. Tente de novo em instantes." },
      { status: 502 }
    );
  }
}

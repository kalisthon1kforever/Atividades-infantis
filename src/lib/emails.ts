import { ACESSO_TOTAL_ITEMS } from "@/app/qz/funil-data";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapEmail(inner: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#fefaf2;font-family:Nunito,Segoe UI,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fefaf2;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #fbe8cc;">
          ${inner}
          <tr>
            <td style="padding:16px 28px 28px;color:#55688f;font-size:12px;line-height:1.5;">
              Com carinho,<br/><strong style="color:#14306b;">Família Pequenos Passos</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function checks(items: string[]) {
  return items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;font-size:15px;color:#14306b;font-weight:700;">✅ ${item}</td></tr>`
    )
    .join("");
}

export function sampleEmailHtml(opts: { name: string; sampleUrl: string; offerUrl: string }) {
  const name = esc(opts.name);
  const hello = name ? `${name}, que alegria ter você aqui!` : "Que alegria ter você aqui!";
  const sampleUrl = esc(opts.sampleUrl);
  const offerUrl = esc(opts.offerUrl);
  return wrapEmail(`
    <tr>
      <td style="background:linear-gradient(135deg,#fff3c4,#d8f3e6);padding:28px 28px 20px;text-align:center;">
        <div style="font-size:32px;">💛✨🎈</div>
        <h1 style="margin:8px 0 0;font-family:'Baloo 2',Nunito,sans-serif;color:#14306b;font-size:26px;line-height:1.2;">
          Sua amostra chegou — e a gente está vibrando com você!
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px 8px;color:#14306b;font-size:16px;line-height:1.6;font-weight:700;">
        ${hello}<br/><br/>
        Que bom que você deu esse passo. Cada família que escolhe sentar um pouquinho e aprender junto enche o nosso coração de ânimo.<br/><br/>
        Aqui está a sua <strong>demonstração gratuita</strong>: 10 atividades para imprimir e viver hoje, de mão dada com o seu pequeno. Que vocês aproveitem muito cada minuto — a risada, a descoberta, o “olha, eu consegui!”.<br/><br/>
        Desejamos, de verdade, que esse tempinho vire o momento mais gostoso do dia de vocês.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 28px 20px;">
        <a href="${sampleUrl}" style="display:inline-block;background:#0d9f6e;color:#fff;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:999px;">
          Abrir e aproveitar com meu pequeno
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 6px;color:#14306b;font-size:16px;line-height:1.5;font-weight:800;">
        Se o coração pedir mais, o Acesso Total fica por R$ 19,90
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 8px;color:#55688f;font-size:14px;font-weight:700;">
        De R$ 97,00 por R$ 19,90 (79% off) — tudo incluso:
      </td>
    </tr>
    <tr>
      <td style="padding:4px 28px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${checks(ACESSO_TOTAL_ITEMS)}</table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 28px 12px;">
        <a href="${offerUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:999px;">
          Quero o Acesso Total por R$ 19,90
        </a>
      </td>
    </tr>
  `);
}

export function paidEmailHtml(opts: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
  productLabel: string;
}) {
  const hello = esc(opts.name || "família");
  const email = esc(opts.email);
  const password = esc(opts.password);
  const loginUrl = esc(opts.loginUrl);
  const productLabel = esc(opts.productLabel);
  return wrapEmail(`
    <tr>
      <td style="background:linear-gradient(135deg,#ffe27a,#ffd1e0 40%,#c7f0d8);padding:32px 28px 22px;text-align:center;">
        <div style="font-size:36px;">🎉🎊🥳🎈</div>
        <h1 style="margin:10px 0 0;font-family:'Baloo 2',Nunito,sans-serif;color:#14306b;font-size:28px;line-height:1.15;">
          Parabéns, ${hello}!
        </h1>
        <p style="margin:10px 0 0;color:#14306b;font-size:16px;font-weight:800;line-height:1.45;">
          Você acaba de adquirir e garantir que seu filho aprenda junto com você.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px 8px;color:#14306b;font-size:16px;line-height:1.6;font-weight:700;">
        Que festa boa! O ${productLabel} já é de vocês.<br/><br/>
        Desejamos, com o coração quente, que vocês aproveitem muito cada momento com o seu pequeno: o colo, a risada, o “vamos de novo?”. Que cada atividade seja leve, cheia de ânimo e daqueles minutinhos em que o dia para só para vocês dois.
      </td>
    </tr>
    <tr>
      <td style="padding:12px 28px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8eb;border:1px solid #fbe8cc;border-radius:18px;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0 0 8px;color:#057a55;font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;">
                Seus dados de acesso do app
              </p>
              <p style="margin:0 0 6px;color:#14306b;font-size:15px;font-weight:800;">
                E-mail: ${email}
              </p>
              <p style="margin:0 0 10px;color:#14306b;font-size:15px;font-weight:800;">
                Senha temporária: ${password}
              </p>
              <p style="margin:0;color:#55688f;font-size:13px;font-weight:700;line-height:1.45;">
                Esta senha é temporária e você pode (e deve) alterar no primeiro acesso, para ficar só de vocês.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 28px 18px;">
        <a href="${loginUrl}" style="display:inline-block;background:#0d9f6e;color:#fff;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:999px;">
          Entrar no app agora
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 8px;color:#14306b;font-size:15px;font-weight:800;">
        Tudo incluso para vocês:
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 8px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${checks(ACESSO_TOTAL_ITEMS)}</table>
      </td>
    </tr>
  `);
}

const SENDER_NAME = "Pequenos Passos";
const DEFAULT_REPLY_TO = "atividadesinfantis84@gmail.com";

async function sendViaGmail(opts: { to: string; subject: string; html: string }, user: string, pass: string) {
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  try {
    await transport.sendMail({
      from: `${SENDER_NAME} <${user}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { sent: true as const };
  } catch (err) {
    console.error("[email] falha Gmail", err instanceof Error ? err.message : err);
    return { sent: false, reason: "provider" as const };
  }
}

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (gmailUser && gmailPass) {
    return sendViaGmail(opts, gmailUser, gmailPass);
  }

  const key = process.env.RESEND_API_KEY;
  const testFrom = `${SENDER_NAME} <onboarding@resend.dev>`;
  const from = process.env.QUIZ_FROM_EMAIL || testFrom;
  const replyTo = process.env.QUIZ_REPLY_TO?.trim() || DEFAULT_REPLY_TO;
  if (!key) {
    console.info("[email] RESEND_API_KEY ausente — e-mail não enviado para", opts.to, opts.subject);
    return { sent: false, reason: "missing_key" as const };
  }

  async function post(sender: string) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        reply_to: replyTo,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    return { ok: res.ok, status: res.status, text: res.ok ? "" : await res.text() };
  }

  let result = await post(from);
  if (!result.ok && from !== testFrom && /domain is not verified|not verified/i.test(result.text)) {
    console.warn("[email] dominio ainda nao verificado no Resend; tentando o remetente de teste");
    result = await post(testFrom);
  }
  if (!result.ok) {
    console.error("[email] falha Resend", result.status, result.text);
    const restricted = /only send testing emails|verify a domain|not verified/i.test(result.text);
    return { sent: false, reason: restricted ? ("restricted" as const) : ("provider" as const) };
  }
  return { sent: true as const };
}

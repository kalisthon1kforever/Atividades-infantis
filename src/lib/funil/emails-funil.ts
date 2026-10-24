import { CONTOS_BRINDE } from "./contos";
import { AVISO_COMPLEMENTAR, pilarDe, type PilarId } from "./modelo";
import { signSair } from "./token";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(inner: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#fefaf2;font-family:Nunito,Segoe UI,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fefaf2;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:24px;border:1px solid #fbe8cc;">
${inner}
<tr><td style="padding:8px 28px 28px;color:#55688f;font-size:12px;line-height:1.5;">${esc(AVISO_COMPLEMENTAR)}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function sairLink(origin: string, email: string) {
  const href = `${origin.replace(/\/$/, "")}/api/funil/sair?t=${encodeURIComponent(signSair(email))}`;
  return `<p style="margin:16px 0 0;color:#55688f;font-size:12px;">Para parar estes e-mails, <a href="${esc(href)}">cancele aqui</a>.</p>`;
}

const EXEMPLOS_EMAIL: Array<[arquivo: string, titulo: string]> = [
  ["pareamento.jpg", "Pareamento Visual"],
  ["alfabetizacao.jpg", "Alfabetização em Casa"],
  ["cores.jpg", "Cores"],
  ["formas.jpg", "Formas Geométricas"],
  ["cartoes.jpg", "Cartões do Dia a Dia"],
  ["monetario.jpg", "Sistema Monetário"],
  ["colorir.jpg", "Desenhos de Colorir"],
];

export function brindeEmailHtml(opts: {
  pdfUrl: string;
  offerUrl: string;
  email: string;
  origin: string;
  name?: string;
}) {
  const base = opts.origin.replace(/\/$/, "");
  const nome = opts.name?.trim();
  const oi = nome ? `Oi, ${esc(nome)}! 💛` : "Oi! 💛";
  const botao = (href: string, rotulo: string, fundo: string) =>
    `<a href="${esc(href)}" style="display:block;background:${fundo};color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;line-height:1.35;letter-spacing:.02em;text-align:center;border-radius:999px;padding:16px 18px;">${rotulo}</a>`;
  const galeria = EXEMPLOS_EMAIL.map(
    ([arquivo, titulo]) => `
      <tr>
        <td style="padding:0 0 16px;">
          <img src="${base}/email/${arquivo}" alt="${esc(titulo)}" width="504" style="width:100%;max-width:504px;height:auto;border:0;border-radius:16px;display:block;"/>
          <p style="margin:8px 2px 0;font-size:14px;line-height:1.3;font-weight:800;color:#14523a;">${esc(titulo)}</p>
        </td>
      </tr>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#fefaf2;font-family:Nunito,Segoe UI,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fefaf2;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:24px;border:1px solid #fbe8cc;overflow:hidden;">
<tr><td style="padding:0;line-height:0;font-size:0;">
  <img src="${base}/email/header.png" alt="Pequenos Passos. Aprender brincando, um passo de cada vez." width="560" style="width:100%;max-width:560px;height:auto;display:block;border:0;"/>
</td></tr>
<tr><td style="padding:28px 28px 8px;color:#14306b;font-size:16px;line-height:1.55;">
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#14306b;">${oi}</h1>
  <p style="margin:0 0 14px;">Que bom ter você por aqui!</p>
  <p style="margin:0 0 18px;"><strong>Seus 10 contos para dormir estão prontos.</strong> É um para cada noite. Leiam juntos, com a luz baixa, e deixem a próxima história para amanhã.</p>
  ${botao(opts.pdfUrl, "ABRIR OS 10 CONTOS PARA DORMIR", "#0d9f6e")}
</td></tr>
<tr><td style="padding:18px 28px 8px;color:#14306b;font-size:16px;line-height:1.55;">
  <h2 style="margin:0 0 8px;font-size:20px;line-height:1.3;">🌙 Qual conto nesta noite</h2>
  ${CONTOS_BRINDE.map(
    (conto) =>
      `<p style="margin:0 0 8px;"><strong>${conto.n}. ${esc(conto.titulo)}</strong><br/><span style="color:#55688f;">${esc(conto.quando)}</span></p>`,
  ).join("")}
</td></tr>
<tr><td style="padding:18px 28px 8px;color:#14306b;font-size:16px;line-height:1.55;">
  <h2 style="margin:0 0 8px;font-size:20px;line-height:1.3;">🌱 Uma dica para começar</h2>
  <p style="margin:0 0 12px;">Na hora de dormir:</p>
  <p style="margin:0 0 8px;">✅ Escolha o conto pelo que a criança viveu no dia.</p>
  <p style="margin:0 0 8px;">✅ Leiam juntos, devagar.</p>
  <p style="margin:0 0 8px;">✅ Uma história basta.</p>
  <p style="margin:0;">✅ No fim, boa noite. O resto fica para a próxima noite.</p>
</td></tr>
<tr><td style="padding:18px 28px 8px;color:#14306b;font-size:16px;line-height:1.55;">
  <h2 style="margin:0 0 8px;font-size:20px;line-height:1.3;">💚 Quer continuar?</h2>
  <p style="margin:0 0 12px;">O <strong>Pequenos Passos</strong> reúne cadernos educativos organizados por temas, como Pareamento Visual, Alfabetização em Casa, Cores, Formas Geométricas, Rotina Visual e muito mais.</p>
  <p style="margin:0 0 16px;">Você encontra atividades para imprimir e recursos de apoio à aprendizagem em casa, conforme o pacote escolhido.</p>
  <p style="margin:0 0 12px;font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#0d9f6e;">Alguns cadernos da coleção</p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${galeria}</table>
  ${botao(opts.offerUrl, "CONHECER OS MATERIAIS DO PEQUENOS PASSOS", "#14306b")}
</td></tr>
<tr><td style="padding:22px 28px 28px;color:#14306b;font-size:16px;line-height:1.55;">
  <p style="margin:0 0 14px;">Um pequeno passo de cada vez. 💚</p>
  <p style="margin:0 0 16px;">Com carinho,<br/><strong>Equipe Pequenos Passos</strong></p>
  <p style="margin:0;color:#55688f;font-size:12px;line-height:1.5;">Material educativo complementar. Não substitui a escola nem o acompanhamento profissional.</p>
  ${sairLink(opts.origin, opts.email)}
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function boasVindasEmailHtml(opts: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
  activityTitle?: string;
  activityUrl?: string;
  pillarLabel?: string;
}) {
  const nome = esc(opts.name || "família");
  const atividade = opts.activityTitle
    ? `<p style="margin:12px 0 0;color:#14306b;font-size:16px;line-height:1.5;">A primeira atividade sugerida${opts.pillarLabel ? `, pelo pilar ${esc(opts.pillarLabel)}` : ""}: <strong>${esc(opts.activityTitle)}</strong>.</p>`
    : "";
  const botaoAtividade = opts.activityUrl
    ? `<p style="margin:12px 0 0;"><a href="${esc(opts.activityUrl)}" style="color:#0d9f6e;font-weight:800;">Abrir essa atividade</a></p>`
    : "";
  return wrap(`
    <tr><td style="padding:28px 28px 8px;">
      <h1 style="margin:0;color:#14306b;font-size:26px;">Olá, família de ${nome}</h1>
    </td></tr>
    <tr><td style="padding:12px 28px;color:#14306b;font-size:16px;line-height:1.55;">
      A compra está confirmada. A Área Família já tem login, a atividade de hoje na frente e as estrelas ligadas.
      Os PDFs do kit continuam seus: dá para imprimir em qualquer ficha.
      ${atividade}
      ${botaoAtividade}
    </td></tr>
    <tr><td style="padding:0 28px 12px;">
      <table role="presentation" width="100%" style="background:#fff8eb;border:1px solid #fbe8cc;border-radius:18px;">
        <tr><td style="padding:18px 20px;color:#14306b;font-size:15px;line-height:1.5;">
          <strong>Entrar na Área Família</strong><br/>
          E-mail: ${esc(opts.email)}<br/>
          Senha provisória: ${esc(opts.password)}<br/>
          <span style="color:#55688f;font-size:13px;">Troque a senha no primeiro acesso.</span>
        </td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:8px 28px 18px;">
      <a href="${esc(opts.loginUrl)}" style="display:inline-block;background:#0d9f6e;color:#fff;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:999px;">Abrir a Área Família</a>
    </td></tr>
  `);
}

export function sequenciaEmailHtml(opts: {
  step: 2 | 3 | 4 | 5;
  origin: string;
  email: string;
  pillar: PilarId;
  offerUrl: string;
}) {
  const pilar = pilarDe(opts.pillar);
  const sair = sairLink(opts.origin, opts.email);
  if (opts.step === 2) {
    return {
      subject: "Fez a primeira? 🌟",
      html: wrap(`
        <tr><td style="padding:28px;color:#14306b;font-size:16px;line-height:1.55;">
          <h1 style="margin:0 0 12px;font-size:24px;">Fez a primeira? 🌟</h1>
          Se a ficha nº 1 ficou para outro momento, ela continua no PDF. Sem pressa e sem cobrança.
          Um cartão já conta.
          ${sair}
        </td></tr>
      `),
    };
  }
  if (opts.step === 3) {
    return {
      subject: "O que os pais descobrem na 3ª semana",
      html: wrap(`
        <tr><td style="padding:28px;color:#14306b;font-size:16px;line-height:1.55;">
          <h1 style="margin:0 0 12px;font-size:24px;">Cinco pilares, um de cada vez</h1>
          Quem segue algumas semanas costuma parar de escolher no escuro. O kit organiza o dia em cinco pilares:
          Ler, Contar, Sentir, Organizar, Criar e acalmar. O seu ponto de partida foi <strong>${esc(pilar.nome)}</strong>.
          ${sair}
        </td></tr>
      `),
    };
  }
  if (opts.step === 4) {
    return {
      subject: "O kit completo, neste e-mail",
      html: wrap(`
        <tr><td style="padding:28px;color:#14306b;font-size:16px;line-height:1.55;">
          <h1 style="margin:0 0 12px;font-size:24px;">13 cadernos, um pagamento</h1>
          Cada caderno sairia R$ 15 avulso — seriam R$ 195. O kit completo sai por R$ 37,90, pagamento único.
          Com ele vem a Área Família: biblioteca, atividade do dia, favoritos e estrelas.
          Garantia de 7 dias. Este é o e-mail em que a apresentação do kit se fecha.
          <p style="margin:16px 0 0;"><a href="${esc(opts.offerUrl)}" style="display:inline-block;background:#0d9f6e;color:#fff;text-decoration:none;font-weight:800;padding:12px 18px;border-radius:999px;">Ver o kit completo</a></p>
          ${sair}
        </td></tr>
      `),
    };
  }
  return {
    subject: `Uma ficha de ${pilar.nome} para a semana`,
    html: wrap(`
      <tr><td style="padding:28px;color:#14306b;font-size:16px;line-height:1.55;">
        <h1 style="margin:0 0 12px;font-size:24px;">${esc(pilar.emoji)} ${esc(pilar.nome)} esta semana</h1>
        ${esc(pilar.cadernos)}. Se couber, imprima uma ficha. Se não couber, fica para a próxima.
        <p style="margin:16px 0 0;"><a href="${esc(opts.offerUrl)}" style="color:#0d9f6e;font-weight:800;">Conhecer o kit completo</a></p>
        ${sair}
      </td></tr>
    `),
  };
}

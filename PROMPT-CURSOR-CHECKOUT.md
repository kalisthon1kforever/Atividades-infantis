# PROMPT — Cursor: auditar e conectar o checkout Mercado Pago à área logada

Você está trabalhando no projeto **Ofertinha 2.0 / Pequenos Passos** (Next.js App Router + Supabase + Resend).
A área logada (`/app`) e o CRM admin (`/admin`) já estão construídos e funcionando. O checkout do Mercado Pago
(`/api/checkout`, `/api/mercadopago/webhook`, `/api/checkout/confirm`, `/qz/retorno`) também existe.
**Sua missão: (FASE 1) auditar o que foi feito e produzir um relatório de gaps; (FASE 2) executar o plano de conexão
checkout ↔ área logada abaixo, usando os nossos dados reais, sem quebrar nada que já funciona.**

Antes de escrever qualquer código, siga a ordem. Não pule a FASE 1.

---

## Contexto obrigatório (leia antes de tudo)

1. `STATUS-AREA-LOGADA.md` — o que já foi entregue, credenciais de teste, mapa de arquivos.
2. `PROMPT-AREA-LOGADA.md` — especificação original da área logada (o cabeçalho diz "já executado": use como referência, não como tarefa).
3. `supabase/README.md` e `supabase/migrations/20261020000000_area_logada.sql` — schema (tbl_entitlements, tbl_leads, tbl_fichas…), funções `app_grant_entitlement`, `app_lead_converted`, `app_can_access`, RLS.
4. Biblioteca do lado do checkout: `src/lib/checkout-catalog.ts`, `src/lib/mercadopago.ts`, `src/lib/fulfill-order.ts`, `src/lib/access-account.ts`, `src/lib/products.ts`, `src/lib/emails.ts`, `src/lib/supabase/service.ts`.
5. Rotas: `src/app/api/checkout/route.ts`, `src/app/api/mercadopago/webhook/route.ts`, `src/app/api/checkout/confirm/route.ts`, `src/app/api/quiz-lead/route.ts`, `src/app/api/quiz-purchase/route.ts`, `src/app/qz/retorno/page.tsx`.
6. Área logada: `src/middleware.ts`, `src/lib/area.ts`, `src/app/app/**`, `src/app/admin/**`, `src/app/entrar/**`.
7. Nossos dados (para copy e conteúdo): `src/data/content.ts`, `src/data/catalog-seed.ts`, `public/funil/**` (SÓ PARA LER — não altere visuais, ver regras).

---

## Regras invioláveis (aplicáveis à FASE 1 e à FASE 2)

- **NÃO altere nada em `public/funil`** (visual/HTML/CSS dos funis). Você pode ler para entender a jornada.
- Chaves de service_role NUNCA vão para o browser: toda escrita no banco passa por `src/lib/supabase/service.ts` (server-side).
- Papel `admin` vive só em `app_metadata`; nunca autogerido; admin nunca vê senhas de usuários.
- Senha temporária de acesso: gerada server-side, exibida NO MÁXIMO uma vez (preferencialmente só por e-mail). Nunca em log.
- Preços nunca vindos do cliente: validação server-side contra `checkout-catalog.ts`/`products.ts` (valor esperado vs `payment.transaction_amount` — já existe em `fulfill-order.ts`, mantenha).
- Sem loja pública, sem ranking, sem moeda/virtual coins. Upsells dentro da área logada são links discretos para a oferta já existente, não um carrinho.
- Todo texto novo em pt-BR (tom "pequenos passos, família, juntos" — veja `src/data/content.ts`).
- Visual novo segue a identidade: Baloo 2 (títulos), Nunito (texto), fundo `#fefaf2`, navy `#14306b`, verde `#0d9f6e`/`#057a55`, minta `#d8f3e6`, amarelo `#fbbf24`, coral `#fb7185`, cards brancos raio 22px, mobile-first ~480–960px. CSS novo vai no fim de `src/app/globals.css` (prefixos `ent-*`, `app-*`, `admin-*`, `sheet-*`).
- TypeScript strict; `npm run typecheck` e `npm run build` devem passar ao final de cada fase.
- Pagamento continua desligado até haver `MERCADOPAGO_ACCESS_TOKEN` real: mantenha o guard 503 de `/api/checkout` e, em dev sem token, os testes usam o caminho "simulado" (item 7 da FASE 2). Nenhum dinheiro real envolvido agora.
- **Migration nova em arquivo NOVO** (`supabase/migrations/…_checkout_orders.sql`); não edite a migration existente.

---

## FASE 1 — Auditoria (produza um relatório antes de codar)

Entregue um relatório markdown `STATUS-CHECKOUT-AUDITORIA.md` com: (a) o que existe e está correto; (b) gaps
categorizados (crítico/médio/baixo); (c) plano de execução e arquivos afetados. Verifique no mínimo:

1. O pipeline MP aprovado → `fulfillApprovedPayment` grava **entitlements** hoje? (provável que NÃO — confirme)
2. Se o comprador **já tem conta** (ex.: lead da amostra), a segunda compra renova credenciais/granta o produto novo e marca conversão?
3. Webhook e `/api/checkout/confirm` são idempotentes: replay do mesmo payment_id não duplica entitlement, e-mail nem troca de senha?
4. Como os 4 bumps e o combo mapeiam para entitlements? O selo HMAC preserva os bumps quando `combo=true`? A ordem guardada basta para revalidar o valor?
5. `/api/checkout/confirm` é GET sem assinatura além do payment_id do MP — IDs de pagamento são previsíveis/sequenciais; alguém pode consultar o confirm de outro comprador?
6. A senha temporária é devolvida no JSON do confirm/retorno? O e-mail entregue aponta `loginUrl` para `/entrar` ou para `/qz`?
7. Catálogo/preços duplicados entre `checkout-catalog.ts` e `products.ts`? Coerentes com a migration SQL e a página `/oferta`?
8. O `/admin` enxerga compras/entitlements vindos do checkout (fonte `checkout-mp:*`)? Hoje só existe o caso do stub `quiz-checkout`?
9. Emails Resend com falha de envio: existe retry/fila ou falha silenciosa?

---

## FASE 2 — Execução: ligar o checkout à área logada

Implemente os itens abaixo, na ordem, commitando em blocos pequenos com mensagens em pt-BR.

### 1. Gravar entitlements no pagamento aprovado (GAP CRÍTICO)

Hoje `fulfillApprovedPayment` (src/lib/fulfill-order.ts) cria/renova o usuário e envia e-mail, **mas não concede acesso**: quem paga pelo Mercado Pago entra no app só com a amostra. Corrija:

- Chame `serviceRpc('app_grant_entitlement', { p_email, p_product, p_source })` para:
  - o `product` comprado (`kit-inicial` ou `acesso-total`) com `p_source: 'checkout-mp:<payment_id>'`;
  - **cada bump** comprado (`rotina-visual`, `guia-30-dias`, `mini-kit-5-min`, `cartoes-vocabulario`) com a mesma fonte;
  - se `combo=true`: conceda também `combo` (que destrava os 4 bumps; veja `app_can_access` no SQL e `covers()` em `src/lib/products.ts`).
- Chame `serviceRpc('app_lead_converted', { p_email, p_product })`; confirme no SQL que a RPC tolera e-mail sem lead.
- Idempotente: a mesma fonte (mesmo payment_id) não re-grava entitlement nem reenvia e-mail.

### 2. Entrega de acesso unificada (e-mail + loginUrl)

Unifique `fulfill-order.ts` e `quiz-purchase/route.ts` num único helper (ex.: `src/lib/access-delivery.ts`) que cria/renova a conta, concede produto(s) e envia `paidEmailHtml` via Resend. O `loginUrl` deve ser `${origin}/entrar` — hoje o fulfill manda para `/qz` (errado). Origem: `NEXT_PUBLIC_SITE_URL` com fallback para o request. Nunca mandar para `/qz` no pós-compra.

### 3. Fonte única de catálogo

Mantenha os preços/títulos como estão hoje (37,90 / 19,90 / 9,90 / 7,90 / 4,90 / 13,90 / combo 29,90) e garanta **uma única tabela de preços e títulos** usada por `checkout-catalog.ts` (checkout/funil) e `products.ts` (área logada) — 1 arquivo central + adaptadores. `covers()` de `products.ts` continua espelhando `app_can_access` (amostra para qualquer logado; kit-inicial ⊂ acesso-total; professores só acesso-total; bumps destravados por bump OU combo OU acesso-total).

### 4. Segurança do confirm

- `/api/checkout/confirm` hoje aceita GET com o payment_id cru. Adicione **assinatura**: nas `back_urls`/`auto_return` do Mercado Pago inclua `k=<hmac(payment_id)>` (HMAC com o token MP ou uma chave própria no `.env`); sem assinatura válida, o confirm responde status sem entregar senha.
- O JSON do confirm NÃO deve devolver a senha para o navegador: senha vai só por e-mail. `/qz/retorno` mostra "Acesso liberado! Sua senha foi enviada por e-mail" + botão "Entrar agora" → `/entrar`.
- Em `already` (conta existente): resposta "você já tem acesso" + link `/entrar`, sem senha nova na tela.

### 5. Idempotência e replay (webhook)

- Webhook e confirm chegam em paralelo: proteja com `paid_ids` no `app_metadata` (padrão já existe em `ensureAppAccess`, `access-account.ts`) — estenda para bumps/combo e garanta que o e-mail de entrega saia **uma única vez por payment_id**.
- Teste com token `TEST-` (confirm com payment_id de sandbox) e documente em `supabase/README.md`/STATUS como simular aprovação.

### 6. Rastreabilidade de compras — migration nova (recomendada)

Crie `supabase/migrations/20261021000000_checkout_orders.sql` com tabela de pedidos (nome no padrão da migration atual):

```
id uuid pk, payment_id text unique, email text, nome text, produtos jsonb, total numeric,
status text default 'approved', origem text ('mercado-pago' | 'simulado' | 'admin'),
created_at timestamptz, updated_at timestamptz, admin_notes text
```

Acesso: só service_role (RLS enable + nenhuma policy para anon/authenticated; admin lê via função SECURITY DEFINER, ex. `app_list_orders()`). `fulfillApprovedPayment` faz `upsert` da ordem (payment_id unique = replay seguro). Se couber no layout existente de `src/app/admin`, adicione a aba **"Compras"** no CRM: data, e-mail, produtos, total, origem.

### 7. Admin CRM — botão "Simular compra completa"

Hoje o `/admin` vê usuários do Auth mas não testa o pipeline de compra. Adicione no CRM (página do lead/ficha) o botão **"Simular compra completa"**: server action `simulatePurchase` que roda o MESMO pipeline do `fulfillApprovedPayment` (conta, entitlements do produto + bumps/combo escolhidos, e-mail Resend, lead convertido), com `p_source: 'simulado-admin:<timestamp>'` e ordem com `origem: 'simulado'`. É o caminho de teste sem Mercado Pago. O grant manual do admin continua com `p_source: 'admin'` — não sobrescreva.

### 8. Upsell dentro da área logada (usando nossos dados)

Nos cards de `biblioteca` e da trilha:

- Card bloqueado exibe o motivo ("com o Kit Inicial você destrava…" com nome/preço reais de `checkout-catalog.ts`) + CTA discreto "Quero já" linkando para a oferta existente (a página que o lead já conhece), com `?src=app` para rastreio — link normal, nada de iframe e NADA alterando `public/funil`.
- Trilha 30 dias: CTA mostra "Guia de 30 Dias" com o valor real (7,90) — link para a oferta.
- Copy alinhada com os textos do funil (`public/funil/…`): mesmo tom, mesmos títulos, mesmas promessas.

### 9. /qz/retorno corrigido

- Continua chamando `/api/checkout/confirm?payment_id=…`; com OK mostra "Acesso liberado! Sua senha foi enviada por e-mail" + botão "Entrar agora" → `/entrar` (sem senha na tela).
- Se `already`: "Você já tem acesso" + botão `/entrar`.
- Se `pending`/`refused`/`refunded`: mensagens claras (pagamento pendente / recusado / reembolsado) + link de suporte (procure contato em `src/lib/emails.ts` ou no funil).

---

## Checklist de aceite (rodar antes de dizer "pronto")

- [ ] `npm run typecheck` e `npm run build` passam (rotas novas contadas).
- [ ] RLS: anon e authenticated não leem ordens; admin via SECURITY DEFINER; service_role tudo.
- [ ] Pipeline simulado (ou token TEST-): compra aprovada → conta criada com `app_metadata {role:'familia', must_change_password:true, paid_ids:[id]}` + entitlements com source `checkout-mp:<id>` + e-mail Resend com `loginUrl=/entrar` + lead convertido + ordem gravada.
- [ ] Replay do webhook 2x para o mesmo payment_id: **uma** senha entregue, um entitlement, um e-mail.
- [ ] Comprador com conta existente (lead da amostra): recebe nova senha + entitlement + conversão, sem erro 500.
- [ ] Combo: concede `combo` + desbloqueia todos os bumps; `/app/trilha-30-dias` destrava com guia-30-dias.
- [ ] `/admin` mostra leads + compras; botão "Simular compra" cria tudo com source `simulado-admin:*`.
- [ ] `/qz/retorno` sem senha em texto, com fluxos "já tem acesso" e "pendente/recusado".
- [ ] `public/funil` intocado (confira em git status/diff, se houver repo).
- [ ] Atualizar `STATUS-AREA-LOGADA.md` (seção "Conexão com checkout") + seu `STATUS-CHECKOUT-AUDITORIA.md` com gaps e decisões.

---

## Ambiente e credenciais de teste

- `.env` já tem `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. `MERCADOPAGO_ACCESS_TOKEN` pode não existir — use o caminho simulado.
- A migration SQL precisa estar aplicada no Supabase Dashboard (passos em `supabase/README.md`) — se `tbl_entitlements` não existir, pare e registre isso no relatório.
- Usuários demo (já existem): `familia-demo@pequenospassos.app` / `PpDemoFamilia24` (força troca de senha no 1º login) e `admin-demo@pequenospassos.app` / `PpDemoAdmin24` (role admin).
- Dev: `npm run dev` (porta 3000). PowerShell 5.1: evite ternários e travessões em scripts `.ps1`.

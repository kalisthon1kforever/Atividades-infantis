# Auditoria — checkout Mercado Pago × área logada

Data: 20/10/2026. Leitura do código antes de alterar a FASE 2.
A migration `20261020000000_area_logada.sql` ainda precisa ser colada no SQL Editor (ver `supabase/README.md`). Sem ela, `tbl` não existe: as funções são `public.entitlements`, `public.leads`, `app_grant_entitlement` e `app_lead_converted`.

## (a) O que já está certo

- Preferência do Mercado Pago em `POST /api/checkout`: preços só no servidor (`checkout-catalog.ts`), guard 503 se não houver token `APP_USR-` ou `TEST-`.
- Pedido vai assinado em `external_reference` (HMAC do Access Token). `fulfillApprovedPayment` recusa referência inválida e recusa valor diferente de `transaction_amount`.
- `ensureAppAccess` não gira senha de novo quando `app_metadata.paid_ids` já contém o `payment_id`.
- `app_grant_entitlement` faz `on conflict (user_id, product) do nothing`. `app_lead_converted` só dá `update` em `leads`: e-mail sem lead não gera erro.
- `app_can_access`: amostra para qualquer logado; kit-inicial cabe em acesso-total; professores só no acesso-total; bump cabe no próprio bump, no combo ou no acesso-total.
- `quiz-purchase` já grava entitlement com fonte `quiz-checkout` e manda `loginUrl` para `/entrar`. O checkout Mercado Pago não usa esse caminho.
- Webhook busca o pagamento na API do Mercado Pago antes de cumprir. A resposta do webhook não devolve senha.
- Área `/app` e CRM `/admin` existem (biblioteca, trilha, ficha, grant manual com fonte `admin`).

## (b) Gaps

### Crítico

1. **Quem paga não ganha o produto.** `fulfillApprovedPayment` cria/renova a conta e envia e-mail, mas não chama `app_grant_entitlement` nem `app_lead_converted`. A pessoa entra só com a amostra.
2. **Senha volta no JSON.** `GET /api/checkout/confirm?payment_id=` cumpre o pagamento e devolve `password`. `/qz/retorno` mostra essa senha na tela (`AcessoLiberado`). O id do Mercado Pago é sequencial: quem adivinhar o id lê a senha de outro comprador e ainda dispara a entrega.
3. **E-mail do checkout aponta para `/qz`**, não para `/entrar`.

### Médio

4. **Replay incompleto.** A trava `paid_ids` evita a segunda senha, mas o `return` de `already` acontece antes de qualquer grant. Se o primeiro pedido gravou `paid_ids` e falhou no meio, o replay não concede o produto. Webhook e confirm em paralelo podem os dois passar da checagem antes de gravar `paid_ids`.
5. **Combo.** O HMAC guarda `combo: true` e zera `bumps` (o valor revalida: produto + R$ 29,90). Nada disso vira entitlement `combo`.
6. **Conta que já existe** (lead da amostra): a segunda compra troca a senha, mas não marca `must_change_password`, não concede o produto novo e não converte o lead. O `findUser` por `filter=` do GoTrue é frágil; o SQL já tem `app_find_user_id`.
7. **Dois catálogos.** `checkout-catalog.ts` (número) e `products.ts` (texto "R$ 37,90") repetem os mesmos preços. Batem entre si e com o funil (37,90 / 19,90 / 9,90 / 7,90 / 4,90 / 13,90 / combo 29,90). A página `/oferta` não lista esses valores (é outra oferta, "Kit Completo").
8. **CRM não vê compra do Mercado Pago.** Não há tabela de pedidos. O admin só vê entitlements soltos; a fonte esperada `checkout-mp:<id>` não é gravada. Não há botão de simular a compra inteira.
9. **`quiz-purchase` é público** e concede kit sem pagamento, devolvendo senha no JSON.

### Baixo

10. **Resend sem fila.** `sendEmail` tenta uma vez e devolve `sent: false`. Não há retry. O admin já tem "reenviar acesso".
11. **Upsell** da biblioteca e da trilha manda para `/qz` com o texto "Ver no funil", sem `?src=app` e sem a frase do produto.
12. **`must_change_password`** não é ligado na conta criada pelo checkout (o funil da área logada liga; o `ensureAppAccess` do Mercado Pago não).
13. **Retorno local.** `back_urls` só entram com `NEXT_PUBLIC_SITE_URL` em `https`. Em localhost o Mercado Pago cobra e não volta sozinho.
14. **`covers("combo")`** devolve falso mesmo para quem já comprou o combo (o acesso-total passa pelo atalho do início da função). O card de combo continua na biblioteca.

## (c) Plano da FASE 2 e arquivos

1. `src/lib/catalog-prices.ts` — preços e títulos únicos. `checkout-catalog.ts` e `products.ts` passam a ler daqui.
2. `src/lib/access-delivery.ts` — conta, entitlements, lead, pedido, um e-mail com `loginUrl=/entrar`.
3. `src/lib/fulfill-order.ts` e `src/lib/access-account.ts` — usam a entrega; `paid_ids` + `must_change_password`.
4. `src/lib/mercadopago.ts` — `back_urls` com `k` = HMAC do pedido. Confirm sem `k` válido não entrega nada.
5. `src/app/api/checkout/confirm/route.ts` e `src/app/qz/retorno/page.tsx` — sem senha na tela.
6. `src/app/api/quiz-purchase/route.ts` — deixa de conceder acesso anônimo.
7. `supabase/migrations/20261021000000_checkout_orders.sql` — pedidos + `app_list_orders()`. Não editar a migration antiga.
8. `src/app/admin/compras/page.tsx`, `src/app/admin/actions.ts`, ficha da pessoa — aba Compras e "Simular compra completa".
9. Biblioteca e trilha — "Quero já" para `/oferta?src=app`.
10. `supabase/README.md`, este arquivo e `STATUS-AREA-LOGADA.md`.

`public/funil` não entra no diff.

## Decisões da FASE 2

- A assinatura do retorno é `k` = HMAC do `external_reference` (conhecido na hora da preferência). O `payment_id` ainda não existe nesse momento, então HMAC do id não dava para colocar na `back_url`. Sem `k` válido, o confirm devolve só o status e não entrega acesso nem senha.
- O JSON de confirm e a tela `/qz/retorno` não incluem senha. O texto aprovado é “Acesso liberado! Sua senha foi enviada por e-mail”, com botão para `/entrar`.
- Pedido repetido: `checkout_orders.payment_id` é único. Conflito trata como replay, não manda outro e-mail, e ainda tenta o grant (o SQL ignora produto que já existe).
- Não há e-mail de suporte no projeto. O retorno pede para olhar o e-mail da compra, sem inventar um endereço.
- A migration nova ainda precisa ser colada no SQL Editor, depois da área logada. Sem as duas, a simulação cria a conta no Auth mas não grava pedido nem entitlement.

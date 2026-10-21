# Supabase — Pequenos Passos / Ofertinha 2.0

## Como aplicar o schema da área logada (uma única vez)

O projeto está hospedado no Supabase (não tem CLI configurado nem acesso psql),
então o migration precisa ser aplicado pelo painel — leva menos de 2 minutos:

1. Abra https://supabase.com/dashboard → projeto `wkgxhfmcymmekankmgvj`
2. Menu **SQL Editor** → **New query**
3. Copie **todo** o conteúdo de `supabase/migrations/20261020000000_area_logada.sql`
   e cole no editor
4. **Run** (Ctrl+Enter). Levanta os avisos de rotina padrão — tudo bem, o script
   é idempotente (pode rodar de novo sem duplicar)

### O que o script cria

- `activities` — catálogo com busca `tsvector` em **portugues** (coluna gerada `search`),
  `data JSONB` para o padrão da ficha, `is_published` para publicar/ocultar
- `entitlements` — o que cada pessoa comprou (`kit-inicial`, `acesso-total`,
  `rotina-visual`, `guia-30-dias`, `mini-kit-5-min`, `cartoes-vocabulario`, `combo`, `amostra`)
- `profiles` — nome + último acesso (alimenta "ativos nos últimos 7 dias")
- `children`, `activity_progress` (estrelas), `favorites`, `trail_days` (trilha de 30 dias)
- `leads` — capturas do funil (`POST /api/quiz-lead` grava aqui, idempotente por `email_lower`)
- `admin_notes` — comentários internos do CRM
- Funções `security definer`: `app_can_access` (o coração do gating por produto),
  `app_is_admin`, `app_grant_entitlement`, `app_revoke_entitlement`, `app_find_user_id`,
  `app_set_must_change`, `app_lead_converted`, `app_touch`
- **RLS em todas as tabelas**: família só lê/escreve as próprias linhas;
  leads/admin_notes sem política para o usuário comum; gravações de entitlement
  apenas via `service_role` (ninguém se promove)

### Verificação rápida (SQL Editor)

```sql
select count(*) as fichas from public.activities;        -- esperado: 29
select count(*) from public.activities where product_key = 'amostra';  -- esperado: 10
```

### Como liberar/revogar um produto rápido (SQL alternativo)

```sql
select public.app_grant_entitlement('email@pessoa.com', 'kit-inicial', 'admin');
select public.app_revoke_entitlement('email@pessoa.com', 'kit-inicial');
```

Mas o caminho normal é pelo CRM: **/admin → Pessoas → abrir ficha → Produtos**.

## Pedidos do checkout (depois da área logada)

1. No mesmo SQL Editor, cole `supabase/migrations/20261021000000_checkout_orders.sql` e dê Run.
2. A tabela `checkout_orders` nasce com RLS ligado e sem política para visitante.
3. Para testar sem cobrar: entre como admin, abra a ficha da pessoa e use **Simular compra completa**.
   O botão grava o pedido com origem `simulado`, libera os produtos e manda a senha só por e-mail.
4. O mesmo `payment_id` não gera segundo e-mail. Cada clique em simular usa um id novo.
5. Token `TEST-` do Mercado Pago também serve para uma preferência de teste. Em localhost o retorno
   automático não dispara, porque `back_urls` só entram com `NEXT_PUBLIC_SITE_URL` em `https://`.

## Regras de conduta do projeto (não esquecer)

- Papel admin mora em `app_metadata.role` — **nunca** `user_metadata`;
  ninguém se promove: só o server (service_role ou SQL) toca `app_metadata`
- Admin **nunca** vê senha — reenviar e-mail gera senha temporária nova (começa com `Pp`)
  e marca `must_change_password = true`
- Pagamento aprovado grava entitlement com fonte `checkout-mp:<id>`.
  `POST /api/quiz-purchase` não libera mais produto sem pagamento.
  A simulação do admin usa fonte `simulado-admin:<timestamp>` e origem `simulado`.
- O visual do funil em `public/funil` NÃO se altera

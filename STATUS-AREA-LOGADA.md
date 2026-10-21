# Área logada — status da entrega

Executado conforme `PROMPT-AREA-LOGADA.md` (build aqui no OpenCode). Data: 20/10/2026.

## A rodar pelo dono do projeto (2 min, única pendência ATIVA)

**Aplicar o SQL no Supabase** — instruções completas em `supabase/README.md`
(Dashboard → SQL Editor → colar `supabase/migrations/20261020000000_area_logada.sql` → Run).

Enquanto o SQL não roda, o app funciona no modo degradação bem-humorada:
- login, sessão, troca de senha, trilha bloqueada, tudo roda (Auth não depende de tabela)
- a biblioteca cai no fallback local (as 10 fichas da amostra) e os cards bloqueados aparecem
- CRM admin lista pessoas do Auth, mas leads/compras/progresso aparecem zerados
- após rodar o SQL, tudo acende sem mudar uma linha de código

## ORDEM do prompt — o que foi feito

1. **Schema + RLS + seed** ✅ `supabase/migrations/20261020000000_area_logada.sql`
   9 tabelas, funções de gating (`app_can_access`), RLS em tudo, 29 fichas de seed
   (10 da amostra = `amostra-data.ts`, kit por categoria no espírito de `data/content.ts`,
   4 bumps, 2 de professores). Falta só aplicar (acima).
2. **/entrar + troca obrigatória** ✅
   - `/entrar` — e-mail + senha; usa a sessão `@supabase/ssr`; cookies com nome
     `pp-auth-token`, `httpOnly`, sameSite lax
   - `/entrar/nova-senha` — troca obrigatória lida de `app_metadata.must_change_password`;
     troca feita com verificação de senha atual via endpoint server-side (`verifyPassword`)
     e app_metadata limpo por service_role (usuário jamais promove a si)
   - `/entrar/callback` — recuperação por e-mail (PKCE e token_hash, os dois formatos)
   - `middleware.ts` — protege `/app` e `/admin`, força a troca de senha, bot papel admin fora
   - contas novas do funil já nascem com `app_metadata {role: familia, must_change_password: true}`
3. **/app — área de quem comprou** ✅
   - **Início** (`/app`): saudação com nome, estrelinhas/streak, próximo passo sugerido
     (usa a resposta q4 do quiz para escolher a categoria), tiles de navegação
   - **Biblioteca**: busca com destaque, filtros (tempo 5/10/15, idade, formato, p&b,
     público família/professor, favoritos, categoria), cards bloqueados com preço da
     tabela PRODUCTS apontando para `/qz` — nada pago vaza para quem não comprou
   - **Atividade** (`/app/atividade/[id]`): para que serve + como apresentar em uma frase,
     botão "Fizemos juntos hoje" (+1 estrela, celebração), favorito, imprimir
   - **Ficha imprimível** (`/app/atividade/[id]/imprimir`): páginas HTML no padrão visual
     do kit (20+ padrões: ache-iguais, ligar-cor, pintar-letra, contar, labirinto,
     picotado, tracejado, sílabas, wordcards, copiar, sequência, emoções, termômetro,
     rotinas, nomear-figura, estrela do dia, professor-plan…), CSS `@media print`
   - **Trilha de 30 dias**: aberta só com `guia-30-dias`/`combo`/`acesso-total`;
     mostra dia anterior fechado + hoje + "amanhã"; fechar o dia gera estrela
   - **Criança** (`/app/crianca`): nome + idade aproximada (1–10, padrão 5, até 3 crianças)
   - **Conquistas**: 9 selos (1ᵃ atividade, 5/10/20 estrelas, 3/7 dias seguidos,
     categoria completa, 10 dias de trilha, certificado) + barras por categoria +
     **certificado imprimível** (nome da criança + data + frase) e **quadro de
     conquistas imprimível**; sem ranking público, sem moeda, sem loja ✅
   - **Conta** (`/app/conta`): acessos liberados (com origem), trocar senha, sair
4. **Leads + CRM admin** ✅
   - `POST /api/quiz-lead` persiste o lead em `leads` (e-mail + nome + canal + q1..q6),
     garante `amostra` quando o e-mail já tem conta, e mantém o e-mail da amostra/webhook
     **intactos** (falhas de banco não bloqueiam a entrega)
   - `/admin` **Painel**: leads, compras, ativos 7 dias ("bate acesso" no app), fichas mais feitas
   - `/admin/funil`: todos os leads com as 6 respostas dadas (label), canal, data, conversão
   - `/admin/pessoas` + ficha: busca por e-mail/nome; liberar/revogar produto; reenviar
     e-mail de acesso (gera senha temporária nova `Pp…` + marca troca obrigatória,
     usa o template festivo de `src/lib/emails.ts`); comentários internos; progresso da pessoa
   - `/admin/catalogo`: listar/publicar/ocultar/criar/editar fichas (editor com JSON e padrões)
   - toda ação admin: papel validado em `app_metadata` no servidor (middleware + layout + action)
5. **Verificação** ✅/⏳
   - build de produção e typecheck passando; middleware testado (/, /qz, /qz/amostra
     e /oferta intactos; /app e /admin redirecionam sem sessão)
   - login testado via REST nos dois papéis; senha errada rejeitada
   - **cenario no navegador** (clique a clique) fica para o dono — passos prontos abaixo

## Credenciais de teste (usuários demo, criados no Auth do projeto)

| papel | e-mail | senha inicial | acontece |
|---|---|---|---|
| família (só amostra) | `familia-demo@pequenospassos.app` | `PpDemoFamilia24` | login força `/entrar/nova-senha`; vê apenas as 10 fichas da amostra + cards bloqueados |
| admin | `admin-demo@pequenospassos.app` | `PpDemoAdmin24` | login direto em `/admin` (troque depois em /app/conta) |

(Gerados por `POST /auth/v1/admin/users` com service_role. Pode excluir no painel
Supabase → Authentication → Users quando não precisar mais.)

## Mapa de arquivos principais (resumo)

- SQL: `supabase/migrations/20261020000000_area_logada.sql` + `supabase/README.md`
- Sessão/RLS helpers: `src/lib/supabase/{server,service}.ts`, `src/middleware.ts`
- Produtos/gating: `src/lib/products.ts` (espelha `app_can_access`); fallback catálogo:
  `src/data/catalog-seed.ts`, `src/lib/catalog.ts`, `src/lib/catalog-shared.ts`
- Dados da área: `src/lib/area.ts` (perfil, progresso, streak, conquistas, lead p/ abertura)
- Entrar: `src/app/entrar/*` (actions, callback, nova-senha)
- App: `src/app/app/*` (layout+nav, início, biblioteca, atividade+imprimir, trilha,
  criança, conquistas+certificado+quadro, conta, actions)
- Admin: `src/app/admin/*` (layout, painel, funil, pessoas+ficha, catalogo+editor, actions)
- APIs: `src/app/api/quiz-lead/route.ts`, `src/app/api/quiz-purchase/route.ts`,
  `src/lib/access-account.ts` (contas novas com role + troca pendente)
- Fichas imprimíveis: `src/components/activity-sheet.tsx`, `src/components/print-start-button.tsx`

## Conexão com checkout

Pagamento aprovado (webhook ou retorno assinado) chama `deliverPurchase`:
cria ou reaproveita a conta, grava `app_grant_entitlement` com fonte `checkout-mp:<payment_id>`
(produto + bumps, ou `combo` quando o combo foi marcado), marca o lead com `app_lead_converted`
e manda a senha só por e-mail, com link para `/entrar`.

O CRM ganhou a aba **Compras** e o botão **Simular compra completa** na ficha
(origem `simulado`, sem cobrança). Upsell da biblioteca e da trilha aponta para `/oferta?src=app`.

Ainda falta colar no SQL Editor, nesta ordem:
`20261020000000_area_logada.sql` e `20261021000000_checkout_orders.sql`.

## Falta planejado (fora do escopo de hoje, como combinado)

- domínio de e-mail verificado no Resend e `NEXT_PUBLIC_SITE_URL` público em `https://`
  para o Mercado Pago chamar o webhook e o retorno sozinho
- mais fichas para preencher categorias do kit no /admin/catálogo (estrutura pronta)

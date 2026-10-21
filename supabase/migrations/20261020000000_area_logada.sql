-- =============================================================
-- Ofertinha 2.0 / Pequenos Passos — área logada
-- Passo 1: schema + RLS + seed
-- Rodar no SQL Editor do Supabase (e depois nos deploys novos).
-- Idempotente: pode rodar de novo sem duplicar.
-- =============================================================

-- -------------------------------------------------------------
-- TABELAS
-- -------------------------------------------------------------

-- Coluna gerada só aceita expressão imutável; array_to_string não é.
create or replace function public.app_activity_search(
  p_title text,
  p_category text,
  p_tags text[],
  p_summary text
)
returns tsvector
language sql
immutable
as $$
  select
    setweight(to_tsvector('portuguese'::regconfig, coalesce(p_title, '')), 'A') ||
    setweight(to_tsvector('portuguese'::regconfig, coalesce(p_category, '')), 'B') ||
    setweight(to_tsvector('portuguese'::regconfig, array_to_string(coalesce(p_tags, '{}'::text[]), ' ')), 'B') ||
    setweight(to_tsvector('portuguese'::regconfig, coalesce(p_summary, '')), 'C')
$$;

-- Catálogo de atividades (imprimíveis/tela)
create table if not exists public.activities (
  id            text primary key,
  title         text not null,
  summary       text not null default '',
  category      text not null,
  duration_min  int  not null default 10 check (duration_min in (5, 10, 15)),
  age_min       int  not null default 3 check (age_min between 1 and 9),
  age_max       int  not null default 8 check (age_max between 1 and 10),
  format        text not null default 'imprimir' check (format in ('imprimir', 'tela', 'ambos')),
  bw            boolean not null default true,
  audience      text not null default 'familia' check (audience in ('familia', 'professor')),
  product_key   text not null default 'kit-inicial',
  tags          text[] not null default '{}',
  data          jsonb not null default '{}'::jsonb,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  search        tsvector generated always as (
     public.app_activity_search(title, category, tags, summary)
  ) stored
);
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'activities_search_idx'
  ) then
    create index activities_search_idx on public.activities using gin (search);
  end if;
end $$;
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'activities_prod_idx'
  ) then
    create index activities_prod_idx on public.activities (product_key);
  end if;
end $$;

-- O que a pessoa comprou (amostra, kit-inicial, acesso-total, bumps, combo)
create table if not exists public.entitlements (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product    text not null,
  source     text not null default 'manual',
  created_at timestamptz not null default now(),
  primary key (user_id, product)
);

-- Perfil de quem entrou (nome + último acesso para o painel)
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  last_access timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- Criança: recompensas são dela; navegação é do adulto
create table if not exists public.children (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  age        int not null default 5 check (age between 1 and 10),
  created_at timestamptz not null default now()
);

-- "Fizemos juntos hoje": a estrela do dia
create table if not exists public.activity_progress (
  user_id       uuid not null references auth.users(id) on delete cascade,
  activity_id   text not null references public.activities(id) on delete cascade,
  log_date      date not null default current_date,
  completed_at  timestamptz not null default now(),
  primary key (user_id, activity_id, log_date)
);
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'progress_date_idx'
  ) then
    create index progress_date_idx on public.activity_progress (user_id, log_date);
  end if;
end $$;

-- Favoritos da biblioteca
create table if not exists public.favorites (
  user_id     uuid not null references auth.users(id) on delete cascade,
  activity_id text not null references public.activities(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, activity_id)
);

-- Trilha de 30 dias (bump guia-30-dias ou acesso-total)
create table if not exists public.trail_days (
  user_id      uuid not null references auth.users(id) on delete cascade,
  day          int not null check (day between 1 and 30),
  completed    boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, day)
);

-- Leads do funil (persistidos quando POST /api/quiz-lead roda)
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  name            text not null default '',
  channel         text not null default 'email',
  answers         jsonb not null default '{}'::jsonb,
  sample_url      text not null default '',
  converted       boolean not null default false,
  purchased       text[] not null default '{}',
  note            text not null default '',
  email_lower     text generated always as (lower(email)) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_email_lower_key'
  ) then
    alter table public.leads
      add constraint leads_email_lower_key unique (email_lower);
  end if;
end $$;
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'leads_created_idx'
  ) then
    create index leads_created_idx on public.leads (created_at desc);
  end if;
end $$;

-- Anotações internas do admin sobre uma pessoa
create table if not exists public.admin_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  email      text not null default '',
  note       text not null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- FUNÇÕES DE APOIO (security definer = roda como dono, sempre correta)
-- -------------------------------------------------------------

create or replace function public.app_is_admin()
returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and coalesce(u.raw_app_meta_data ->> 'role', 'familia') = 'admin'
  );
$$;

-- Cobertura por produto: quem pode abrir a atividade de product_key X.
-- kit-inicial ⊂ acesso-total; professores só acesso-total; bumps ⊂ combo e acesso-total.
create or replace function public.app_can_access(p_product_key text)
returns boolean
language plpgsql stable security definer set search_path = public, auth as $$
declare
  v_uid uuid := auth.uid();
  v_products text[];
begin
  if v_uid is null then
    return false;
  end if;
  if public.app_is_admin() then
    return true;
  end if;
  select coalesce(array_agg(e.product), '{}')
    into v_products
    from public.entitlements e
    where e.user_id = v_uid;

  if p_product_key = 'amostra' then
    return true; -- a amostra fica aberta para qualquer conta logada
  end if;
  if p_product_key = 'kit-inicial' then
    return 'kit-inicial' = any(v_products) or 'acesso-total' = any(v_products);
  end if;
  if p_product_key = 'professores' then
    return 'acesso-total' = any(v_products);
  end if;
  -- bumps
  if p_product_key = any(array['rotina-visual','guia-30-dias','mini-kit-5-min','cartoes-vocabulario']) then
    return p_product_key = any(v_products)
       or 'combo' = any(v_products)
       or 'acesso-total' = any(v_products);
  end if;
  return false;
end;
$$;

-- Bate o último acesso (para "ativos nos últimos 7 dias")
create or replace function public.app_touch(p_name text default '')
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return;
  end if;
  insert into public.profiles (user_id, name, last_access)
  values (auth.uid(), coalesce(nullif(p_name, ''), ''), now())
  on conflict (user_id) do update
    set last_access = now(),
        name = case when nullif(p_name, '') is not null then p_name else public.profiles.name end;
end;
$$;

-- Procura o id de uma conta pelo e-mail (usado só no servidor, com service_role)
create or replace function public.app_find_user_id(p_email text)
returns uuid
language sql volatile security definer set search_path = public, auth as $$
  select u.id from auth.users u where lower(u.email) = lower(p_email) limit 1;
$$;

-- Garante/renova o entitlement (endpoint de checkout, admin e captura de e-mail)
create or replace function public.app_grant_entitlement(
  p_email   text,
  p_product text,
  p_source  text default 'manual'
)
returns uuid
language plpgsql security definer set search_path = public, auth as $$
declare
  v_uid uuid;
begin
  select public.app_find_user_id(p_email) into v_uid;
  if v_uid is null then
    return null;
  end if;
  insert into public.entitlements (user_id, product, source)
  values (v_uid, p_product, p_source)
  on conflict (user_id, product) do nothing;
  return v_uid;
end;
$$;

-- Remove o entitlement (revogação)
create or replace function public.app_revoke_entitlement(
  p_email   text,
  p_product text
)
returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  v_uid uuid;
begin
  select public.app_find_user_id(p_email) into v_uid;
  if v_uid is null then return; end if;
  delete from public.entitlements where user_id = v_uid and product = p_product;
end;
$$;

-- Marca/desmarca a troca obrigatória de senha (app_metadata, servidor apenas)
create or replace function public.app_set_must_change(p_email text, p_value boolean)
returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  v_uid uuid;
begin
  select public.app_find_user_id(p_email) into v_uid;
  if v_uid is null then return; end if;
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('must_change_password', p_value)
   where id = v_uid;
end;
$$;

-- Atualiza o lead quando o e-mail vira compra
create or replace function public.app_lead_converted(p_email text, p_product text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.leads
     set converted = true,
         purchased = case
                       when p_product = any(purchased) then purchased
                       else purchased || p_product
                     end,
         updated_at = now()
   where lower(email) = lower(p_email);
end;
$$;

revoke execute on function public.app_find_user_id(text) from anon, authenticated, public;
revoke execute on function public.app_grant_entitlement(text, text, text) from anon, authenticated, public;
revoke execute on function public.app_revoke_entitlement(text, text) from anon, authenticated, public;
revoke execute on function public.app_set_must_change(text, boolean) from anon, authenticated, public;
revoke execute on function public.app_lead_converted(text, text) from anon, authenticated, public;
grant execute on function public.app_find_user_id(text) to service_role;
grant execute on function public.app_grant_entitlement(text, text, text) to service_role;
grant execute on function public.app_revoke_entitlement(text, text) to service_role;
grant execute on function public.app_set_must_change(text, boolean) to service_role;
grant execute on function public.app_lead_converted(text, text) to service_role;
grant execute on function public.app_is_admin() to authenticated;
grant execute on function public.app_can_access(text) to authenticated;
grant execute on function public.app_touch(text) to authenticated;

-- -------------------------------------------------------------
-- RLS — a família só lê e escreve as próprias linhas
-- -------------------------------------------------------------

alter table public.activities       enable row level security;
alter table public.entitlements     enable row level security;
alter table public.profiles         enable row level security;
alter table public.children         enable row level security;
alter table public.activity_progress enable row level security;
alter table public.favorites        enable row level security;
alter table public.trail_days       enable row level security;
alter table public.leads            enable row level security;
alter table public.admin_notes      enable row level security;

drop policy if exists activities_select on public.activities;
create policy activities_select
  on public.activities for select to authenticated
  using (is_published and public.app_can_access(product_key));

-- entitlements: leitura própria; ninguém se promove — gravação só via service_role
drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own
  on public.entitlements for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists children_all_own on public.children;
create policy children_all_own on public.children for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists progress_all_own on public.activity_progress;
create policy progress_all_own on public.activity_progress for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists favorites_all_own on public.favorites;
create policy favorites_all_own on public.favorites for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists trail_all_own on public.trail_days;
create policy trail_all_own on public.trail_days for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- leads e admin_notes: sem política para authenticated — só o servidor (service_role) toca
drop policy if exists leads_select_admin on public.leads;
create policy leads_select_admin on public.leads for select to authenticated
  using (public.app_is_admin());
drop policy if exists leads_update_admin on public.leads;
create policy leads_update_admin on public.leads for update to authenticated
  using (public.app_is_admin()) with check (public.app_is_admin());
-- (insert/delete de leads continua exclusivo do service_role)

drop policy if exists notes_select_admin on public.admin_notes;
create policy notes_select_admin on public.admin_notes for select to authenticated
  using (public.app_is_admin());
drop policy if exists notes_insert_admin on public.admin_notes;
create policy notes_insert_admin on public.admin_notes for insert to authenticated
  with check (public.app_is_admin());

-- -------------------------------------------------------------
-- SEED — 10 da amostra + fichas do kit (+ bumps + professores)
-- Mesmos ids/títulos do catálogo usado pelo app (fallback em TS).
-- -------------------------------------------------------------
insert into public.activities (id, title, summary, category, duration_min, age_min, age_max, format, bw, audience, product_key, tags, data) values
-- ===== AMOSTRA (10 de src/app/qz/amostra-data.ts) =====
('amostra-01','Ache os iguais','Circule os dois desenhos que são iguais.','Atenção visual',5,3,5,'imprimir',true,'familia','amostra','{atencao,observacao}','{"pattern":"ache-iguais","items":["⭐","🌙","⭐","☀️"]}'),
('amostra-02','Ligue a cor','Ligue cada bolinha à palavra da cor.','Atenção visual',5,3,5,'imprimir',true,'familia','amostra','{cores,associacao}','{"pattern":"ligar-cor","items":["🔴 vermelho","🔵 azul","🟢 verde"]}'),
('amostra-03','Qual é a letra?','Pinte a letra que começa a palavra SOL.','Letras e sílabas',5,4,6,'imprimir',true,'familia','amostra','{letras,silabico}','{"pattern":"pintar-letra","palavra":"SOL","items":["A","S","M","P"]}'),
('amostra-04','Quanto tem?','Conte e escreva o número.','Números e quantidades',5,4,6,'imprimir',true,'familia','amostra','{numeros,contar}','{"pattern":"contar","grupos":[{"icon":"🍎","qtd":3}]}'),
('amostra-05','Labirinto curto','Leve o 🐱 até o 🐟 sem sair da linha.','Traçado e coordenação',5,4,7,'imprimir',true,'familia','amostra','{labirinto,motor}','{"pattern":"labirinto","de":"🐱","ate":"🐟"}'),
('amostra-06','Picote a linha','Recorte em cima dos pontinhos, bem devagar.','Traçado e coordenação',5,4,8,'imprimir',true,'familia','amostra','{recorte,picotado}','{"pattern":"picotado"}'),
('amostra-07','Como você está hoje?','Pinte o rostinho que mais parece com você agora.','Emoções',5,3,8,'imprimir',true,'familia','amostra','{emocoes,escolha}','{"pattern":"emocoes","rosto":["😊","😐","😢","😡"]}'),
('amostra-08','Ordem da manhã','Numere de 1 a 3 a ordem que você faz em casa.','Rotinas',5,4,8,'imprimir',true,'familia','amostra','{rotina,sequencia}','{"pattern":"rotina-ordem","passos":["🪥 Escovar os dentes","👕 Vestir a roupa","🥣 Café da manhã"]}'),
('amostra-09','Nomeie a figura','Fale o nome em voz alta e tente escrever a primeira letra.','Vocabulário',5,3,7,'imprimir',true,'familia','amostra','{vocabulario,letras}','{"pattern":"nomear-figura","figuras":["🦋","🏠","🎈"]}'),
('amostra-10','Estrela do dia','Coloriu e terminou? Pinte a estrela — você conseguiu!','Atenção visual',5,3,8,'imprimir',true,'familia','amostra','{conquista}','{"pattern":"estrela-dia"}'),

-- ===== KIT INICIAL — Atenção visual =====
('kit-diferencas','Diferenças na fazenda','Encontre as 3 diferenças entre os dois quadros.','Atenção visual',10,4,7,'imprimir',true,'familia','kit-inicial','{diferencas,atencao}','{"pattern":"diferencas","tema":"fazenda","qtd":3}'),
('kit-cores-iguais','Casinha das cores','Guie cada bolinha até a casinha da mesma cor.','Atenção visual',10,3,5,'imprimir',true,'familia','kit-inicial','{cores,associacao}','{"pattern":"ligar-cor","items":["🔴 vermelho","🔵 azul","🟢 verde","🟡 amarelo"]}'),

-- ===== KIT INICIAL — Traçado e coordenação =====
('kit-labirinto-sapo','Labirinto do sapinho','Ajude o sapinho 🐸 a alcançar o laginho, sem sair da linha.','Traçado e coordenação',10,4,7,'imprimir',true,'familia','kit-inicial','{labirinto,motor}','{"pattern":"labirinto","de":"🐸","ate":"💧"}'),
('kit-tracejado-ondas','Tracejado de ondas','Complete as ondas com o lápis, da esquerda para a direita.','Traçado e coordenação',10,4,6,'imprimir',true,'familia','kit-inicial','{tracejado,motor}','{"pattern":"tracejado","linhas":["~~~~~~","◠◠◠◠","〰〰〰〰"]}'),
('kit-recorte-camadas','Recorte as fitas','Recorte cada fita na linha pontilhada até o fim.','Traçado e coordenação',10,5,8,'imprimir',true,'familia','kit-inicial','{recorte,picotado}','{"pattern":"picotado"}'),

-- ===== KIT INICIAL — Letras e sílabas =====
('kit-tracejado-letras','Tracejado das letras','Trace as letras A, B e C bem devagar.','Letras e sílabas',10,4,6,'imprimir',true,'familia','kit-inicial','{letras,tracejado}','{"pattern":"tracejado","linhas":["AAA","CCC","VVV"]}'),
('kit-silaba','Qual é a sílaba?','Pinte a sílaba que falta em cada palavra.','Letras e sílabas',10,5,7,'imprimir',true,'familia','kit-inicial','{silabas,leitura}','{"pattern":"silaba","pares":[{"hidden":"BO","shown":"LA","palavra":"BOLA","emoji":"⚽"},{"hidden":"SA","shown":"PO","palavra":"SAPO","emoji":"🐸"},{"hidden":"VE","shown":"LA","palavra":"VELA","emoji":"🕯️"}],"opcoes":["BO","SA","VE"]}'),

-- ===== KIT INICIAL — Palavras e leitura =====
('kit-cartoes','Cartões ilustrados','Recorte os cartões e leia cada palavra com calma.','Palavras e leitura',10,5,8,'imprimir',true,'familia','kit-inicial','{vocabulario,cartoes}','{"pattern":"wordcards","cartoes":[{"word":"MALA","syllables":["MA","LA"],"emoji":"👜"},{"word":"SAPO","syllables":["SA","PO"],"emoji":"🐸"},{"word":"BOLA","syllables":["BO","LA"],"emoji":"⚽"},{"word":"UVA","syllables":["U","VA"],"emoji":"🍇"},{"word":"GATO","syllables":["GA","TO"],"emoji":"🐱"},{"word":"CASA","syllables":["CA","SA"],"emoji":"🏠"}]}'),
('kit-copie','Copie a palavra','Escreva cada palavra na linha, letra por letra.','Palavras e leitura',10,5,8,'imprimir',true,'familia','kit-inicial','{leitura,escrita}','{"pattern":"copiar","palavras":["CASA","BOLO","SAPO","OVO"]}'),

-- ===== KIT INICIAL — Números e quantidades =====
('kit-contar','Conte as maçãs','Conte quantas maçãs há em cada grupo e escreva.','Números e quantidades',10,4,6,'imprimir',true,'familia','kit-inicial','{numeros,contar}','{"pattern":"contar-multiplo","grupos":[{"icon":"🍎","qtd":4},{"icon":"🍓","qtd":2},{"icon":"🍇","qtd":5}]}'),
('kit-sequencia','Que vem depois?','Complete a sequência com o número que falta.','Números e quantidades',10,5,8,'imprimir',true,'familia','kit-inicial','{numeros,sequencia}','{"pattern":"sequencia","numeros":["1","2","__","4","__","6"]}'),

-- ===== KIT INICIAL — Emoções =====
('kit-termometro','Termômetro das emoções','Marque no termômetro de 1 a 5 o número que diz o quanto você sentiu hoje.','Emoções',10,4,8,'imprimir',true,'familia','kit-inicial','{emocoes,avaliacao}','{"pattern":"termometro"}'),
('kit-sentimentos','Cartões de sentimentos','Recorte os rostos e brinquem de adivinhar qual é.','Emoções',10,4,8,'imprimir',true,'familia','kit-inicial','{emocoes,cartoes}','{"pattern":"emocoes-cards","rosto":["😄","😭","😠","😲","🥰","😨"]}'),

-- ===== KIT INICIAL — Rotinas =====
('kit-quadro-manha','Quadro da manhã','Recorte e organize na ordem do dia de vocês: escovar, vestir, café, pegar mochila?','Rotinas',10,4,8,'imprimir',true,'familia','kit-inicial','{rotina,manha}','{"pattern":"rotina-cards","passos":["🪥 Escovar os dentes","👕 Vestir a roupa","🥣 Café da manhã","🎒 Pegar a mochila"]}'),
('kit-rotina-figuras','Rotina visual em figuras','Cole cada figura no quadro da noite: banho, leitura, cama.','Rotinas',10,4,8,'imprimir',true,'familia','kit-inicial','{rotina,noite}','{"pattern":"rotina-cards","passos":["🛁 Tomar banho","📖 Historinha","🌙 Dormir"]}'),

-- ===== BUMPS =====
('bump-rotina-semana','Rotina visual da semana','Quadro da semana inteira em figuras, para colar na geladeira.','Rotinas',5,3,8,'imprimir',true,'familia','rotina-visual','{rotina,semana}','{"pattern":"rotina-cards","passos":["☀️ Manhã","🏫 Escola","🌧️ Tarde","🌙 Noite"]}'),
('bump-5min-par','5 minutos: ache o par','Sem tempo? Em 5 minutos ache os pares iguais.','Atenção visual',5,3,6,'imprimir',true,'familia','mini-kit-5-min','{par,atencao}','{"pattern":"ache-iguais","items":["🐠","🐢","🐠","🐢"]}'),
('bump-5min-sequencias','5 minutos: sequências','Sem tempo? Complete as sequências em preto e branco.','Números e quantidades',5,5,8,'imprimir',true,'familia','mini-kit-5-min','{sequencia,numeros}','{"pattern":"sequencia","numeros":["🌙","⭐","🌙","__","🌙","⭐"]}'),
('bump-cartoes-vocab','Cartões ilustrados: dia a dia','12 palavras novas para recortar e aprender juntinhos.','Vocabulário',5,3,7,'imprimir',true,'familia','cartoes-vocabulario','{vocabulario,cartoes}','{"pattern":"wordcards","cartoes":[{"word":"UVA","syllables":["U","VA"],"emoji":"🍇"},{"word":"RATO","syllables":["RA","TO"],"emoji":"🐭"},{"word":"NUVEM","syllables":["NU","VEM"],"emoji":"☁️"},{"word":"DADO","syllables":["DA","DO"],"emoji":"🎲"},{"word":"PATO","syllables":["PA","TO"],"emoji":"🦆"},{"word":"ESTRELA","syllables":["ES","TRE","LA"],"emoji":"⭐"},{"word":"VACA","syllables":["VA","CA"],"emoji":"🐄"},{"word":"FOCA","syllables":["FO","CA"],"emoji":"🦭"},{"word":"TATU","syllables":["TA","TU"],"emoji":"🦡"},{"word":"JACA","syllables":["JA","CA"],"emoji":"🍈"},{"word":"KIWI","syllables":["KI","WI"],"emoji":"🥝"},{"word":"LATA","syllables":["LA","TA"],"emoji":"🥫"}]}'),
-- ===== PROFESSORES (só com acesso-total) =====
('prof-plano-15','Plano de aula de 15 minutos','Sequência pronta para turminha pequena: abertura, atividade, fechamento.','Professores',15,4,8,'tela',false,'professor','professores','{plano,professor}','{"pattern":"professor-plan","partes":[{"titulo":"Abertura","linhas":["Pergunte às crianças: quem brincou com figuras em casa?","Mostre 2 fichas do kit no quadro"]},{"titulo":"Atividade","linhas":["Entregue 2 fichas por criança","Depois de 5 minutos, troque com o amiguinho ao lado"]},{"titulo":"Fechamento","linhas":["Cada criança mostra o que fez","Celebre a participação, sem corrigir na frente da turma"]}]}'),
('prof-acompanhamento','Acompanhamento da turma','Checklist simples para registrar o caminho de cada criança na semana.','Professores',10,4,8,'tela',false,'professor','professores','{checklist,professor}','{"pattern":"professor-plan","partes":[{"titulo":"Checklist","linhas":["[ ] escolheu a ficha sozinho?","[ ] tentou o traçado com calma?","[ ] contou as peças direito?","[ ] mostrou o resultado para alguém?"]},{"titulo":"Como usar","linhas":["Uma linha por criança por semana. O registro é da presença: o que ela viveu conta mais que o acerto."]}]}')
on conflict (id) do update
  set title = excluded.title,
      summary = excluded.summary,
      category = excluded.category,
      duration_min = excluded.duration_min,
      age_min = excluded.age_min,
      age_max = excluded.age_max,
      format = excluded.format,
      bw = excluded.bw,
      audience = excluded.audience,
      product_key = excluded.product_key,
      tags = excluded.tags,
      data = excluded.data;

-- Fim do passo 1. Próximos passos do plano ficam no PROMPT-AREA-LOGADA.md.
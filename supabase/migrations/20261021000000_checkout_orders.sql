-- Pedidos do checkout. Rode DEPOIS de 20261020000000_area_logada.sql.
-- Sem política para anon/authenticated: só service_role (e app_list_orders para admin).

create table if not exists public.checkout_orders (
  id          uuid primary key default gen_random_uuid(),
  payment_id  text not null unique,
  email       text not null,
  nome        text not null default '',
  produtos    jsonb not null default '[]'::jsonb,
  total       numeric not null default 0,
  status      text not null default 'approved',
  origem      text not null default 'mercado-pago'
              check (origem in ('mercado-pago', 'simulado', 'admin')),
  admin_notes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.checkout_orders enable row level security;

create or replace function public.app_list_orders()
returns setof public.checkout_orders
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.checkout_orders
  where public.app_is_admin()
  order by created_at desc
  limit 200;
$$;

revoke all on function public.app_list_orders() from public;
grant execute on function public.app_list_orders() to authenticated, service_role;

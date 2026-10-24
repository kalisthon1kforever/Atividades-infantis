-- =============================================================
-- Ofertinha 2.0 / Pequenos Passos — estado durável de entrega
-- Passo: colar no SQL Editor do Supabase DEPOIS das migrations
-- da área logada e do checkout_orders.
-- Idempotente: pode rodar de novo sem duplicar.
--
-- Motivo: a entrega tem passos idempotentes (conta, entitlements,
-- lead) e UM passo não-idempotente (envio do e-mail de acesso).
-- Para retomar uma entrega interrompida sem duplicar e-mail nem
-- concessão, gravamos o progresso do envio em `delivery_state`.
--
--   'registered'  -> pedido gravado; e-mail ainda não entregue
--   'emailing'    -> um processamento está enviando o e-mail agora
--   'email_sent'  -> e-mail de acesso entregue
-- =============================================================

alter table public.checkout_orders
  add column if not exists delivery_state text not null default 'registered'
  check (delivery_state in ('registered', 'emailing', 'email_sent'));

-- Reivindica o envio do e-mail de forma atômica. Retorna true apenas
-- para o processamento que venceu a reivindicação. Também recupera
-- 'emailing' que ficou travado há mais de 5 minutos (crash no meio do envio).
create or replace function public.app_claim_delivery_email(p_payment_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.checkout_orders
     set delivery_state = 'emailing',
         updated_at = now()
   where payment_id = p_payment_id
     and (delivery_state = 'registered'
          or (delivery_state = 'emailing' and updated_at < now() - interval '5 minutes'));
  return found;
end;
$$;

-- Conclui o envio: 'email_sent' quando enviou, ou volta para 'registered'
-- quando falhou (permitindo que uma próxima notificação tente de novo).
create or replace function public.app_finish_delivery_email(p_payment_id text, p_sent boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.checkout_orders
     set delivery_state = case when p_sent then 'email_sent' else 'registered' end,
         updated_at = now()
   where payment_id = p_payment_id;
end;
$$;

revoke execute on function public.app_claim_delivery_email(text) from anon, authenticated, public;
revoke execute on function public.app_finish_delivery_email(text, boolean) from anon, authenticated, public;
grant execute on function public.app_claim_delivery_email(text) to service_role;
grant execute on function public.app_finish_delivery_email(text, boolean) to service_role;

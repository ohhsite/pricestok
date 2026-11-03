-- Uruchom po dotychczasowym schema.sql. Nie usuwa dotychczasowych danych.
begin;
create table if not exists public.bnp_billing (
 id uuid primary key, plan text not null check(plan in ('oneoff','monthly','company','quarter','halfyear','year')),
 net integer not null, vat integer not null check(vat in (0,23)), amount integer not null,
 payload jsonb not null, access_hash text not null,
 session_id text unique, subscription_id text unique, customer_id text, payment_intent text,
 state text not null default 'awaiting_payment', approved boolean not null default false,
 blocked boolean not null default false, cancel_at_end boolean not null default false,
 paid_until timestamptz, state_version bigint not null default 0, created_at timestamptz not null default now(),
 check ((plan in ('oneoff','monthly') and net=5000) or (plan='company' and net in (19900,20000)) or (plan='quarter' and net=13900) or (plan='halfyear' and net=24900) or (plan='year' and net=44900)),
 check(amount=round(net*(1+vat::numeric/100)))
);
-- Uaktualnia również projekty z wcześniejszą wersją tabeli.
alter table public.bnp_billing drop constraint if exists bnp_billing_plan_check;
alter table public.bnp_billing drop constraint if exists bnp_billing_check;
alter table public.bnp_billing drop constraint if exists bnp_billing_net_check;
alter table public.bnp_billing add constraint bnp_billing_plan_check check(plan in ('oneoff','monthly','company','quarter','halfyear','year'));
alter table public.bnp_billing add constraint bnp_billing_net_check check((plan in ('oneoff','monthly') and net=5000) or (plan='company' and net in (19900,20000)) or (plan='quarter' and net=13900) or (plan='halfyear' and net=24900) or (plan='year' and net=44900));
alter table public.bnp_billing enable row level security;
revoke all on public.bnp_billing from public,anon,authenticated;
grant all on public.bnp_billing to service_role;
create index if not exists bnp_billing_created_idx on public.bnp_billing(created_at desc);
create index if not exists bnp_billing_pi_idx on public.bnp_billing(payment_intent);

create or replace function public.bnp_billing_sync(p_id uuid,p_state text,p_until timestamptz,p_pi text,p_customer text,p_subscription text,p_cancel boolean,p_version bigint) returns void
language plpgsql security invoker set search_path='' as $$
declare o public.bnp_billing%rowtype; end_day text;
begin
 select * into o from public.bnp_billing where id=p_id for update;
 if not found then raise exception 'Order missing'; end if;
 if p_version<o.state_version or o.blocked then return; end if;
 update public.bnp_billing set state=p_state,paid_until=coalesce(p_until,paid_until),payment_intent=coalesce(p_pi,payment_intent),customer_id=coalesce(p_customer,customer_id),subscription_id=coalesce(p_subscription,subscription_id),cancel_at_end=p_cancel,state_version=p_version where id=p_id;
 if p_state in ('refunded','disputed','fraud_review') then
  update public.bnp_billing set blocked=true where id=p_id;
 end if;
 if o.plan='monthly' and p_until is not null then
  end_day:=((p_until-interval '1 second') at time zone 'Europe/Warsaw')::date::text;
  if coalesce(o.payload->>'end','')<>'' then end_day:=least(end_day,o.payload->>'end'); end if;
  update public.bnp_offers set data=data||jsonb_build_object('end',end_day) where id='abonament-'||p_id::text;
 end if;
end;$$;

alter table public.bnp_billing add column if not exists replaced_at timestamptz;
alter table public.bnp_billing add column if not exists approved_at timestamptz;

create or replace function public.bnp_billing_approve(p_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare o public.bnp_billing%rowtype; oid text; payload jsonb; end_day text; start_day date; until_time timestamptz;
begin
 select * into o from public.bnp_billing where id=p_id for update;
 if not found or o.blocked or o.state<>'active' then raise exception 'Payment not active'; end if;
 if o.plan='monthly' and (o.paid_until is null or o.paid_until<=now()) then raise exception 'Paid period ended'; end if;
 if o.approved then return; end if;
 start_day:=(now() at time zone 'Europe/Warsaw')::date;
 if o.plan='company' and o.net=19900 then
  update public.bnp_billing set paid_until=((start_day+interval '1 year') at time zone 'Europe/Warsaw') where id=p_id;
 end if;
 if o.plan<>'company' then
  oid:='abonament-'||p_id::text;
  if o.plan='monthly' then
   until_time:=o.paid_until;
  else
   until_time:=(start_day+case o.plan
    when 'oneoff' then interval '30 days'
    when 'quarter' then interval '3 months'
    when 'halfyear' then interval '6 months'
    when 'year' then interval '1 year' end) at time zone 'Europe/Warsaw';
   update public.bnp_billing set paid_until=until_time where id=p_id;
  end if;
  end_day:=((until_time-interval '1 second') at time zone 'Europe/Warsaw')::date::text;
  if coalesce(o.payload->>'end','')<>'' then end_day:=least(end_day,o.payload->>'end'); end if;
  if end_day < start_day::text then raise exception 'Promotion expired'; end if;
  payload:=(o.payload-'email'-'nip')||jsonb_build_object('id',oid,'slug',oid,'companySlug','abonament-'||p_id::text,'badge','OFERTA','image',case o.payload->>'category' when 'jedzenie' then 'pizza' when 'beauty' then 'beauty' when 'sport-i-relaks' then 'gym' else 'shopping' end,'days',jsonb_build_array(0,1,2,3,4,5,6),'start',(now() at time zone 'Europe/Warsaw')::date::text,'end',end_day,'verified',(now() at time zone 'Europe/Warsaw')::date::text,'status','published','sponsored',true,'featured',o.plan<>'monthly','price','','oldPrice','');
  insert into public.bnp_offers(id,data) values(oid,payload);
 end if;
 update public.bnp_billing set approved=true, approved_at=now() where id=p_id;
end;$$;

create or replace function public.bnp_billing_block(p_id uuid,p_state text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 if p_state not in ('refund_pending','refunded','disputed','fraud_review','rejected') then raise exception 'Invalid block state'; end if;
 update public.bnp_billing set blocked=true,state=p_state where id=p_id;
 update public.bnp_offers set data=data||'{"status":"archived"}'::jsonb where id='abonament-'||p_id::text;
end;$$;
revoke all on function public.bnp_billing_sync(uuid,text,timestamptz,text,text,text,boolean,bigint) from public,anon,authenticated;
revoke all on function public.bnp_billing_approve(uuid) from public,anon,authenticated;
revoke all on function public.bnp_billing_block(uuid,text) from public,anon,authenticated;
grant execute on function public.bnp_billing_sync(uuid,text,timestamptz,text,text,text,boolean,bigint),public.bnp_billing_approve(uuid),public.bnp_billing_block(uuid,text) to service_role;



create or replace function public.bnp_billing_edit(p_id uuid,p_payload jsonb,p_replace boolean) returns void
language plpgsql security invoker set search_path='' as $$
declare o public.bnp_billing%rowtype; end_day text; today date; oid text;
begin
 select * into o from public.bnp_billing where id=p_id for update;
 if not found or not o.approved or o.blocked or o.state<>'active' or o.plan='monthly'
   or (o.paid_until is null or o.paid_until<=now()) and not (o.plan='company' and o.net=20000) then
  raise exception 'Publikacja nie jest aktywna.';
 end if;
 today:=(now() at time zone 'Europe/Warsaw')::date;
 if p_replace and (o.plan not in ('quarter','halfyear','year')
   or now()<coalesce(o.replaced_at, o.approved_at, o.paid_until-case o.plan
     when 'quarter' then interval '3 months' when 'halfyear' then interval '6 months'
     else interval '1 year' end)+interval '30 days') then
  raise exception 'Wymiana jest dostępna po 30 dniach od startu pakietu lub ostatniej wymiany.';
 end if;
 if o.plan<>'company' then
  oid:='abonament-'||p_id::text;
  end_day:=((o.paid_until-interval '1 second') at time zone 'Europe/Warsaw')::date::text;
  if coalesce(p_payload->>'end','')<>'' then end_day:=least(end_day,p_payload->>'end'); end if;
  update public.bnp_offers set data=data||(p_payload-'email'-'nip')||
    jsonb_build_object('end',end_day,'verified',today::text)
   where id=oid;
  if not found then raise exception 'Nie znaleziono promocji.'; end if;
 end if;
 update public.bnp_billing set payload=p_payload,
   replaced_at=case when p_replace then now() else replaced_at end where id=p_id;
end;$$;
revoke all on function public.bnp_billing_edit(uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.bnp_billing_edit(uuid,jsonb,boolean) to service_role;
commit;

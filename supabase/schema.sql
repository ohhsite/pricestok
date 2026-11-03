-- Wklej cały plik do SQL Editor w NOWYM projekcie Supabase.
-- Wszystkie zapisy odbywają się wyłącznie na serwerze. Brak publicznych polityk zapisu/odczytu.
create table if not exists public.bnp_offers(id text primary key, data jsonb not null);
create table if not exists public.bnp_submissions(id uuid primary key, data jsonb not null, created timestamptz not null default now());
create table if not exists public.bnp_metrics(id text primary key, views bigint not null default 0, clicks bigint not null default 0);
create table if not exists public.bnp_orders(
 id uuid primary key, plan text not null check(plan in ('standard','featured')),
 amount integer not null check(amount in (4900,9900)), currency text not null default 'pln' check(currency='pln'),
 offer jsonb not null, status text not null default 'awaiting_payment'
 check(status in ('awaiting_payment','paid_review','published','expired','payment_failed','refund_pending','refunded','disputed')),
 access_hash text not null, session_id text unique, payment_intent text unique,
 created_at timestamptz not null default now(), paid_at timestamptz, approved_at timestamptz, offer_id text
);
create index if not exists bnp_orders_status_idx on public.bnp_orders(status,created_at desc);
alter table public.bnp_offers enable row level security;
alter table public.bnp_submissions enable row level security;
alter table public.bnp_metrics enable row level security;
alter table public.bnp_orders enable row level security;
revoke all on public.bnp_offers,public.bnp_submissions,public.bnp_metrics,public.bnp_orders from anon,authenticated;
grant all on public.bnp_offers,public.bnp_submissions,public.bnp_metrics,public.bnp_orders to service_role;

create or replace function public.bnp_increment_metric(offer_id text,metric_name text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 if metric_name not in ('views','clicks') then raise exception 'Invalid metric'; end if;
 insert into public.bnp_metrics(id,views,clicks) values(offer_id,case when metric_name='views' then 1 else 0 end,case when metric_name='clicks' then 1 else 0 end)
 on conflict(id) do update set views=bnp_metrics.views+excluded.views,clicks=bnp_metrics.clicks+excluded.clicks;
end;$$;
revoke all on function public.bnp_increment_metric(text,text) from public,anon,authenticated;
grant execute on function public.bnp_increment_metric(text,text) to service_role;

-- Jeden lock i jedna transakcja: równoległe kliknięcia nie przedłużają publikacji.
create or replace function public.bnp_approve_order(p_order_id uuid,p_data jsonb) returns text
language plpgsql security invoker set search_path='' as $$
declare o public.bnp_orders%rowtype; oid text; start_day date; end_day date; payload jsonb;
begin
 select * into o from public.bnp_orders where id=p_order_id for update;
 if not found then raise exception 'Order not found'; end if;
 if o.status='published' then return o.offer_id; end if;
 if o.status<>'paid_review' then raise exception 'Order is not paid and awaiting review'; end if;
 start_day:=(now() at time zone 'Europe/Warsaw')::date; end_day:=start_day+29;
 if coalesce(o.offer->>'end','')<>'' then end_day:=least(end_day,(o.offer->>'end')::date); end if;
 if end_day<start_day then raise exception 'Promotion expired before approval'; end if;
 oid:='platna-'||o.id::text;
 payload:=p_data||jsonb_build_object('id',oid,'slug',oid,'status','published','sponsored',true,'featured',o.plan='featured','start',start_day::text,'end',end_day::text,'verified',start_day::text);
 insert into public.bnp_offers(id,data) values(oid,payload) on conflict(id) do update set data=excluded.data;
 update public.bnp_orders set status='published',offer_id=oid,approved_at=now() where id=o.id;
 return oid;
end;$$;
revoke all on function public.bnp_approve_order(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.bnp_approve_order(uuid,jsonb) to service_role;

create or replace function public.bnp_block_order(p_payment_intent text,p_status text) returns void
language plpgsql security invoker set search_path='' as $$
declare o public.bnp_orders%rowtype;
begin
 if p_status not in ('refunded','refund_pending','disputed') then raise exception 'Invalid status'; end if;
 for o in select * from public.bnp_orders where payment_intent=p_payment_intent for update loop
  update public.bnp_orders set status=p_status where id=o.id;
  if o.offer_id is not null then update public.bnp_offers set data=data||'{"status":"archived"}'::jsonb where id=o.offer_id; end if;
 end loop;
end;$$;
revoke all on function public.bnp_block_order(text,text) from public,anon,authenticated;
grant execute on function public.bnp_block_order(text,text) to service_role;

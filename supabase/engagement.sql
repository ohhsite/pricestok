create table if not exists public.bnp_offer_events (
 day date not null default current_date,
 offer_id text not null,
 event text not null check (event in ('offer_view','offer_outbound','company_click','share_facebook','copy_link','copy_post','download_image','company_materials_open','contact_click')),
 source text not null default 'direct',
 total bigint not null default 0,
 primary key(day,offer_id,event,source)
);
alter table public.bnp_offer_events enable row level security;
revoke all on public.bnp_offer_events from anon,authenticated;
grant all on public.bnp_offer_events to service_role;
create or replace function public.bnp_record_offer_event(p_offer text,p_event text,p_source text) returns void
language plpgsql security invoker set search_path = public as $$
begin
 insert into public.bnp_offer_events(day,offer_id,event,source,total) values(current_date,p_offer,p_event,p_source,1)
 on conflict(day,offer_id,event,source) do update set total=bnp_offer_events.total+1;
 if p_event='offer_view' then
 insert into public.bnp_metrics(id,views,clicks) values(p_offer,1,0) on conflict(id) do update set views=bnp_metrics.views+1;
 elsif p_event='offer_outbound' then
 insert into public.bnp_metrics(id,views,clicks) values(p_offer,0,1) on conflict(id) do update set clicks=bnp_metrics.clicks+1;
 end if;
end $$;
revoke all on function public.bnp_record_offer_event(text,text,text) from public,anon,authenticated;
grant execute on function public.bnp_record_offer_event(text,text,text) to service_role;

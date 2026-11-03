begin;
create table if not exists public.bnp_hearts (
  offer_id text not null,
  visitor_hash text not null,
  primary key (offer_id, visitor_hash)
);
alter table public.bnp_hearts enable row level security;
revoke all on public.bnp_hearts from public, anon, authenticated;
grant select, insert, delete on public.bnp_hearts to service_role;
create or replace function public.bnp_heart_counts()
returns table(offer_id text, total bigint)
language sql stable security invoker set search_path = '' as $$
  select h.offer_id, count(*) from public.bnp_hearts h group by h.offer_id;
$$;
create or replace function public.bnp_set_heart(p_offer_id text, p_visitor text, p_enabled boolean)
returns bigint language plpgsql security invoker set search_path = '' as $$
begin
  if p_enabled then
    insert into public.bnp_hearts values (p_offer_id, p_visitor) on conflict do nothing;
  else
    delete from public.bnp_hearts where offer_id=p_offer_id and visitor_hash=p_visitor;
  end if;
  return (select count(*) from public.bnp_hearts where offer_id=p_offer_id);
end;
$$;
revoke all on function public.bnp_heart_counts(), public.bnp_set_heart(text,text,boolean) from public, anon, authenticated;
grant execute on function public.bnp_heart_counts(), public.bnp_set_heart(text,text,boolean) to service_role;
notify pgrst, 'reload schema';
commit;

begin;
create table if not exists public.bnp_categories (
 id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null, parent text, title text not null default '',
 description text not null default '', content text not null default ''
);
alter table public.bnp_categories enable row level security;
revoke all on public.bnp_categories from public, anon, authenticated;
grant all on public.bnp_categories to service_role;

create or replace function public.bnp_submission_draft() returns trigger
language plpgsql security invoker set search_path='' as $$
declare oid text := 'zgloszenie-' || new.id::text; d jsonb := new.data;
begin
 if coalesce(d->>'kind','offer') <> 'offer' then return new; end if;
 insert into public.bnp_offers(id,data) values(oid,jsonb_build_object(
   'id',oid,'slug',oid,'companySlug',oid,'status','draft','featured',false,
   'title',d->>'title','company',d->>'company','category',d->>'category',
   'source',d->>'source','address',left(coalesce(d->>'address',''),200),
   'summary',left(coalesce(d->>'conditions',''),220),'conditions',left(coalesce(d->>'conditions',''),4000),
   'badge','','price','','oldPrice','','area','Białystok','image','shopping',
   'days',jsonb_build_array(0,1,2,3,4,5,6),'start','','end',
   case when d->>'end' ~ '^\d{4}-\d{2}-\d{2}$' then d->>'end' else '' end,
   'verified',(now() at time zone 'Europe/Warsaw')::date::text))
 on conflict(id) do nothing;
 return new;
end;$$;
drop trigger if exists bnp_submission_draft on public.bnp_submissions;
create trigger bnp_submission_draft after insert on public.bnp_submissions
for each row execute function public.bnp_submission_draft();
commit;

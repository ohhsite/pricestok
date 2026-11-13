begin;
alter table public.bnp_offers
  add column if not exists added_at timestamptz,
  add column if not exists facebook_shared_at timestamptz;
alter table public.bnp_offers alter column added_at set default now();
alter table public.bnp_submissions add column if not exists archived_at timestamptz;
create table if not exists public.bnp_companies (
  slug text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  address text not null default '',
  website text not null default ''
);
alter table public.bnp_companies enable row level security;
revoke all on public.bnp_companies from public,anon,authenticated;
grant select,insert,update on public.bnp_companies to service_role;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bnp-offer-images','bnp-offer-images',true,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
notify pgrst, 'reload schema';
commit;

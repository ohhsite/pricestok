create table if not exists public.bnp_newsletter (
  email text primary key check (length(email) between 5 and 254 and email = lower(email)),
  status text not null default 'active' check (status in ('active','unsubscribed')),
  unsubscribe_token text not null unique,
  consent_version text not null,
  consent_text text not null,
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  source text not null default 'website'
);
alter table public.bnp_newsletter enable row level security;
revoke all on public.bnp_newsletter from public, anon, authenticated;
grant select, insert, update, delete on public.bnp_newsletter to service_role;

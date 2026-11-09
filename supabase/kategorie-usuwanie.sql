alter table public.bnp_categories add column if not exists deleted boolean not null default false;

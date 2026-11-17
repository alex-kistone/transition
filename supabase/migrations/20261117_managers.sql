-- Kistone Transition : inscriptions des managers de transition
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run.

create table if not exists public.managers (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  first_name     text not null check (char_length(first_name) between 1 and 100),
  last_name      text not null check (char_length(last_name) between 1 and 100),
  email          text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone          text check (char_length(phone) <= 40),
  linkedin_url   text check (char_length(linkedin_url) <= 300),
  role           text not null,                       -- métier (libellé affiché)
  role_slug      text,                                -- métier (identifiant de la fiche du site)
  daily_rate     integer check (daily_rate between 100 and 10000),   -- TJM en € HT
  availability   text not null check (availability in ('immediate', '1_month', '3_months', 'date')),
  available_from date,
  sectors        text[] not null default '{}',
  message        text check (char_length(message) <= 4000),
  consent        boolean not null default false,
  source         text,
  status         text not null default 'nouveau' check (status in ('nouveau', 'qualifie', 'en_mission', 'archive'))
);

-- Une inscription par e-mail : une nouvelle soumission met à jour la fiche existante.
create unique index if not exists managers_email_key on public.managers (email);
create index if not exists managers_role_slug_idx on public.managers (role_slug);
create index if not exists managers_created_at_idx on public.managers (created_at desc);

create or replace function public.managers_touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists managers_touch_updated_at on public.managers;
create trigger managers_touch_updated_at before update on public.managers
  for each row execute function public.managers_touch_updated_at();

-- Sécurité : RLS activée sans aucune règle publique.
-- Seul le serveur du site (clé service_role, jamais exposée au navigateur) peut écrire ;
-- la consultation se fait depuis le tableau de bord Supabase.
alter table public.managers enable row level security;
revoke all on public.managers from anon, authenticated;

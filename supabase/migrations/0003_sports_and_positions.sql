-- Tables de référence `sports` et `positions` : données publiques en
-- lecture seule pour les utilisateurs de l'application, gérées par
-- l'administration (service_role) uniquement.

create table public.sports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

comment on table public.sports is 'Référentiel des sports disponibles sur la plateforme.';

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports (id) on delete cascade,
  slug text not null,
  name_fr text not null,
  name_en text not null,
  created_at timestamptz not null default now(),
  unique (sport_id, slug)
);

comment on table public.positions is 'Postes/rôles par sport (ex. gardien, attaquant).';

create index positions_sport_id_idx on public.positions (sport_id);

alter table public.sports enable row level security;
alter table public.positions enable row level security;

-- Lecture publique (anon + authenticated) : données de référence non
-- sensibles, nécessaires dès les écrans publics et le formulaire
-- d'inscription.
create policy "sports_select_all" on public.sports
  for select
  using (true);

create policy "positions_select_all" on public.positions
  for select
  using (true);

-- Aucune politique d'écriture : seules les clés `service_role` (qui
-- contournent RLS) peuvent modifier ce référentiel, via les migrations
-- ou le back-office admin.

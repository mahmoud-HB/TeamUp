-- Table de jonction `athlete_sports` : sports pratiqués par un athlète,
-- avec poste et niveau (un athlète peut pratiquer plusieurs sports).

create table public.athlete_sports (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athlete_profiles (id) on delete cascade,
  sport_id uuid not null references public.sports (id) on delete restrict,
  position_id uuid references public.positions (id) on delete set null,
  level text not null check (level in ('beginner', 'amateur', 'semi_pro', 'pro')),
  created_at timestamptz not null default now(),
  unique (athlete_id, sport_id)
);

comment on table public.athlete_sports is
  'Sports pratiqués par un athlète, avec poste et niveau déclarés.';

create index athlete_sports_athlete_id_idx on public.athlete_sports (athlete_id);
create index athlete_sports_sport_id_idx on public.athlete_sports (sport_id);

alter table public.athlete_sports enable row level security;

create policy "athlete_sports_select" on public.athlete_sports
  for select
  using (public.can_view_profile(athlete_id));

create policy "athlete_sports_insert_self" on public.athlete_sports
  for insert
  with check (auth.uid() = athlete_id);

create policy "athlete_sports_update_self" on public.athlete_sports
  for update
  using (auth.uid() = athlete_id)
  with check (auth.uid() = athlete_id);

create policy "athlete_sports_delete_self" on public.athlete_sports
  for delete
  using (auth.uid() = athlete_id);

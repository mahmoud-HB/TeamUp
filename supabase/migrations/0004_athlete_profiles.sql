-- Table `athlete_profiles` : champs spécifiques au profil athlète,
-- en relation 1-1 avec `profiles` (uniquement pour role = 'athlete').

create table public.athlete_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  height_cm smallint check (height_cm is null or height_cm between 50 and 250),
  weight_kg smallint check (weight_kg is null or weight_kg between 20 and 200),
  dominant_side text check (dominant_side is null or dominant_side in ('left', 'right', 'both')),
  availability_status text not null default 'free'
    check (availability_status in ('free', 'under_contract', 'on_loan')),
  mobility boolean not null default false,
  current_club text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.athlete_profiles is
  'Données spécifiques au profil athlète (gabarit, disponibilité, mobilité, club actuel).';

create trigger athlete_profiles_set_updated_at
  before update on public.athlete_profiles
  for each row
  execute function public.set_updated_at();

alter table public.athlete_profiles enable row level security;

create policy "athlete_profiles_select" on public.athlete_profiles
  for select
  using (public.can_view_profile(id));

create policy "athlete_profiles_insert_self" on public.athlete_profiles
  for insert
  with check (auth.uid() = id);

create policy "athlete_profiles_update_self" on public.athlete_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "athlete_profiles_delete_self" on public.athlete_profiles
  for delete
  using (auth.uid() = id);

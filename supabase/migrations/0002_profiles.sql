-- Table `profiles` : profil générique pour tout utilisateur (athlète,
-- recruteur, organisation, admin), lié 1-1 à auth.users.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'athlete'
    check (role in ('athlete', 'recruiter', 'organization', 'admin')),
  username text not null unique
    check (char_length(username) between 3 and 30),
  avatar_url text,
  bio text check (char_length(bio) <= 500),
  country text,
  -- Requise pour les athlètes (règles de protection des mineurs) ;
  -- laissée nullable en base pour permettre la création initiale du
  -- compte avant complétion du profil, mais exigée par le formulaire.
  birth_date date check (birth_date is null or birth_date <= current_date),
  visibility text not null default 'private'
    check (visibility in ('public', 'verified_only', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Profil générique de tout utilisateur Scoutly (athlète, recruteur, organisation, admin).';

create index profiles_role_idx on public.profiles (role);
create index profiles_visibility_idx on public.profiles (visibility);

-- Maintient updated_at à jour automatiquement.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Fonction d'autorisation centralisée (réutilisée par toutes les tables
-- liées à un profil athlète) : détermine si l'utilisateur courant peut
-- consulter le profil ciblé, en appliquant la visibilité choisie et la
-- règle stricte de protection des mineurs. SECURITY DEFINER pour éviter
-- toute récursion RLS lors de la lecture de `profiles` depuis sa propre
-- politique.
create or replace function public.can_view_profile(target_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  target_role text;
  target_visibility text;
  target_birth_date date;
  requester_role text;
begin
  if target_id is null then
    return false;
  end if;

  if auth.uid() = target_id then
    return true;
  end if;

  select role, visibility, birth_date
    into target_role, target_visibility, target_birth_date
    from public.profiles
    where id = target_id;

  if not found then
    return false;
  end if;

  -- Les comptes non-athlètes (recruteurs, clubs) n'ont pas de visibilité
  -- restreinte en V1 : leurs pages publiques sont consultables par tous.
  if target_role <> 'athlete' then
    return true;
  end if;

  -- Un profil athlète mineur n'est jamais visible par un tiers tant
  -- qu'aucun mécanisme de consentement du tuteur n'est en place.
  if public.is_minor(target_birth_date) then
    return false;
  end if;

  if target_visibility = 'public' then
    return true;
  end if;

  if target_visibility = 'verified_only' then
    select role into requester_role
      from public.profiles
      where id = auth.uid();

    -- NOTE : la vérification effective des recruteurs/clubs (table
    -- recruiter_verifications) sera ajoutée à l'étape "Vérification
    -- recruteurs/clubs" ; en attendant, seul le rôle est contrôlé.
    return requester_role in ('recruiter', 'organization');
  end if;

  -- visibility = 'private' : accessible uniquement via un lien secret,
  -- géré au niveau applicatif (hors périmètre RLS de l'étape 1).
  return false;
end;
$$;

comment on function public.can_view_profile(uuid) is
  'Centralise les règles de visibilité des profils (public/vérifiés/privé) et la protection des mineurs.';

alter table public.profiles enable row level security;

-- Lecture : le propriétaire voit toujours son profil ; les tiers selon
-- can_view_profile().
create policy "profiles_select" on public.profiles
  for select
  using (public.can_view_profile(id));

-- Création : un utilisateur ne peut créer que sa propre ligne de profil
-- (le trigger handle_new_user, en SECURITY DEFINER, s'en charge en
-- pratique à l'inscription).
create policy "profiles_insert_self" on public.profiles
  for insert
  with check (auth.uid() = id);

-- Mise à jour : uniquement son propre profil.
create policy "profiles_update_self" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Suppression : uniquement son propre profil (droit à l'effacement RGPD).
create policy "profiles_delete_self" on public.profiles
  for delete
  using (auth.uid() = id);

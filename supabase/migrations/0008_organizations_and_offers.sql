-- Organisations (clubs, agences de recrutement) et offres de détection.
--
-- Une organisation représente un club de sport ou une agence de recrutement.
-- Une offre est un poste ouvert : club cherche un défenseur central, etc.
--
-- RLS : athlètes voient les orgs ET les offres publiques (pour postuler).
-- Recruteurs voient/créent/mettent à jour leurs propres orgs et offres.

-- Organisations (clubs, agences)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 3 and 150),
  type text not null check (type in ('club', 'recruiter')),
  country text not null,
  description text check (description is null or char_length(description) <= 2000),
  website text check (website is null or char_length(website) <= 255),
  logo_url text check (logo_url is null or char_length(logo_url) <= 500),
  verified boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public', 'verified_only', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.organizations is
  'Clubs de sport et agences de recrutement. Propriétaire = recruteur authentifié.';

create index organizations_owner_idx on public.organizations (owner_id);
create index organizations_type_idx on public.organizations (type);
create index organizations_country_idx on public.organizations (country);
create index organizations_visibility_idx on public.organizations (visibility);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row
  execute function public.set_updated_at();

alter table public.organizations enable row level security;

-- Athlètes : voir uniquement les orgs publiques (ou vérifiées si athlete vérifié)
create policy "organizations_select_public" on public.organizations
  for select
  using (
    visibility = 'public'
    or (visibility = 'verified_only' and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.verified = true
    ))
  );

-- Recruteurs : voir/créer/modifier leurs propres orgs
create policy "organizations_select_own" on public.organizations
  for select
  using (auth.uid() = owner_id);

create policy "organizations_insert_own" on public.organizations
  for insert
  with check (auth.uid() = owner_id);

create policy "organizations_update_own" on public.organizations
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "organizations_delete_own" on public.organizations
  for delete
  using (auth.uid() = owner_id);

-- Offres de détection (postes ouverts)
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  sport_slug text not null,
  position_label_fr text not null,
  position_label_en text not null,
  level text not null check (level in ('beginner', 'amateur', 'semi_pro', 'pro')),
  location text not null,
  description text check (description is null or char_length(description) <= 3000),
  salary_range_min integer check (salary_range_min is null or salary_range_min >= 0),
  salary_range_max integer check (salary_range_max is null or salary_range_max >= salary_range_min),
  currency text check (currency is null or char_length(currency) = 3),
  deadline_at timestamptz,
  status text not null default 'open' check (status in ('open', 'closed', 'filled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.offers is
  'Offres de détection : postes ouverts publiés par une organisation.';

create index offers_organization_idx on public.offers (organization_id);
create index offers_sport_idx on public.offers (sport_slug);
create index offers_level_idx on public.offers (level);
create index offers_status_idx on public.offers (status);
create index offers_created_idx on public.offers (created_at desc);

create trigger offers_set_updated_at
  before update on public.offers
  for each row
  execute function public.set_updated_at();

alter table public.offers enable row level security;

-- Athlètes : voir les offres publiées par des orgs publiques (ou vérifiées)
create policy "offers_select_public" on public.offers
  for select
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id
        and (o.visibility = 'public'
          or (o.visibility = 'verified_only' and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.verified = true
          ))
        )
    )
  );

-- Recruteurs : voir/créer/modifier les offres de leurs propres orgs
create policy "offers_select_own" on public.offers
  for select
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_id = auth.uid()
    )
  );

create policy "offers_insert_own" on public.offers
  for insert
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_id = auth.uid()
    )
  );

create policy "offers_update_own" on public.offers
  for update
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_id = auth.uid()
    )
  );

create policy "offers_delete_own" on public.offers
  for delete
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_id = auth.uid()
    )
  );

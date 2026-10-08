-- Offers table
create table offers (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  recruiter_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  sport text not null,
  country text not null,
  level text check (level in ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
  positions text[] not null,
  applicant_count integer default 0 not null check (applicant_count >= 0),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Applications table
create table applications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  athlete_id uuid not null references auth.users(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(offer_id, athlete_id)
);

-- RLS Policies
alter table offers enable row level security;
alter table applications enable row level security;

-- Offers: read public, create/update/delete if recruiter
create policy "offers_read_public"
  on offers for select
  using (true);

create policy "offers_create_auth"
  on offers for insert
  with check (recruiter_id = auth.uid());

create policy "offers_update_owner"
  on offers for update
  using (recruiter_id = auth.uid());

create policy "offers_delete_owner"
  on offers for delete
  using (recruiter_id = auth.uid());

-- Applications: athletes can read own, recruiters can read team's
create policy "applications_read_own"
  on applications for select
  using (
    athlete_id = auth.uid() or
    exists(select 1 from offers where id = offer_id and recruiter_id = auth.uid())
  );

create policy "applications_create_auth"
  on applications for insert
  with check (athlete_id = auth.uid());

create policy "applications_update_recruiter"
  on applications for update
  using (
    exists(select 1 from offers where id = offer_id and recruiter_id = auth.uid())
  );

-- Indexes
create index idx_offers_team_id on offers(team_id);
create index idx_offers_recruiter_id on offers(recruiter_id);
create index idx_offers_sport on offers(sport);
create index idx_offers_country on offers(country);
create index idx_applications_offer_id on applications(offer_id);
create index idx_applications_athlete_id on applications(athlete_id);
create index idx_applications_status on applications(status);

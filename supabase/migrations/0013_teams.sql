-- Teams table
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text,
  country text not null,
  recruiter_id uuid not null references auth.users(id) on delete cascade,
  member_count integer default 1 not null check (member_count > 0),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Team members table
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  role text check (role in ('owner', 'scout')) default 'scout',
  joined_at timestamp with time zone default now(),
  unique(team_id, member_id)
);

-- RLS Policies
alter table teams enable row level security;
alter table team_members enable row level security;

-- Teams: read if recruiter or member, create if authenticated
create policy "teams_read_own_or_member"
  on teams for select
  using (
    recruiter_id = auth.uid() or
    exists(select 1 from team_members where team_id = id and member_id = auth.uid())
  );

create policy "teams_create_auth"
  on teams for insert
  with check (recruiter_id = auth.uid());

create policy "teams_update_owner"
  on teams for update
  using (recruiter_id = auth.uid());

create policy "teams_delete_owner"
  on teams for delete
  using (recruiter_id = auth.uid());

-- Team members: read if owner or member, manage if owner
create policy "team_members_read"
  on team_members for select
  using (
    member_id = auth.uid() or
    exists(select 1 from teams where id = team_id and recruiter_id = auth.uid())
  );

create policy "team_members_insert_owner"
  on team_members for insert
  with check (
    exists(select 1 from teams where id = team_id and recruiter_id = auth.uid())
  );

create policy "team_members_delete_owner"
  on team_members for delete
  using (
    exists(select 1 from teams where id = team_id and recruiter_id = auth.uid())
  );

-- Indexes
create index idx_teams_recruiter_id on teams(recruiter_id);
create index idx_team_members_member_id on team_members(member_id);
create index idx_team_members_team_id on team_members(team_id);

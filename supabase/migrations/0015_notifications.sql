-- Notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('follow', 'like', 'comment', 'application', 'message')),
  actor_id uuid not null references auth.users(id) on delete cascade,
  content text,
  related_entity_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table notifications enable row level security;

create policy "notifications_read_own"
  on notifications for select
  using (user_id = auth.uid());

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_is_read on notifications(is_read);

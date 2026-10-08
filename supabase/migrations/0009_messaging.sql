-- Messagerie temps réel : conversations et messages directs entre athlètes et recruteurs.
--
-- Une conversation = un fil privé entre deux utilisateurs (athlète ↔ recruteur).
-- Les messages sont stockés avec horodatage pour le tri + streaming.
-- Supabase Realtime broadcastera les nouveaux messages à tous les abonnés
-- d'une conversation.

-- Conversations privées (1:1)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1_id uuid not null references public.profiles (id) on delete cascade,
  participant_2_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Garantir unicité : une seule conversation par paire d'utilisateurs
  constraint conversation_unique_participants
    unique (
      least(participant_1_id, participant_2_id),
      greatest(participant_1_id, participant_2_id)
    ),
  
  -- Éviter une conversation avec soi-même
  constraint conversation_different_participants
    check (participant_1_id != participant_2_id)
);

comment on table public.conversations is
  'Conversations privées 1:1 entre deux utilisateurs. Réplicable via Supabase Realtime.';

create index conversations_p1_idx on public.conversations (participant_1_id, updated_at desc);
create index conversations_p2_idx on public.conversations (participant_2_id, updated_at desc);

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row
  execute function public.set_updated_at();

alter table public.conversations enable row level security;

-- Chaque participant ne voit que ses propres conversations
create policy "conversations_select_participant" on public.conversations
  for select
  using (
    auth.uid() = participant_1_id
    or auth.uid() = participant_2_id
  );

create policy "conversations_insert_participant" on public.conversations
  for insert
  with check (
    auth.uid() = participant_1_id
    or auth.uid() = participant_2_id
  );

create policy "conversations_update_participant" on public.conversations
  for update
  using (
    auth.uid() = participant_1_id
    or auth.uid() = participant_2_id
  )
  with check (
    auth.uid() = participant_1_id
    or auth.uid() = participant_2_id
  );

-- Suppression : chaque participant peut supprimer la conversation
-- (cascade supprime aussi les messages)
create policy "conversations_delete_participant" on public.conversations
  for delete
  using (
    auth.uid() = participant_1_id
    or auth.uid() = participant_2_id
  );

-- Messages dans une conversation
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  
  -- Vérifier que le sender est bien un participant de la conversation
  constraint message_sender_is_participant
    check (exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1_id = sender_id or c.participant_2_id = sender_id)
    ))
);

comment on table public.messages is
  'Messages d''une conversation privée. À broadcaster via Supabase Realtime.';

create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index messages_sender_idx on public.messages (sender_id);
create index messages_unread_idx on public.messages (conversation_id, read_at);

alter table public.messages enable row level security;

-- Accès indirect : seuls les participants de la conversation peuvent voir/créer les messages
create policy "messages_select_participant" on public.messages
  for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1_id = auth.uid() or c.participant_2_id = auth.uid())
    )
  );

create policy "messages_insert_participant" on public.messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1_id = auth.uid() or c.participant_2_id = auth.uid())
    )
  );

create policy "messages_update_own" on public.messages
  for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

create policy "messages_delete_own" on public.messages
  for delete
  using (auth.uid() = sender_id);

-- Assistant IA de scouting : historique de conversation (ai_conversations,
-- ai_messages) et journal des recherches structurées (ai_search_logs).
--
-- Portée de cette migration : schéma de données + RLS uniquement (étape 1
-- de l'assistant, voir docs/SPEC.md section 9). La couche d'outils
-- (search_athletes, get_athlete_details, ...) et l'appel LLM seront
-- ajoutés aux étapes suivantes ; le LLM n'accède JAMAIS directement à ces
-- tables ni à la base (tout passe par des routes serveur / server actions
-- qui appliquent ces mêmes politiques RLS via le client Supabase de
-- l'utilisateur authentifié).
--
-- NOTE : la table `recruiter_verifications` (étape "Vérification
-- recruteurs/clubs") n'existe pas encore. En attendant, l'accès est
-- restreint au rôle ('recruiter', 'organization') uniquement ; il faudra
-- resserrer `public.is_verified_recruiter()` dès que cette table existera,
-- sans avoir à modifier les tables ci-dessous.

-- Centralise la condition d'accès à l'assistant IA (recruteur/club
-- vérifié). Isolée dans une fonction pour pouvoir la resserrer plus tard
-- (ajout de la vérification réelle) sans toucher aux policies qui
-- l'utilisent.
create or replace function public.is_verified_recruiter(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role in ('recruiter', 'organization')
  );
$$;

comment on function public.is_verified_recruiter(uuid) is
  'Condition d''accès à l''assistant IA de scouting. Placeholder basé sur le rôle en attendant la table recruiter_verifications ; à resserrer sans changer les policies appelantes.';

-- Une conversation = un fil de discussion avec l'assistant, pour un
-- recruteur donné.
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.profiles (id) on delete cascade,
  title text check (title is null or char_length(title) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ai_conversations is
  'Fils de conversation avec l''assistant IA de scouting, un par recruteur/recherche.';

create index ai_conversations_recruiter_idx on public.ai_conversations (recruiter_id, updated_at desc);

create trigger ai_conversations_set_updated_at
  before update on public.ai_conversations
  for each row
  execute function public.set_updated_at();

alter table public.ai_conversations enable row level security;

-- Lecture/écriture : uniquement ses propres conversations. Pas d'accès
-- "admin" en V1 (hors périmètre de cette étape).
create policy "ai_conversations_select_own" on public.ai_conversations
  for select
  using (auth.uid() = recruiter_id);

create policy "ai_conversations_insert_own" on public.ai_conversations
  for insert
  with check (
    auth.uid() = recruiter_id
    and public.is_verified_recruiter(auth.uid())
  );

create policy "ai_conversations_update_own" on public.ai_conversations
  for update
  using (auth.uid() = recruiter_id)
  with check (auth.uid() = recruiter_id);

-- Suppression : permet à l'utilisateur d'effacer son historique
-- (minimisation RGPD demandée dans le cahier des charges).
create policy "ai_conversations_delete_own" on public.ai_conversations
  for delete
  using (auth.uid() = recruiter_id);

-- Un message dans une conversation : utilisateur, assistant, ou résultat
-- d'outil (tool calling). `tool_payload` ne contient jamais de données
-- brutes de profil (bios/médias) : uniquement des références (ids) et des
-- filtres/scores, pour limiter ce qui est journalisé et envoyé au LLM.
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content text check (content is null or char_length(content) <= 8000),
  tool_name text check (
    tool_name is null
    or tool_name in (
      'search_athletes',
      'get_athlete_details',
      'compare_athletes',
      'save_to_favorites'
    )
  ),
  tool_payload jsonb,
  created_at timestamptz not null default now()
);

comment on table public.ai_messages is
  'Messages d''une conversation avec l''assistant IA (utilisateur, assistant, ou appel/résultat d''outil).';

create index ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);

alter table public.ai_messages enable row level security;

-- Accès indirect via la conversation parente : évite de dupliquer
-- recruiter_id sur chaque message tout en gardant une policy simple.
create policy "ai_messages_select_own" on public.ai_messages
  for select
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.recruiter_id = auth.uid()
    )
  );

create policy "ai_messages_insert_own" on public.ai_messages
  for insert
  with check (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.recruiter_id = auth.uid()
    )
  );

create policy "ai_messages_delete_own" on public.ai_messages
  for delete
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.recruiter_id = auth.uid()
    )
  );

-- Journal des recherches structurées exécutées par l'assistant (filtres
-- Zod validés, nombre de résultats). Sert à la mise en cache des
-- recherches identiques et à l'audit ; jamais de contenu de profil brut.
-- Conservation limitée dans le temps (purge applicative configurable, cf.
-- `expires_at`), conformément à la minimisation RGPD demandée.
create table public.ai_search_logs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.ai_conversations (id) on delete set null,
  filters jsonb not null,
  result_count integer not null default 0 check (result_count >= 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

comment on table public.ai_search_logs is
  'Journal minimal des recherches structurées de l''assistant IA (filtres + nombre de résultats), pour cache et audit. Purge via expires_at.';

create index ai_search_logs_recruiter_idx on public.ai_search_logs (recruiter_id, created_at desc);
create index ai_search_logs_expires_idx on public.ai_search_logs (expires_at);

alter table public.ai_search_logs enable row level security;

create policy "ai_search_logs_select_own" on public.ai_search_logs
  for select
  using (auth.uid() = recruiter_id);

create policy "ai_search_logs_insert_own" on public.ai_search_logs
  for insert
  with check (
    auth.uid() = recruiter_id
    and public.is_verified_recruiter(auth.uid())
  );

create policy "ai_search_logs_delete_own" on public.ai_search_logs
  for delete
  using (auth.uid() = recruiter_id);

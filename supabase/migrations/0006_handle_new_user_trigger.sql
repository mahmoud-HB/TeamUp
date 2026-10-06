-- Trigger de création automatique d'une ligne `profiles` à l'inscription
-- (auth.users). Le rôle est lu depuis les métadonnées fournies au moment
-- du signUp (`options.data.role`) ; un pseudo temporaire est généré, à
-- personnaliser ensuite dans le formulaire guidé de profil.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'athlete');
  if requested_role not in ('athlete', 'recruiter', 'organization') then
    requested_role := 'athlete';
  end if;

  insert into public.profiles (id, role, username)
  values (
    new.id,
    requested_role,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Crée automatiquement un profil Scoutly minimal à chaque inscription Supabase Auth.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

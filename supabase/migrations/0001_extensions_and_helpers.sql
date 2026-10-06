-- Extensions nécessaires et fonctions utilitaires partagées, réutilisées
-- par les politiques RLS des migrations suivantes (évite toute duplication
-- de logique de visibilité).

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- Indique si une date de naissance correspond à une personne mineure
-- (moins de 18 ans). Marquée STABLE (et non IMMUTABLE) car elle dépend de
-- current_date.
create or replace function public.is_minor(birth_date date)
returns boolean
language sql
stable
as $$
  select birth_date is not null and birth_date > (current_date - interval '18 years');
$$;

comment on function public.is_minor(date) is
  'Vrai si la date de naissance correspond à une personne de moins de 18 ans.';

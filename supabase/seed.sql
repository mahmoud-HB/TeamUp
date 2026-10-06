-- Données de référence pour le développement local (sports et postes).
-- Exécuté par `supabase db reset` / `supabase start`, jamais en production
-- via les migrations versionnées.

insert into public.sports (slug, name_fr, name_en) values
  ('football', 'Football', 'Football'),
  ('basketball', 'Basketball', 'Basketball'),
  ('rugby', 'Rugby', 'Rugby'),
  ('handball', 'Handball', 'Handball'),
  ('tennis', 'Tennis', 'Tennis'),
  ('esport', 'Esport', 'Esports')
on conflict (slug) do nothing;

insert into public.positions (sport_id, slug, name_fr, name_en)
select s.id, p.slug, p.name_fr, p.name_en
from public.sports s
join (values
  ('football', 'goalkeeper', 'Gardien', 'Goalkeeper'),
  ('football', 'center_back', 'Défenseur central', 'Center back'),
  ('football', 'fullback', 'Latéral', 'Fullback'),
  ('football', 'midfielder', 'Milieu', 'Midfielder'),
  ('football', 'forward', 'Attaquant', 'Forward'),
  ('basketball', 'point_guard', 'Meneur', 'Point guard'),
  ('basketball', 'shooting_guard', 'Arrière', 'Shooting guard'),
  ('basketball', 'small_forward', 'Ailier', 'Small forward'),
  ('basketball', 'power_forward', 'Ailier fort', 'Power forward'),
  ('basketball', 'center', 'Pivot', 'Center'),
  ('rugby', 'prop', 'Pilier', 'Prop'),
  ('rugby', 'fly_half', 'Ouvreur', 'Fly-half'),
  ('rugby', 'fullback', 'Arrière', 'Fullback'),
  ('handball', 'goalkeeper', 'Gardien', 'Goalkeeper'),
  ('handball', 'pivot', 'Pivot', 'Pivot'),
  ('handball', 'winger', 'Ailier', 'Winger')
) as p(sport_slug, slug, name_fr, name_en)
  on p.sport_slug = s.slug
on conflict (sport_id, slug) do nothing;

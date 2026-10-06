# Cahier des charges – GameLink (nom provisoire)

*Le « LinkedIn des joueurs » : réseau professionnel et communautaire pour joueurs, équipes, créateurs et recruteurs de l'écosystème gaming/esport.*

> Hypothèse : « joueur » = joueur de jeux vidéo (casual, compétitif, esport). Si tu pensais à des sportifs, la structure reste valable, seuls les champs « jeux/rôles » changent.

---

## 1. Vision et objectifs

- Permettre à un joueur de **construire un profil crédible** (jeux, rang, rôle, palmarès, clips).
- **Trouver des coéquipiers, équipes, coachs, tournois** et opportunités (recrutement, sponsoring, casting).
- Offrir aux **équipes/organisations** une page publique et un outil de recrutement.
- **Objectifs mesurables (6 mois après lancement)** : 5 000 profils créés, 30 % de profils complétés à plus de 80 %, 500 mises en relation par mois.

## 2. Cibles (personas)

| Persona | Besoin principal |
|---|---|
| Joueur compétitif | Se faire repérer, trouver une team |
| Joueur casual | Trouver des partenaires de jeu fiables |
| Capitaine / manager d'équipe | Recruter, gérer l'effectif |
| Organisateur de tournois | Promouvoir et inscrire des équipes |
| Coach / créateur de contenu | Visibilité, clients, audience |

## 3. Périmètre fonctionnel

### MVP (priorité 1)
1. **Authentification** : email + mot de passe, Google, Discord ; vérification email ; réinitialisation.
2. **Profil joueur** : pseudo, photo, bio, pays/langue, disponibilités, plateformes (PC/console/mobile), jeux joués avec rang, rôle et heures de jeu, liens (Twitch, YouTube, Discord, Steam), palmarès, clips/vidéos (liens).
3. **Pages équipes** : création, logo, description, jeux, membres et rôles, offres de recrutement.
4. **Réseau** : suivre/connecter, recommandations de profils (jeu, niveau, langue).
5. **Fil d'actualité** : posts texte/image/lien/clip, likes, commentaires, partage, hashtags.
6. **Recherche et filtres** : joueurs, équipes, offres (jeu, rang, rôle, pays, plateforme, disponibilité).
7. **Offres de recrutement** : publication par une équipe, candidature en un clic.
8. **Messagerie privée** (1-à-1) avec notifications.
9. **Notifications** : in-app + email (push en V2).
10. **Modération** : signalement, blocage, back-office admin basique.

### V2
- Groupes de messages, communautés par jeu, événements/tournois avec inscriptions.
- **Vérification de rang** via API éditeurs (Riot, Steam, etc.) et badge « profil vérifié ».
- Endorsements/avis de coéquipiers, système de réputation.
- Notifications push, mode hors-ligne partiel.
- Offres premium (boost de profil, stats), espace sponsors/recruteurs.

### Hors périmètre initial
Streaming vidéo hébergé, paiement entre utilisateurs, jeu intégré.

## 4. Parcours clés
1. Inscription → choix des jeux → complétion de profil guidée → suggestions d'équipes/joueurs.
2. Capitaine : création d'équipe → publication d'une offre → réception de candidatures → message → recrutement.
3. Joueur : recherche d'offres → filtre → candidature → suivi du statut.

## 5. Exigences non fonctionnelles
- **Responsive mobile-first**, compatible WebView (iOS/Android) via Capacitor ; PWA installable.
- **Performance** : LCP < 2,5 s sur 4G ; pagination/infinite scroll.
- **Sécurité** : HTTPS, hash des mots de passe, protection CSRF/XSS, rate limiting, validation serveur, RLS en base.
- **RGPD** : consentement, export et suppression des données, politique de confidentialité, cookies.
- **Mineurs** : âge minimum 13 ans (16 selon pays), restrictions de messagerie pour les mineurs, modération renforcée.
- **Accessibilité** : WCAG AA, thème sombre par défaut + clair.
- **i18n** : français et anglais dès le départ.
- **Disponibilité** : 99,5 %, sauvegardes quotidiennes.

## 6. Architecture technique proposée

| Couche | Choix |
|---|---|
| Front web | Next.js (React, TypeScript), Tailwind CSS, shadcn/ui |
| Mobile | Capacitor (WebView) encapsulant la PWA ; plugins push/caméra |
| Backend / BDD | Supabase (PostgreSQL, Auth, Storage, Realtime) ou NestJS + PostgreSQL |
| Temps réel | Supabase Realtime / WebSocket (messagerie, notifications) |
| Recherche | PostgreSQL full-text (puis Meilisearch si besoin) |
| Médias | Storage + CDN, redimensionnement d'images |
| Emails | Resend ou Brevo |
| Hébergement | Vercel + Supabase ; CI/CD GitHub Actions |
| Qualité | ESLint, Prettier, Vitest, Playwright, Sentry |

## 7. Modèle de données (simplifié)

- `users` (id, email, role, created_at)
- `profiles` (user_id, pseudo, avatar, bio, country, languages, platforms, availability, links)
- `games` (id, name, genre, platforms) · `profile_games` (profile_id, game_id, rank, role, hours)
- `teams` (id, name, logo, description, owner_id) · `team_members` (team_id, profile_id, role)
- `job_posts` (id, team_id, game_id, role, min_rank, description, status) · `applications` (id, post_id, profile_id, message, status)
- `connections` (follower_id, followed_id, status)
- `posts` (id, author_id, content, media, created_at) · `comments` · `likes`
- `conversations` · `messages` · `notifications` · `reports`

## 8. Écrans principaux
Accueil/fil · Profil (public/édition) · Page équipe · Recherche · Offres (liste/détail) · Candidatures · Messagerie · Notifications · Paramètres · Back-office admin.

## 9. Design
Univers gaming sobre et professionnel (pas un « skin » flashy) : thème sombre, couleur d'accent unique, typographie lisible, composants cohérents, badges de rang et de jeux.

## 10. Planning indicatif

| Phase | Durée | Contenu |
|---|---|---|
| 0 – Cadrage | 1–2 sem. | Maquettes, choix techniques, backlog |
| 1 – Fondations | 2 sem. | Auth, profils, jeux, UI de base |
| 2 – Social | 3 sem. | Fil, réseau, recherche |
| 3 – Équipes et offres | 3 sem. | Équipes, offres, candidatures |
| 4 – Messagerie et notifs | 2 sem. | Temps réel, emails |
| 5 – Mobile et recette | 2 sem. | Capacitor, tests, modération, bêta |

## 11. Risques

| Risque | Mitigation |
|---|---|
| Effet « réseau vide » au lancement | Lancer sur 1–2 jeux/communautés Discord ciblés |
| Contenus toxiques, harcèlement | Signalement, filtres, modération, règles claires |
| Mineurs | Restrictions, vérification d'âge, conformité légale |
| Fausses déclarations de rang | Vérification via API en V2 |
| Surcoût | MVP strict, services managés |

## 12. Critères d'acceptation MVP
Tous les parcours du §4 fonctionnent sur mobile et desktop ; aucun bug bloquant ; tests E2E verts sur les parcours critiques ; conformité RGPD de base ; app Capacitor installable sur Android et iOS (bêta).

---

# Prompt à envoyer à GitHub Copilot

> À coller dans Copilot Chat (mode Agent). Pour de meilleurs résultats, ajoute ce cahier des charges en fichier `docs/SPEC.md` dans le dépôt et procède **étape par étape** (une phase à la fois).

```text
Tu es un développeur senior full-stack (Next.js, TypeScript, Supabase). Tu vas m'aider à construire "GameLink", un réseau social/professionnel pour joueurs de jeux vidéo (type LinkedIn : profils, équipes, offres de recrutement, réseau, messagerie). L'application est web (responsive, mobile-first) et sera encapsulée en application mobile via Capacitor (WebView).

CONTEXTE
- Le cahier des charges complet est dans docs/SPEC.md : lis-le avant toute action et respecte-le.
- Langues : interface en français et anglais (i18n avec next-intl).

STACK IMPOSÉE
- Next.js (App Router) + TypeScript strict, Tailwind CSS, shadcn/ui
- Supabase : PostgreSQL, Auth (email, Google, Discord), Storage, Realtime, Row Level Security
- Validation : Zod ; formulaires : React Hook Form ; état serveur : TanStack Query
- Tests : Vitest (unitaires), Playwright (E2E) ; lint : ESLint + Prettier
- PWA installable ; compatibilité Capacitor (pas d'API serveur dépendant de cookies tiers)

RÈGLES DE DÉVELOPPEMENT
1. Travaille par petites étapes. Avant de coder, propose un plan court et attends ma validation.
2. Structure claire : /app, /components, /lib, /features/<domaine>, /supabase/migrations, /docs.
3. Écris des migrations SQL versionnées avec RLS activée sur toutes les tables ; aucune table sans politique.
4. Sécurité : validation côté serveur, jamais de secrets dans le code (.env + .env.example), rate limiting sur les routes sensibles, échappement des contenus utilisateur.
5. UI : mobile-first, thème sombre par défaut, accessible (WCAG AA), états de chargement/erreur/vide sur chaque écran.
6. Code : composants petits et typés, pas de `any`, nommage explicite, commentaires uniquement quand utile.
7. Ajoute des tests pour chaque fonctionnalité et mets à jour le README.
8. À la fin de chaque étape : liste les fichiers créés/modifiés, comment lancer et tester, et la prochaine étape proposée.

ÉTAPE 1 (commence par celle-ci)
- Initialise le projet Next.js + Tailwind + shadcn/ui + next-intl (fr/en) et la configuration lint/test.
- Configure Supabase (client serveur/navigateur) et l'authentification (email/mot de passe, Google, Discord) avec pages inscription, connexion, mot de passe oublié.
- Crée les migrations pour : users/profiles, games, profile_games, avec RLS (lecture publique des profils, écriture par le propriétaire uniquement).
- Construis le layout de base responsive (barre de navigation mobile en bas, latérale sur desktop) et la page d'édition de profil guidée (pseudo, avatar, bio, pays, plateformes, jeux avec rang et rôle).
- Fournis les tests unitaires de validation Zod et un test E2E du parcours inscription → complétion de profil.

ÉTAPES SUIVANTES (ne pas les faire maintenant) : fil d'actualité, réseau (follow/connexions), recherche et filtres, équipes, offres et candidatures, messagerie temps réel, notifications, modération/admin, packaging Capacitor.

Si une information manque ou si un choix est ambigu, pose-moi la question avant de continuer.
```

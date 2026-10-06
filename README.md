# Scoutly

Plateforme web (mobile-first, encapsulable via Capacitor) de repérage de
talents sportifs : profils athlètes, recherche/filtres, recrutement,
messagerie, et (à venir) un assistant IA de scouting pour les recruteurs
vérifiés.

Le cahier des charges complet est dans [`docs/SPEC.md`](docs/SPEC.md) —
à lire avant toute évolution du produit.

## Stack

- **Next.js** (App Router) + TypeScript strict, **Tailwind CSS**, **shadcn/ui**
- **Supabase** : PostgreSQL, Auth (email, Google, Discord), Storage, Realtime, RLS
- **next-intl** (fr/en), **Zod**, **React Hook Form**, **TanStack Query**
- Tests : **Vitest** (unitaires), **Playwright** (E2E) ; lint : **ESLint** + Prettier

## Prérequis

- Node.js 20+
- npm
- Un projet Supabase (cloud ou local via `supabase start` + Docker) pour que
  l'authentification et les données fonctionnent réellement

## Installation

```bash
npm install
cp .env.example .env.local
# Renseignez .env.local avec vos identifiants Supabase (voir ci-dessous)
```

### Variables d'environnement (`.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (anon) Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé de service (serveur uniquement, jamais exposée au client) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (callbacks OAuth, emails) |

Tant que ces valeurs restent les placeholders livrés par défaut
(`xxxxxxxxxxxx.supabase.co`), l'authentification réelle ne fonctionnera pas :
les pages s'affichent mais les appels Supabase échoueront.

### Base de données

Les migrations SQL versionnées (RLS activée sur toutes les tables) sont dans
`supabase/migrations/`. Pour les appliquer :

```bash
npx supabase link --project-ref <votre-projet>   # projet distant
# ou
npx supabase start                                # stack locale (nécessite Docker)
npx supabase db push
```

Des données de référence (sports, postes) sont fournies dans
`supabase/seed.sql`.

## Lancer le projet

```bash
npm run dev      # serveur de développement (http://localhost:3000)
npm run build    # build de production
npm run start    # lancer le build de production
npm run lint     # ESLint
```

## Tests

```bash
npm run test         # tests unitaires (Vitest) : schémas Zod, règles métier (mineurs, etc.)
npm run test:watch   # idem, en mode watch
npm run test:e2e     # tests end-to-end (Playwright)
```

### Tests E2E et Supabase

Le test `e2e/signup-profile-completion.spec.ts` couvre le parcours complet
**inscription → connexion → complétion du profil guidé**. Il nécessite un
vrai projet Supabase (local ou distant) avec la **confirmation d'e-mail
désactivée** pour l'environnement de test (sinon l'inscription reste en
attente de confirmation et ne peut pas être automatisée).

Tant que `NEXT_PUBLIC_SUPABASE_URL` contient la valeur placeholder par
défaut, ce test est **automatiquement ignoré (`skip`)** pour ne pas faire
échouer la CI ou les lancements locaux sans backend réel. Pour l'exécuter
réellement : configurez un projet Supabase de test (`supabase start`
recommandé), désactivez `enable_confirmations` dans `supabase/config.toml`
(`[auth.email]`), renseignez `.env.local`, puis relancez `npm run test:e2e`.

## Mode démo (données fictives)

Pour visualiser et tester l'application de bout en bout **sans backend
Supabase réel**, un mode démo dev-only est disponible :

- `.env.local` doit contenir `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true` (jamais actif
  en production, voir `src/lib/dev-auth.ts` → `isDevBypassEnabled()`).
- Sur `/login`, deux boutons « Démo Athlète » et « Démo Recruteur / Club »
  posent une session factice (cookies `scoutly-dev-bypass` /
  `scoutly-dev-role`) et donnent accès à l'application avec un jeu de
  données 100% fictives (`src/lib/mock/`) : 8 profils athlètes (football,
  basketball, volleyball, rugby), 3 organisations/recruteurs, 2 offres.
- Les deux rôles ont des interfaces dédiées : tableau de bord, navigation et
  page de recherche diffèrent (athlète → offres/complétion de profil,
  recruteur → recherche filtrée + fiches athlètes détaillées + favoris/
  demande de contact).
- Un bandeau « Mode démo » s'affiche en permanence et un tutoriel de
  bienvenue (`src/components/onboarding/onboarding-tour.tsx`) apparaît une
  fois par rôle à la première connexion (flag `localStorage`).
- La recherche fictive (`searchMockAthletes`) applique les mêmes règles que
  les futures RLS réelles : les profils mineurs et privés ne sont jamais
  renvoyés à un recruteur.

## Structure du projet

```
src/app/[locale]/        Pages (App Router), routes groupées (auth) / (app)
src/components/          Composants UI partagés (layout, providers, shadcn/ui)
src/features/<domaine>/  Logique métier par domaine (auth, profile, ...)
src/lib/                 Clients Supabase, validations Zod, utilitaires
src/i18n/                Configuration next-intl (routing, navigation, requêtes)
messages/                Catalogues de traduction (fr.json, en.json)
supabase/migrations/     Migrations SQL versionnées, RLS sur toutes les tables
e2e/                     Tests Playwright
docs/SPEC.md             Cahier des charges (source de vérité fonctionnelle)
```

## Sécurité

- Validation Zod systématique **côté serveur**, en plus de la validation client.
- RLS activée sur toutes les tables ; voir `public.can_view_profile()` dans
  `supabase/migrations/0002_profiles.sql` pour la logique centrale de
  visibilité (y compris la protection des profils mineurs).
- Aucune donnée de contact ni de localisation précise des athlètes mineurs
  n'est jamais exposée.
- Secrets uniquement via variables d'environnement (`.env.local`, jamais
  commité — voir `.gitignore`).

## État d'avancement

- ✅ Étape 1 : scaffolding, auth (email + Google/Discord), migrations
  profils/sports, layout responsive, assistant de complétion de profil, tests.
- ✅ Mode démo : données fictives, interfaces athlète/recruteur, design
  modernisé, tutoriel d'onboarding (sans backend requis).
- 🚧 Assistant IA de scouting (`docs/SPEC.md`, section 9) :
  - ✅ Étape 1/5 : schéma de données + migrations RLS (`ai_conversations`,
    `ai_messages`, `ai_search_logs`), voir
    `supabase/migrations/0007_ai_scouting.sql`.
  - ⏳ Étapes suivantes : couche outils + recherche + score, intégration
    LLM/streaming, UI du chat, garde-fous/quotas/tests.
- ⏳ Reste de la feuille de route : fil d'actualité, réseau, recherche/filtres
  avancés réels, équipes/offres, messagerie temps réel, notifications,
  modération/admin, packaging Capacitor.

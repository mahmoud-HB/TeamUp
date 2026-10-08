# 🚀 Production Setup & Deployment Guide

Cette guide couvre:
1. **Configuration Supabase réelle** (switch de demo → production)
2. **Push des migrations** vers la DB
3. **Déploiement sur Vercel**
4. **Configuration des services externes** (email, analytics, push)

---

## Step 1: Configuration Supabase

### 1a. Créer un projet Supabase

1. Allez sur https://supabase.com/dashboard
2. Cliquez "New Project"
3. Nommez le projet "gamelink"
4. Choisissez une région (ex: Europe)
5. Générez un mot de passe fort
6. Attendez la création (~1 min)

### 1b. Récupérer les credentials

Dans le tableau de bord Supabase:
- Aller dans **Settings → API**
- Copier:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (kept secret)

### 1c. Ajouter les variables d'environnement

Fichier `.env.local`:

```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Switch mode (CRITICAL)
NEXT_PUBLIC_DEMO_MODE=false

# Site URL for redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Integrations
RESEND_API_KEY=your-resend-key
SENTRY_DSN=your-sentry-dsn
VAPID_PUBLIC_KEY=your-vapid-key
```

### 1d. Valider la connexion

```bash
npm run dev
# Aller sur http://localhost:3000/login
# Tenter une inscription avec email/password
```

---

## Step 2: Pousser les Migrations

### 2a. Installer Supabase CLI

```bash
npm install -g supabase
```

### 2b. Se connecter à Supabase

```bash
supabase login
# Vous serez redirigé vers https://app.supabase.com/account/tokens/new
# Générer un access token et le coller dans le terminal
```

### 2c. Lier le projet

```bash
cd "/Users/HAJBELM/MHB Perso/Teamup"
supabase link --project-ref your-project-ref
# Confirmez avec votre database password
```

### 2d. Pousser les migrations

```bash
supabase db push
# Les 15 migrations vont s'exécuter:
# - 0001_users_profiles.sql
# - 0002_games.sql
# - ...
# - 0015_notifications.sql

# Vérifiez dans Supabase Dashboard → SQL Editor → "migrations"
```

### 2e. Activer RLS (Row Level Security)

Les migrations incluent déjà les RLS policies, mais vérifiez:
- Supabase Dashboard → Authentication → Policies
- Chaque table doit avoir des policies pour:
  - **SELECT**: public (ou authenticated)
  - **INSERT**: authenticated + owner check
  - **UPDATE**: authenticated + owner check
  - **DELETE**: authenticated + owner check

---

## Step 3: Configuration des Services Externes

### 3a. Email (Resend)

1. Créer un compte sur https://resend.com
2. Générer une API key
3. Ajouter à `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
4. Éditer `/src/app/api/emails/password-reset/route.ts`:
   ```typescript
   // Décommenter le block Resend et ajouter votre configuration
   const response = await fetch('https://api.resend.com/emails', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       from: 'noreply@gamelink.app',
       to: email,
       subject: 'Reset your password',
       html: `<a href="${resetLink}">Reset password</a>`
     })
   })
   ```

### 3b. Notifications web (FCM - optionnel)

1. Créer un projet Firebase: https://console.firebase.google.com
2. Générer les credentials (VAPID key)
3. Ajouter à `.env.local`:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
   FIREBASE_ADMIN_SDK=your-firebase-credentials.json
   ```

### 3c. Analytics (Vercel + Sentry)

**Vercel Analytics** (gratuit, inclus):
- Automatiquement activé sur Vercel
- Voir les analytics dans le dashboard Vercel

**Sentry** (optionnel, pour error tracking):
1. Créer un compte sur https://sentry.io
2. Créer un projet Next.js
3. Ajouter à `.env.local`:
   ```env
   SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

---

## Step 4: Déploiement sur Vercel

### 4a. Préparer le projet

```bash
cd "/Users/HAJBELM/MHB Perso/Teamup"

# Vérifier que tout est clean
git status
# Doit être: "On branch main, nothing to commit"

# Sinon commit:
git add .
git commit -m "chore: ready for production"
```

### 4b. Déployer

**Option 1: Via Vercel CLI (recommandé)**

```bash
vercel deploy --prod
# Vercel va:
# - Demander de confirmer le projet
# - Builder l'app
# - Déployer sur https://your-project.vercel.app
```

**Option 2: Via GitHub**

1. Push le code sur GitHub:
   ```bash
   git remote add origin https://github.com/your-username/gamelink.git
   git push -u origin main
   ```
2. Allez sur https://vercel.com/new
3. Sélectionnez le repository
4. Vercel va auto-detect `next.config.ts`
5. Cliquez "Deploy"

### 4c. Ajouter les variables d'environnement à Vercel

Dans le dashboard Vercel:
1. Project → Settings → Environment Variables
2. Ajouter:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_DEMO_MODE=false
   RESEND_API_KEY=... (si utilisé)
   SENTRY_DSN=... (si utilisé)
   ```

### 4d. Vérifier le déploiement

```bash
# Voir le lien de déploiement
vercel --prod

# Ouvrir https://gamelink.vercel.app
# Tester: Inscription → Complétion profil → Feed
```

---

## Step 5: Vérifications de sécurité

Avant d'aller en production:

- [ ] `.env.local` n'est pas commité (check `.gitignore`)
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` en production
- [ ] Secrets (API keys) en tant que variables d'environnement Vercel
- [ ] RLS activée sur toutes les tables Supabase
- [ ] CORS configuré correctement (Supabase → Settings → CORS)
- [ ] Rate limiting activé sur les routes sensibles
- [ ] Validation côté serveur sur tous les formulaires

---

## Step 6: Surveillance & Maintenance

### Logs

**Vercel**:
- Dashboard → Deployments → View details
- Voir les erreurs et performance

**Supabase**:
- Dashboard → SQL Editor
- Voir les queries exécutées

**Erreurs (si Sentry configuré)**:
- https://sentry.io/organizations/your-org
- Voir tous les erreurs en temps réel

### Scalabilité

- **DB**: Supabase handle jusqu'à 100k connections (scaling auto)
- **Backend**: Vercel Serverless Functions scale automatiquement
- **Stockage**: Supabase Storage scale selon usage

---

## Rollback

Si quelque chose casse:

```bash
# Revert au dernier déploiement
vercel rollback

# Ou revenir à un commit spécifique
git revert <commit-hash>
git push
# Vercel va redéployer automatiquement
```

---

## Troubleshooting

| Problème | Solution |
|----------|----------|
| "Supabase connection refused" | Check NEXT_PUBLIC_SUPABASE_URL en .env.local |
| "Auth fails" | Vérifier Supabase Auth → Users (aucun user = DB vide) |
| "Migrations failed" | Exécuter `supabase db reset` pour reset local, puis `supabase db push` |
| "Service Worker not found" | Vérifier que `/public/sw.js` existe |
| "Email not sending" | Check RESEND_API_KEY est valide + domaine verified |

---

## Prochaines étapes

1. ✅ Supabase: créer projet + pousser migrations
2. ✅ Email: configurer Resend ou SendGrid
3. ✅ Vercel: déployer l'app
4. ✅ Monitoring: setup Sentry ou Vercel Analytics
5. 📧 Custom domain: acheter domain + ajouter à Vercel
6. 🔒 SSL: automatique avec Vercel
7. 📱 Capacitor: packager en app mobile

Bonne chance! 🚀

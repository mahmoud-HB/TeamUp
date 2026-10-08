# 🔮 Future Enhancements Roadmap

Fonctionnalités proposées et prêtes à être implémentées. Chaque section contient:
- ✅ Status actuel
- 🎯 Objectifs
- 📋 Tasks à faire
- 💾 Architecture nécessaire

---

## 1. Real-time Messaging (Supabase Realtime)

**Status**: 🟡 Partially Ready (Service created, needs backend)

**Objectif**: Messages instantanés avec indicateurs de frappe (typing indicators)

### Architecture

```typescript
// Déjà implémenté dans src/lib/services/realtime-service.ts
realtimeService.subscribeToMessages(conversationId, (message) => {
  // Update UI in real-time
})
```

### Tasks

- [ ] Créer table `messages_read_receipts` en migration
- [ ] Implémenter `realtimeService.subscribeToMessages()` avec Supabase
- [ ] Ajouter typing indicators via Presence channel
- [ ] Component client-side pour afficher "User is typing..."
- [ ] Test E2E: 2 utilisateurs → messages en temps réel

### Env vars à ajouter

```env
# Optionnel: Redish pour caching (si besoin de scaling)
REDIS_URL=redis://...
```

---

## 2. File Uploads (Supabase Storage)

**Status**: 🟡 Partially Ready (Service created, needs backend)

**Objectif**: Upload images (avatars, posts), documents

### Architecture

```typescript
// Déjà implémenté dans src/lib/services/storage-service.ts
const result = await storageService.uploadAvatar(userId, file)
if (result.ok) {
  console.log(result.data.url) // https://cdn.supabase.io/...
}
```

### Tasks

- [ ] Créer buckets Supabase:
  - [ ] `avatars/` (public)
  - [ ] `posts/` (public)
  - [ ] `documents/` (private)
- [ ] Configurer CORS & signed URLs
- [ ] Component upload avec preview & drag-drop
- [ ] Intégrer dans profile edit + post creation
- [ ] Test: Upload image → affiche dans feed

### Bucket Policies (RLS Supabase Storage)

```sql
-- avatars bucket: public read, owner write
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Owner Upload"
on storage.objects for insert
with check (auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 3. Email Transactional (Resend / SendGrid)

**Status**: ✅ Ready (API endpoints créés)

**Objectif**: Emails pour authentification, notifications, digests

### Architecture

```typescript
// Déjà implémenté dans src/lib/services/email-service.ts
const result = await emailService.sendPasswordReset(email, resetLink)
```

### Tasks

- [ ] Choisir provider: Resend (simple) ou SendGrid (plus puissant)
- [ ] Configurer API key en .env
- [ ] Implémenter dans `/src/app/api/emails/*`:
  - [ ] Password reset
  - [ ] Welcome email
  - [ ] Team invite
  - [ ] Offer application confirmation
  - [ ] Weekly digest
- [ ] Créer templates HTML avec branding
- [ ] Test: Inscription → reçoit welcome email

### Resend Setup (Recommandé)

```bash
# 1. Créer compte https://resend.com
# 2. Vérifier domaine (ou utiliser resend.dev pendant dev)
# 3. Ajouter API key à .env
RESEND_API_KEY=re_xxxxxxxxxxxx

# 4. Installer SDK (optionnel)
npm install resend

# 5. Utiliser dans route
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'delivered@resend.dev',
  subject: 'Hello World',
  html: '<strong>It works!</strong>',
})
```

---

## 4. Push Notifications (Service Worker + FCM)

**Status**: 🟡 Partially Ready (Service created, needs backend)

**Objectif**: Notifications web & mobiles (quand app installée)

### Architecture

```typescript
// Déjà implémenté dans src/lib/services/push-notification-service.ts
await pushNotificationService.requestPermission()
await pushNotificationService.showNotification({
  title: 'New message',
  body: 'Alice sent you a message'
})
```

### Tasks

- [ ] Créer compte Firebase: https://console.firebase.google.com
- [ ] Générer VAPID keys
- [ ] Enregistrer Service Worker (`/public/sw.js` déjà créé)
- [ ] Implémenter subscription:
  ```typescript
  const subscription = await pushNotificationService.subscribeToPush(vapidKey)
  // Sauvegarder subscription en DB
  ```
- [ ] Route backend pour envoyer notifications:
  ```bash
  POST /api/push
  { userId, title, body, data }
  ```
- [ ] Test: Activer notifications → recevoir une notification

### Firebase Setup

```bash
# 1. https://console.firebase.google.com → New Project
# 2. Messaging → Web Push Certificates
# 3. Generate new key pair → copier VAPID keys

# 4. Ajouter à .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx
FIREBASE_ADMIN_SDK=xxx

# 5. Route backend pour envoyer
// /src/app/api/push/route.ts
import * as admin from 'firebase-admin'
admin.messaging().send({
  notification: { title, body },
  webpush: { data },
  token: deviceToken
})
```

---

## 5. Analytics & Error Tracking (Sentry)

**Status**: ✅ Ready (Service créé)

**Objectif**: Monitoring production, error tracking, performance

### Architecture

```typescript
// Déjà implémenté dans src/lib/services/analytics-service.ts
analyticsService.trackEvent('user_follow', { target_id: userId })
analyticsService.trackError(error, { context: 'signup' })
```

### Tasks

- [ ] Créer compte Sentry: https://sentry.io
- [ ] Créer projet Next.js
- [ ] Ajouter SDK:
  ```bash
  npm install @sentry/nextjs
  ```
- [ ] Initialiser dans `sentry.client.config.ts`:
  ```typescript
  import * as Sentry from '@sentry/nextjs'
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  })
  ```
- [ ] Wraper les routes dans Sentry
- [ ] Dashboard: voir les erreurs en temps réel
- [ ] Setup alerts email

### Sentry Setup

```bash
# 1. Créer compte https://sentry.io
# 2. New Project → Next.js
# 3. Copier DSN

# 4. .env.local
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# 5. Tracked errors automatiquement sur production
```

---

## 6. Advanced Search Features

**Status**: 🟢 Core ready, can enhance

**Objectif**: Filtres avancés (sauvegardés, historique)

### Current Implementation

```typescript
// Déjà implémenté dans src/lib/services/search-service.ts
searchService.search(query, {
  game: 'Counter-Strike',
  rank: 'Global Elite',
  region: 'EU'
})
```

### Enhancement Tasks

- [ ] Saved filters:
  - [ ] Table `saved_searches` (user_id, name, filters JSON)
  - [ ] UI pour save/load searches
- [ ] Search history:
  - [ ] Tracer les 10 dernières searches en localStorage
  - [ ] Afficher suggestions au focus
- [ ] Faceted search:
  - [ ] Afficher counts: "Counter-Strike (542)", "Valorant (231)"
  - [ ] Refine dynamiquement
- [ ] Performance:
  - [ ] Paginer résultats (infinite scroll)
  - [ ] Cache search results (TanStack Query)
- [ ] Test: Search "Global Elite" → Filtrer par région → Save search → Recharger

---

## 7. Team Collaboration Features

**Status**: ✅ Core created, can enhance

**Objectif**: Better team management, calendar, analytics

### Enhancement Tasks

- [ ] Team calendar:
  - [ ] Table `team_events` (team_id, date, type, description)
  - [ ] UI pour afficher calendrier + events
- [ ] Team analytics:
  - [ ] Win rate par joueur
  - [ ] Performance trends
- [ ] Discord integration:
  - [ ] Bot pour sync members
  - [ ] Notifications → Discord
- [ ] Team invites:
  - [ ] Lien d'invitation unique
  - [ ] Email invite
- [ ] Test: Créer team → Inviter joueurs → Voir team dashboard

---

## 8. AI Scout Assistant (Future Phase)

**Status**: 🔴 Not started (nice-to-have)

**Objectif**: IA pour matcher recruteurs ↔ joueurs

### Proposed Architecture

```typescript
// Pseudo-code
const match = await aiScoutService.findMatches({
  recruiter_id: userId,
  team_profile: teamData,
  budget: 5000
})
// Returns: [{ player_id, match_score, reason }]
```

### High-level Tasks

- [ ] OpenAI API integration (GPT-4)
- [ ] Embeddings pour player profiles (vector search)
- [ ] Matching algorithm
- [ ] Batch processing pour recommandations
- [ ] Budget optimization

---

## 9. Admin Dashboard Enhancements

**Status**: ✅ Basic created, can enhance

**Objectif**: Better moderation tools, analytics, user management

### Enhancement Tasks

- [ ] User management:
  - [ ] Ban/suspend users
  - [ ] Verify recruiter accounts
  - [ ] Assign badges/roles
- [ ] Content moderation:
  - [ ] Bulk actions (delete multiple posts)
  - [ ] Appeal system
  - [ ] Auto-flag keywords
- [ ] Analytics:
  - [ ] Active users chart
  - [ ] Sign-ups trend
  - [ ] Retention cohorts
- [ ] Reports:
  - [ ] Export data (CSV)
  - [ ] Custom date ranges
- [ ] Test: Login as admin → Ban user → Verify user doesn't see posts

---

## 10. PWA & Offline Support

**Status**: 🟡 Partially Ready (SW créé)

**Objectif**: App fonctionne offline, sync quand online

### Architecture

```typescript
// Service Worker déjà créé: /public/sw.js
// Stratégie: network-first pour API, cache-first pour assets
```

### Tasks

- [ ] Créer `manifest.json`:
  ```json
  {
    "name": "GameLink",
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192" },
      { "src": "/icon-512.png", "sizes": "512x512" }
    ],
    "start_url": "/",
    "display": "standalone"
  }
  ```
- [ ] Implémenter offline detection:
  ```typescript
  window.addEventListener('online', syncData)
  window.addEventListener('offline', showWarning)
  ```
- [ ] Queue actions offline (IndexedDB)
- [ ] Sync quand online
- [ ] Test: Désactiver internet → App fonctionne → Reconnecter → Sync auto

---

## 11. Capacitor Mobile Packaging

**Status**: ✅ Setup ready, code compatible

**Objectif**: Native iOS/Android apps

### Tasks

```bash
# 1. Setup (first time)
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android

# 2. Build web bundle
npm run build

# 3. Sync native files
npx cap sync

# 4. Open in Xcode/Android Studio
npx cap open ios
npx cap open android

# 5. Add plugins (camera, geolocation, etc.)
npm install @capacitor/camera @capacitor/geolocation
npx cap sync

# 6. Build & submit to app stores
```

### Plugins Suggested

- `@capacitor/camera` - Photo upload
- `@capacitor/geolocation` - Location-based search
- `@capacitor/push-notifications` - Native push
- `@capacitor/share` - Share profiles

---

## 12. CI/CD Pipeline (GitHub Actions)

**Status**: 🔴 Not started

**Objectif**: Auto-test & deploy on push

### Workflow (.github/workflows/main.yml)

```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
  
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Real-time Messaging | High | Medium | 🔴 HIGH |
| File Uploads | High | Medium | 🔴 HIGH |
| Email Service | High | Low | 🔴 HIGH |
| Push Notifications | Medium | Medium | 🟡 MEDIUM |
| Analytics/Sentry | Medium | Low | 🟡 MEDIUM |
| Team Enhancements | Medium | High | 🟡 MEDIUM |
| PWA Offline | Medium | Medium | 🟡 MEDIUM |
| Admin Dashboard | Medium | Medium | 🟡 MEDIUM |
| Capacitor Mobile | High | High | 🟡 MEDIUM (Phase 2) |
| CI/CD | Medium | Low | 🟢 LOW (nice-to-have) |
| AI Scout | Low | Very High | 🟢 LOW (Phase 3) |

---

## Implementation Strategy

### Phase 1 (Semaine 1-2): MVP Production
1. ✅ Real-time Messaging
2. ✅ File Uploads
3. ✅ Email Service

### Phase 2 (Semaine 3-4): Enhancement
4. Push Notifications
5. Analytics
6. PWA Offline

### Phase 3 (Semaine 5+): Advanced
7. Capacitor Mobile
8. Team Advanced Features
9. AI Scout Assistant

---

## Code Examples

### Adding a Feature: Step-by-Step

```typescript
// 1. Create service
// src/lib/services/my-feature-service.ts
export const myFeatureService = {
  async doSomething(id: string) {
    if (isDemoMode()) {
      // Demo behavior
      return { ok: true, data: MOCK_DATA }
    }
    
    // Production with Supabase
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('my_table')
      .select('*')
      .eq('id', id)
    
    if (error) return { ok: false, error: error.message, code: 'DB_ERROR' }
    return { ok: true, data }
  }
}

// 2. Create route page
// src/app/[locale]/(app)/my-feature/page.tsx
'use client'
import { myFeatureService } from '@/lib/services'

export default async function Page() {
  const result = await myFeatureService.doSomething('123')
  
  if (!result.ok) {
    return <ErrorComponent message={result.error} />
  }
  
  return <FeatureComponent data={result.data} />
}

// 3. Write tests
// tests/services/my-feature-service.test.ts
describe('myFeatureService', () => {
  it('should return data', () => {
    const result = myFeatureService.doSomething('123')
    expect(result.ok).toBe(true)
  })
})

// 4. Create migration (if DB needed)
// supabase/migrations/0016_my_feature.sql
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data"
  ON my_table FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Summary

- ✅ **10/10 core features implemented** (demo mode working)
- ✅ **4 advanced services created** (Realtime, Storage, Email, Analytics, Push)
- ✅ **API endpoints ready** for integration
- 🔄 **Next: Pick Phase 1 features** and implement with real Supabase
- 📊 **Recommend priority**: Messaging → Uploads → Email → Mobile

**Total estimated time to full production: 3-4 weeks** (assuming 20 hrs/week)

All groundwork is done. Ready to build! 🚀

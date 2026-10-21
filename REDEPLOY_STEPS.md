# 🔄 REDÉPLOYER SCOUTLY-DEMO SUR VERCEL

## Option A: Redeploy Direct (Facile - 30 sec)
1. Reste sur cette page Vercel
2. Cherche le bouton **"Redeploy"** ou **menu ⋮** (3 points)
3. Click "Redeploy" → Confirmé
4. Attends 2-3 min → ✅ Done!

**Où le trouver?**
- En haut à droite de la page
- Ou dans le menu "Deployment Settings"

---

## Option B: GitHub Push + Auto-Deploy (Plus robuste)
Si pas de bouton Redeploy visible:

```bash
# 1. Setup GitHub remote (si pas existe)
git remote add origin https://github.com/TON_USERNAME/gamelink
git branch -M main
git push -u origin main

# Vercel va auto-détecter le push et redéployer! ✨
```

---

## Option C: Trigger via Vercel API
```bash
curl -X POST https://api.vercel.com/v13/deployments \
  -H "Authorization: Bearer TON_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"scoutly-demo","target":"production"}'
```

---

**CHOIX RECOMMANDÉ: Option A (Redeploy button)** ← Facile et rapide!


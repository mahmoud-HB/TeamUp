# 🚀 SETUP GITHUB POUR GAMELINK

## ÉTAPE 1: Crée un repo GitHub
1. Va sur: https://github.com/new
2. **Repository name:** `gamelink` (ou autre nom)
3. **Description:** "Gaming social network platform"
4. **Public** (ou Private, ton choix)
5. Click **"Create repository"** ✅

---

## ÉTAPE 2: Push le code local
Copie-colle dans ton terminal:

```bash
cd "/Users/HAJBELM/MHB Perso/Teamup"

# Setup remote avec TON_REPO_URL
# Exemple: https://github.com/hajbelgacem/gamelink.git
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push
git branch -M main
git push -u origin main
```

**Remplace:**
- `YOUR_USERNAME` = ton GitHub username (ex: `hajbelgacem`)
- `YOUR_REPO` = nom du repo (ex: `gamelink`)

---

## ÉTAPE 3: Connect Vercel → GitHub
1. Va sur: https://vercel.com/mhajbelgacem-1223/scoutly-demo/settings
2. Onglet **"Git"** ou **"Connected Git Repository"**
3. Click **"Connect Repository"**
4. Sélectionne: `hajbelgacem/gamelink`
5. Vercel va auto-redéployer! 🚀

---

## ✅ C'est FAIT!
Les nouvelles features apparaîtront en 2-3 min:
- ✅ /stats (Dashboard)
- ✅ /recruitment-advisor (AI Advisor)
- ✅ 60+ joueurs mock
- ✅ Design System


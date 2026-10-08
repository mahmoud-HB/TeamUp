# 🚀 DEPLOY TO VERCEL NOW

**Status**: ✅ Everything is ready. Just need to authenticate with Vercel.

---

## Quick Deploy (2 minutes)

### Option A: Via CLI (Recommended)

```bash
cd "/Users/HAJBELM/MHB Perso/Teamup"

# 1. Login to Vercel
vercel login
# Opens browser → authenticate with GitHub → come back

# 2. Deploy to production
vercel deploy --prod

# 3. Done! You'll get a URL: https://gamelink-xxxxx.vercel.app
```

### Option B: Via GitHub (Even Easier)

1. Push to GitHub:
```bash
cd "/Users/HAJBELM/MHB Perso/Teamup"
git remote add origin https://github.com/YOUR_USERNAME/gamelink.git
git push -u origin main
```

2. Go to https://vercel.com/new
3. Click "Import Git Repository"
4. Select your repo
5. Click Deploy
6. Done!

---

## After Deployment

### 1. Set Environment Variables

In Vercel Dashboard:
- Project Settings → Environment Variables
- Add:
  ```
  NEXT_PUBLIC_DEMO_MODE=true
  ```
  (or set to false if you have Supabase credentials)

### 2. Test Your App

Visit: `https://gamelink-xxxxx.vercel.app`

Test:
- [ ] Page loads in < 3 seconds
- [ ] Dark/light mode toggle works
- [ ] Language toggle (FR/EN) works
- [ ] Can navigate all pages
- [ ] No console errors
- [ ] Mobile responsive

### 3. Verify Routes

- [ ] https://gamelink-xxxxx.vercel.app/en/feed (should show feed)
- [ ] https://gamelink-xxxxx.vercel.app/en/search (should show search)
- [ ] https://gamelink-xxxxx.vercel.app/en/teams (should show teams)
- [ ] https://gamelink-xxxxx.vercel.app/en/admin (should show admin)

---

## Next Steps (Optional)

### To Connect Real Database

1. Create Supabase project: https://supabase.com/dashboard
2. Get credentials (URL + Keys)
3. Push migrations:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
4. Update Vercel env vars:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   NEXT_PUBLIC_DEMO_MODE=false
   ```
5. Redeploy from Vercel dashboard

---

## ✅ You're Done!

Your app is live! 🎉

- **Live URL**: https://gamelink-xxxxx.vercel.app
- **Git Repo**: GitHub
- **Database**: Supabase (optional, connect anytime)
- **Monitoring**: Vercel Analytics (automatic)

---

## Support

- Build errors? → Check `npm run build` locally
- Deployment fails? → Read Vercel logs in dashboard
- Want to customize? → Read QUICK_START.md

---

**That's it! You're production-ready! 🚀**

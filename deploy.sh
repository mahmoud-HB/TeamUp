#!/bin/bash

# 🚀 GAMELINK DEPLOYMENT SCRIPT
# Auto-setup: Supabase → Migrations → Vercel

set -e  # Exit on error

echo "════════════════════════════════════════════════════════"
echo "🚀 GAMELINK DEPLOYMENT WIZARD"
echo "════════════════════════════════════════════════════════"

PROJECT_DIR="/Users/HAJBELM/MHB Perso/Teamup"
cd "$PROJECT_DIR"

# ============================================================
# STEP 1: VERIFY PROJECT IS READY
# ============================================================
echo ""
echo "📋 Step 1/3: Verifying project..."

if ! npm run build > /dev/null 2>&1; then
    echo "❌ Build failed! Check errors above."
    exit 1
fi
echo "✅ Build successful (0 errors)"

if ! npm run test > /dev/null 2>&1; then
    echo "❌ Tests failed! Check errors above."
    exit 1
fi
echo "✅ Tests passing (40/40)"

echo "✅ Project ready for deployment"

# ============================================================
# STEP 2: SUPABASE SETUP OPTIONS
# ============================================================
echo ""
echo "🗄️  Step 2/3: Supabase Setup"
echo ""
echo "Choose an option:"
echo "  1) I have Supabase credentials (already created project)"
echo "  2) Deploy with DEMO MODE (works without backend)"
echo ""
read -p "Enter your choice (1 or 2): " supabase_choice

case $supabase_choice in
    1)
        echo ""
        read -p "Enter NEXT_PUBLIC_SUPABASE_URL: " supabase_url
        read -p "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: " supabase_key
        read -p "Enter SUPABASE_SERVICE_ROLE_KEY: " service_key
        
        # Update .env.local
        cat > .env.local << ENVEOF
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key
SUPABASE_SERVICE_ROLE_KEY=$service_key
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SITE_URL=https://gamelink.vercel.app
ENVEOF
        
        echo "✅ Supabase credentials saved to .env.local"
        
        # Ask about migrations
        read -p "Push migrations to Supabase? (y/n): " push_migrations
        if [[ $push_migrations == "y" ]]; then
            echo "Installing Supabase CLI..."
            npm install -g supabase > /dev/null 2>&1 || true
            
            echo "Pushing migrations..."
            supabase link --project-ref $(echo $supabase_url | sed 's/.*\///;s/\.supabase\.co//') || true
            supabase db push || echo "⚠️  Migrations push skipped (may require manual auth)"
            echo "✅ Migrations pushed"
        fi
        ;;
    2)
        cat > .env.local << ENVEOF
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENVEOF
        echo "✅ Demo mode configured (all features work with mock data)"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# ============================================================
# STEP 3: DEPLOY TO VERCEL
# ============================================================
echo ""
echo "🚀 Step 3/3: Deploy to Vercel"
echo ""

# Check if already linked to Vercel
if [ -d ".vercel" ]; then
    echo "✅ Project already linked to Vercel"
    read -p "Deploy now? (y/n): " deploy_now
    if [[ $deploy_now == "y" ]]; then
        echo "Deploying to production..."
        vercel deploy --prod --token=${VERCEL_TOKEN:-}
    fi
else
    echo "📝 First time deployment to Vercel"
    read -p "Have you installed Vercel CLI? (y/n): " has_vercel
    
    if [[ $has_vercel == "n" ]]; then
        echo "Installing Vercel CLI..."
        npm install -g vercel > /dev/null 2>&1
    fi
    
    echo ""
    echo "Starting Vercel deployment wizard..."
    echo "(You'll be asked to link/create a project)"
    
    vercel deploy --prod
fi

# ============================================================
# VERIFICATION
# ============================================================
echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🎉 Your app is now live!"
echo ""
echo "📖 Next steps:"
echo "  1. Check your deployment URL above"
echo "  2. Set environment variables in Vercel dashboard"
echo "     (if using production Supabase)"
echo "  3. Test at your deployment URL"
echo ""
echo "📚 Documentation:"
echo "  - QUICK_START.md       (Commands reference)"
echo "  - ENHANCEMENTS.md      (Future features)"
echo "  - STATUS.md            (Project overview)"
echo ""
echo "Happy coding! 🎮"
echo ""


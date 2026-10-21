#!/bin/bash

# 🎮 GAMELINK - QUICK START SCRIPT

echo "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🎮 GAMELINK - GAMING SOCIAL NETWORK PLATFORM 🎮       ║
║                                                            ║
║              Quick Start Setup & Launch Script             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo -e "${BLUE}1️⃣  Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"

# Step 2: Install dependencies
echo -e "\n${BLUE}2️⃣  Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Step 3: Check .env.local
echo -e "\n${BLUE}3️⃣  Checking environment configuration...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating with defaults...${NC}"
    cat > .env.local << 'ENVFILE'
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENVFILE
    echo -e "${GREEN}✅ .env.local created${NC}"
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
fi

# Step 4: Show menu
echo -e "\n${BLUE}4️⃣  What would you like to do?${NC}\n"
echo "1) 🚀 Start dev server (npm run dev)"
echo "2) 🧪 Run tests (npm test)"
echo "3) 🏗️  Build for production (npm run build)"
echo "4) ✨ Format code (npm run format)"
echo "5) 🔍 Run linter (npm run lint)"
echo "6) 📚 Show documentation"
echo "7) ⚡ Install & start (full setup)"
echo "8) 🚪 Exit"

read -p "Choose option (1-8): " choice

case $choice in
    1)
        echo -e "\n${BLUE}Starting dev server...${NC}"
        echo -e "${YELLOW}Open: http://localhost:3000${NC}\n"
        npm run dev
        ;;
    2)
        echo -e "\n${BLUE}Running tests...${NC}\n"
        npm test
        ;;
    3)
        echo -e "\n${BLUE}Building for production...${NC}\n"
        npm run build
        ;;
    4)
        echo -e "\n${BLUE}Formatting code...${NC}\n"
        npm run format
        ;;
    5)
        echo -e "\n${BLUE}Running linter...${NC}\n"
        npm run lint
        ;;
    6)
        echo -e "\n${BLUE}📚 DOCUMENTATION FILES:${NC}\n"
        ls -lah README*.md *.md 2>/dev/null | grep -E "README|QUICK|IMPROVEMENTS"
        echo -e "\n${YELLOW}Run: cat README_COMPLETE.md${NC}"
        ;;
    7)
        echo -e "\n${BLUE}Full setup & start...${NC}"
        npm install --legacy-peer-deps
        npm run build
        npm test
        echo -e "\n${GREEN}✅ Setup complete!${NC}"
        echo -e "${YELLOW}Ready to start: npm run dev${NC}"
        ;;
    8)
        echo -e "\n${YELLOW}Bye! 👋${NC}"
        exit 0
        ;;
    *)
        echo -e "\n${YELLOW}Invalid option${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Done!${NC}"


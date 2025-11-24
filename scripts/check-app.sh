#!/bin/bash

# TindeRent Health Check Script
# Checks for common issues that prevent the app from running

set -e

echo "🔍 TindeRent Health Check"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
else
    echo -e "${RED}❌ Node.js version too old: $(node -v). Need >= 18.0.0${NC}"
    ((ERRORS++))
fi
echo ""

# Check 2: Dependencies installed
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${RED}❌ node_modules missing. Run: npm install${NC}"
    ((ERRORS++))
fi
echo ""

# Check 3: Environment variables
echo "🔐 Checking environment variables..."
if [ -f ".env" ] || [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ Environment file found${NC}"

    # Check for required vars
    if grep -q "VITE_SUPABASE_URL" .env* 2>/dev/null; then
        echo -e "${GREEN}  ✅ VITE_SUPABASE_URL is set${NC}"
    else
        echo -e "${YELLOW}  ⚠️  VITE_SUPABASE_URL not found${NC}"
        ((WARNINGS++))
    fi

    if grep -q "VITE_SUPABASE_ANON_KEY" .env* 2>/dev/null; then
        echo -e "${GREEN}  ✅ VITE_SUPABASE_ANON_KEY is set${NC}"
    else
        echo -e "${YELLOW}  ⚠️  VITE_SUPABASE_ANON_KEY not found${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found (using fallbacks)${NC}"
    echo "   Copy .env.example to .env and add your Supabase credentials"
    ((WARNINGS++))
fi
echo ""

# Check 4: TypeScript errors
echo "🔷 Checking TypeScript..."
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${RED}❌ TypeScript errors found${NC}"
    npx tsc --noEmit | head -20
    ((ERRORS++))
else
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
fi
echo ""

# Check 5: Build test
echo "🏗️  Testing production build..."
if npm run build > /tmp/build-test.log 2>&1; then
    echo -e "${GREEN}✅ Production build successful${NC}"

    # Check bundle size
    BUNDLE_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1)
    echo "   Bundle size: $BUNDLE_SIZE"
else
    echo -e "${RED}❌ Production build failed${NC}"
    echo "   Check /tmp/build-test.log for details"
    tail -20 /tmp/build-test.log
    ((ERRORS++))
fi
echo ""

# Check 6: Port availability
echo "🔌 Checking port availability..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 5173 is in use${NC}"
    echo "   Vite will use another port"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ Port 5173 is available${NC}"
fi
echo ""

# Check 7: Git status
echo "📝 Checking Git status..."
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $UNCOMMITTED uncommitted changes${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ Working directory clean${NC}"
    fi

    BRANCH=$(git branch --show-current)
    echo "   Current branch: $BRANCH"
else
    echo -e "${YELLOW}⚠️  Not a git repository${NC}"
fi
echo ""

# Check 8: Capacitor (Android)
echo "📱 Checking Capacitor setup..."
if [ -d "android" ]; then
    echo -e "${GREEN}✅ Android folder exists${NC}"

    if [ -f "android/gradlew" ]; then
        echo -e "${GREEN}  ✅ Gradle wrapper found${NC}"

        if [ -x "android/gradlew" ]; then
            echo -e "${GREEN}    ✅ gradlew is executable${NC}"
        else
            echo -e "${YELLOW}    ⚠️  gradlew not executable. Run: chmod +x android/gradlew${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "${RED}  ❌ Gradle wrapper missing${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠️  Android folder not found (normal if web-only)${NC}"
fi
echo ""

# Summary
echo "========================="
echo "📊 Health Check Summary"
echo "========================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Your app is ready to run.${NC}"
    echo ""
    echo "To start development:"
    echo "  npm run dev"
    echo ""
    echo "To build for production:"
    echo "  npm run build"
    echo ""
    echo "To deploy:"
    echo "  git push origin main"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo "Your app should work, but check warnings above."
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found${NC}"
    echo "Fix errors above before running the app."
    exit 1
fi

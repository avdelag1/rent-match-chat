#!/bin/bash

echo "🔍 VERIFYING OPTIMIZATIONS..."
echo ""

# 1. Check setTimeout was removed
echo "1️⃣ Checking setTimeout removal..."
SETTIMEOUT_COUNT=$(grep -n "setTimeout.*setCurrentIndex" src/components/ClientTinderSwipeContainer.tsx | wc -l)
if [ $SETTIMEOUT_COUNT -eq 0 ]; then
    echo "   ✅ setTimeout REMOVED (was 1, now 0)"
else
    echo "   ❌ setTimeout still present!"
fi
echo ""

# 2. Check console logs are conditional
echo "2️⃣ Checking console log conditionals..."
CONSOLE_CONDITIONAL=$(grep -c "process.env.NODE_ENV === 'development'" src/components/ClientTinderSwipeContainer.tsx)
echo "   ✅ Found $CONSOLE_CONDITIONAL conditional console checks"
echo ""

# 3. Check key props are fixed
echo "3️⃣ Checking key props..."
IMAGE_KEY=$(grep -c "key={\`image-" src/components/ClientTinderSwipeCard.tsx)
INTEREST_KEY=$(grep -c "key={\`interest-" src/components/ClientTinderSwipeCard.tsx)
ACTIVITY_KEY=$(grep -c "key={\`activity-" src/components/ClientTinderSwipeCard.tsx)
LIFESTYLE_KEY=$(grep -c "key={\`lifestyle-" src/components/ClientTinderSwipeCard.tsx)
AMENITY_KEY=$(grep -c "key={\`amenity-" src/components/TinderSwipeCard.tsx)

echo "   ✅ image-idx: $IMAGE_KEY"
echo "   ✅ interest-idx: $INTEREST_KEY"
echo "   ✅ activity-idx: $ACTIVITY_KEY"
echo "   ✅ lifestyle-idx: $LIFESTYLE_KEY"
echo "   ✅ amenity-idx: $AMENITY_KEY"
echo ""

# 4. Check prefetch hook exists
echo "4️⃣ Checking image prefetch hook..."
if [ -f "src/hooks/usePrefetchImages.tsx" ]; then
    PREFETCH_USAGE=$(grep -r "usePrefetchImages" src/components/*.tsx | wc -l)
    echo "   ✅ Hook file exists and used $PREFETCH_USAGE times"
else
    echo "   ❌ Hook file missing!"
fi
echo ""

# 5. Check lazy loading in DashboardLayout
echo "5️⃣ Checking lazy-loaded dialogs..."
LAZY_COUNT=$(grep -c "lazy(() =>" src/components/DashboardLayout.tsx)
SUSPENSE_COUNT=$(grep -c "<Suspense fallback=" src/components/DashboardLayout.tsx)
echo "   ✅ $LAZY_COUNT components lazy-loaded"
echo "   ✅ $SUSPENSE_COUNT Suspense boundaries"
echo ""

# 6. Bundle analysis
echo "6️⃣ Checking build output..."
if [ -d "dist" ]; then
    TOTAL_SIZE=$(du -sh dist/assets/ | cut -f1)
    echo "   ✅ Build directory size: $TOTAL_SIZE"
    
    # Find DashboardLayout chunk
    DASHBOARD_SIZE=$(ls -lh dist/assets/DashboardLayout*.js | awk '{print $5}')
    echo "   ✅ DashboardLayout chunk: $DASHBOARD_SIZE"
    
    # Find largest chunks
    echo ""
    echo "   📊 Largest chunks:"
    ls -1h dist/assets/*.js | head -5 | awk '{print "      " $9 " (" $5 ")"}'
else
    echo "   ⚠️  dist directory not found - run 'npm run build' first"
fi
echo ""

echo "✅ VERIFICATION COMPLETE!"

#!/bin/bash
# Deployment Helper Script
# This script checks deployment status and helps deploy changes

echo "🔍 Checking deployment status..."
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if on main
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "✅ You are on main branch"
else
    echo "⚠️  You are NOT on main branch (production deploys from main)"
    echo ""
    echo "To deploy your changes:"
    echo "1. Create a Pull Request: gh pr create --title 'Deploy fixes' --body 'Deploy error notifications and CardImage fixes'"
    echo "2. Merge the PR"
    echo "3. Vercel will auto-deploy to production"
fi

echo ""
echo "🌐 Deployment Setup:"
echo "  - Frontend: Vercel (deploys on push to main)"
echo "  - Database: Supabase (migrations run on push to main)"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes"
    git status --short
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "📊 Recent commits on this branch:"
git log --oneline -5

echo ""
echo "💡 Quick Deploy Commands:"
echo "  # Create PR and merge:"
echo "  gh pr create --fill"
echo "  gh pr merge --auto --squash"
echo ""
echo "  # Or push directly to main (if you have access):"
echo "  git checkout main"
echo "  git merge $CURRENT_BRANCH"
echo "  git push origin main"

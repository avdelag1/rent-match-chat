#!/bin/bash
echo "🔄 Resetting development environment..."

# Clear Vite cache
echo "Cleaning Vite cache..."
rm -rf node_modules/.vite
rm -rf dist

echo "✅ Cache cleared!"
echo ""
echo "Now run: npm run dev"
echo "Then hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"

#!/bin/bash
# Script to rename uploaded sound files to match code expectations
# Run this from the project root directory

cd public/sounds || exit 1

echo "Renaming sound files to match code expectations..."

# Funny theme
if [ -f "funny-short-comedy-fart-dislike.mp3" ]; then
    mv "funny-short-comedy-fart-dislike.mp3" "funny-short-comedy-fart-sound-effect-318912.mp3"
    echo "✅ Renamed funny-short-comedy-fart-dislike.mp3"
fi

if [ -f "ding-like.mp3" ]; then
    mv "ding-like.mp3" "ding-sfx-472366.mp3"
    echo "✅ Renamed ding-like.mp3"
fi

if [ -f "achievement-like swipe rigth.mp3" ]; then
    mv "achievement-like swipe rigth.mp3" "achievement-unlocked-463070.mp3"
    echo "✅ Renamed achievement-like swipe rigth.mp3"
fi

# Calm/Meditation theme (note: file has truncated name)
if [ -f "deep-meditation-bell-hit-heart-chakra-4-.mp3" ]; then
    mv "deep-meditation-bell-hit-heart-chakra-4-.mp3" "deep-meditation-bell-hit-heart-chakra-4-186970.mp3"
    echo "✅ Renamed deep-meditation-bell-hit-heart-chakra-4-.mp3"
fi

if [ -f "deep-meditation-bell-hit-third-eye like.mp3" ]; then
    mv "deep-meditation-bell-hit-third-eye like.mp3" "deep-meditation-bell-hit-third-eye-chakra-6-186972.mp3"
    echo "✅ Renamed deep-meditation-bell-hit-third-eye like.mp3"
fi

# Random Zen
if [ -f "large-gong-like meditation.mp3" ]; then
    mv "large-gong-like meditation.mp3" "large-gong-2-232438.mp3"
    echo "✅ Renamed large-gong-like meditation.mp3"
fi

# Water theme
if [ -f "water-splash-dislike.mp3" ]; then
    mv "water-splash-dislike.mp3" "water-splash-46402.mp3"
    echo "✅ Renamed water-splash-dislike.mp3"
fi

if [ -f "water-droplet like.mp3" ]; then
    mv "water-droplet like.mp3" "water-droplet-sfx-417690.mp3"
    echo "✅ Renamed water-droplet like.mp3"
fi

echo ""
echo "✨ Renaming complete!"
echo ""
echo "Already correct files:"
echo "  ✅ book-closing-466850.mp3"
echo "  ✅ page-turned-84574.mp3"
echo "  ✅ bell-a-99888.mp3"
echo "  ✅ bells-2-31725.mp3"
echo "  ✅ turnpage-99756.mp3"
echo ""
echo "Extra files (not used by the app, but kept):"
ls -1 | grep -v "README.md" | grep -E "(down swipe|duck-quack|funny-cartoo|screenshot|text-notification|whistle-slide|deep-meditation-bell-hit-heart-dislike)"
echo ""
echo "To apply these changes to git:"
echo "  cd ../.."
echo "  git add public/sounds/"
echo "  git commit -m 'Rename sound files to match code expectations'"
echo "  git push origin claude/add-swipe-sounds-trOHy"

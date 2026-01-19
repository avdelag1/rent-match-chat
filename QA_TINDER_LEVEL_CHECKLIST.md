# SwipeSS QA Checklist - Tinder-Level Feel

## 🎯 Card Information Hierarchy (2-Second Decision)

### Property Cards
- [ ] Price is the LARGEST text element (2xl font)
- [ ] Property type + bed/bath count visible at glance
- [ ] Location shows with icon, not as text block
- [ ] No paragraph text on card face
- [ ] Verified badge subtle but visible

### Vehicle Cards
- [ ] Price prominent with rental period (/day, /mo)
- [ ] Year + Make + Model as single headline
- [ ] Location secondary but visible
- [ ] Rating displays if available

### Service/Worker Cards
- [ ] Hourly rate is primary value
- [ ] Service type clear (not buried)
- [ ] Name + location in supporting line
- [ ] Rating with review count visible

### Client Cards (Owner View)
- [ ] Name + age as primary identity
- [ ] Budget range as primary value for owners
- [ ] Occupation visible
- [ ] Location secondary

---

## 🔒 Trust Signals (Micro, Not Loud)

- [ ] Verified badge has subtle pulse animation
- [ ] Activity indicator shows "Active recently" not exact times
- [ ] Rating shows confidence (review count)
- [ ] Profile strength indicator unobtrusive
- [ ] Response time badge for messaging
- [ ] Report/block always accessible but not prominent

---

## ⚠️ Error & Edge-Case UX

### Every Error Must Show:
- [ ] What happened (title)
- [ ] Why it happened (description)
- [ ] What to do next (action button)

### Error Types Covered:
- [ ] Network offline → "You're offline" + retry
- [ ] Like limit reached → Friendly upsell
- [ ] Package required → Soft paywall
- [ ] Blocked user → "User unavailable"
- [ ] Upload failed → Clear retry path
- [ ] Auth expired → "Session expired" + sign in
- [ ] Rate limit → "Slow down a bit"

### No Raw Errors:
- [ ] No "Error: PGRST116" messages
- [ ] No "undefined" or "null" displays
- [ ] No stack traces in production
- [ ] No console errors visible to users

---

## 💳 Package Gating UX (Soft Paywalls)

### Never "No", Always "Yes, if..."
- [ ] Features preview before lock
- [ ] Blurred preview of locked content
- [ ] Contextual upgrade prompts (not random modals)
- [ ] Trial limit banner shows progress
- [ ] "X remaining today" messaging

### Specific Features:
- [ ] Undo swipe shows preview animation before block
- [ ] Read receipts show blurred state
- [ ] Typing indicator locked with tooltip
- [ ] Super likes show count remaining
- [ ] Boost shows preview of effect

---

## ✨ Micro-Polish Details

### Button Feedback
- [ ] Press scale is 0.96 (subtle, not jarring)
- [ ] Release animation is instant (<50ms)
- [ ] Ripple effect on tap
- [ ] No delay between tap and visual feedback

### Animation Timing
- [ ] Skeleton shimmer synced (1.5s cycle)
- [ ] Page transitions under 200ms
- [ ] Card swipe feels natural (no lag)
- [ ] Modal enter/exit smooth

### Haptics (Mobile)
- [ ] Light tap on buttons
- [ ] Medium on selections
- [ ] Success pattern on likes
- [ ] Warning on dislikes
- [ ] Celebration on match

### Keyboard Handling
- [ ] Chat input pushes above keyboard
- [ ] Scroll adjusts to keep focus visible
- [ ] Keyboard dismiss on scroll up

### Scroll Behavior
- [ ] Scroll position remembered on back
- [ ] Pull-to-refresh with real physics
- [ ] No jump on content load
- [ ] Momentum scrolling natural

### Icon Consistency
- [ ] All icons same stroke width (2px default)
- [ ] Icon sizes consistent within context
- [ ] Filled vs outline states meaningful

### Status Bar (Mobile)
- [ ] Color syncs with page theme
- [ ] Light text on dark backgrounds
- [ ] Dark text on light backgrounds

---

## 🏃 Performance Targets

- [ ] 60fps during swipe animations
- [ ] < 100ms tap-to-feedback
- [ ] < 200ms page transitions
- [ ] No jank during scrolling
- [ ] Images load progressively
- [ ] Skeletons prevent layout shift

---

## 📱 Device-Specific

### iOS
- [ ] Safe areas respected
- [ ] Rubber-band scroll natural
- [ ] No double-tap zoom on buttons
- [ ] Status bar matches theme

### Android
- [ ] Material-like ripples
- [ ] Back gesture works
- [ ] Keyboard avoidance correct
- [ ] System navigation respected

---

## 🔄 Testing Workflow

1. **Fresh Install Test**
   - Clear storage
   - First launch experience
   - Onboarding flow smooth

2. **Happy Path Test**
   - Sign in → Browse → Like → Match → Message
   - No errors, smooth animations

3. **Edge Case Test**
   - Offline mode
   - Slow network (throttle to 3G)
   - Expired session
   - Empty states

4. **Stress Test**
   - Rapid swiping (20+ cards)
   - Fast scrolling
   - Quick navigation between pages
   - Multiple image loads

---

## ✅ Sign-Off Criteria

Before marking as "Tinder-level":

- [ ] All cards scannable in < 2 seconds
- [ ] Trust signals feel reassuring, not promotional
- [ ] All errors are user-friendly
- [ ] Paywalls feel helpful, not aggressive
- [ ] Every tap has instant feedback
- [ ] 60fps maintained during all animations
- [ ] No layout shifts or jank
- [ ] Works perfectly on both iOS and Android

---

**Last Updated:** $(date)
**Reviewer:** _______________
**Status:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete

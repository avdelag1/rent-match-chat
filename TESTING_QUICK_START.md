# Swipe Testing Quick Start Guide

**TL;DR**: Quick commands to start testing swipe functionality immediately.

---

## 🚀 Manual Testing (2 minutes)

```bash
# 1. Start the app
yarn dev

# 2. Open browser to http://localhost:8080

# 3. Navigate to client or owner dashboard

# 4. Try these gestures:
#    - Swipe right (slow drag >80px)
#    - Swipe left (fast flick)
#    - Half-swipe (drag 50px then release - should snap back)
#    - Rapid swipes (3 cards in quick succession)
```

**Expected**: Smooth 60fps animations, no snap-back glitches, cards exit cleanly.

---

## 🤖 Automated Testing (5 minutes)

### Option 1: Puppeteer
```bash
# Install
npm install --save-dev puppeteer

# Configure test credentials
# Edit tests/swipe-automation.js:
# - Update CONFIG.testEmail
# - Update CONFIG.testPassword

# Run
node tests/swipe-automation.js
```

### Option 2: Cypress
```bash
# Install
npm install --save-dev cypress

# Setup
mkdir -p cypress/e2e
cp tests/swipe.cy.js cypress/e2e/

# Run interactively
npx cypress open

# Or run headless
npx cypress run --spec cypress/e2e/swipe.cy.js
```

---

## 📊 Performance Monitoring

### Browser Console (Real-time)
```javascript
// 1. Open DevTools Console
// 2. Copy-paste from: tests/performance-monitor.js
// 3. Perform swipes
// 4. Call: printSwipeMetrics()
```

### Automated Performance Test
```bash
node tests/performance-monitor.js
```

**Monitors**: FPS, frame times, animation durations, memory usage

---

## 🧪 Device Emulation

### Chrome DevTools
```
1. Press F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Select device:
   - iPhone SE (375×667) - PRIORITY
   - Pixel 7 (412×915) - PRIORITY
   - iPad Air (820×1180) - MEDIUM
3. Test swipe gestures
4. Check responsive behavior
```

### Mobile Testing (Recommended)
```
1. Find local IP: ipconfig (Windows) or ifconfig (Mac/Linux)
2. Update vite.config.js to allow network access
3. Visit http://[YOUR_IP]:8080 from mobile device
4. Test actual touch gestures
```

---

## ✅ Quick Checklist (30 seconds each)

### Must-Test Scenarios
- [ ] **Swipe Right**: Drag card right >80px → exits smoothly
- [ ] **Swipe Left**: Drag card left >80px → exits smoothly
- [ ] **Fast Flick**: Quick swipe gesture → detects velocity
- [ ] **Half-Swipe**: Drag 50px → snaps back to center
- [ ] **Rapid Swipes**: 3 cards quickly → all complete
- [ ] **End of Deck**: Swipe all cards → shows "All Caught Up"
- [ ] **Console Clean**: Open Console → no red errors
- [ ] **60fps**: Enable FPS counter → stays above 55fps

### Open DevTools Console and Check:
```javascript
// Verify deck state
window.swipeDeckStore.getState().currentIndex  // Should increment
window.swipeDeckStore.getState().swipedIds.size  // Should grow

// Check for errors
// (Look for red text in console - should be zero)
```

---

## 🔧 Performance Checks (DevTools)

### Frame Rate
```
1. Open DevTools → Rendering
2. Enable "Frame Rendering Stats"
3. Swipe cards
4. FPS should stay 60fps (green), never drop below 55fps (red)
```

### Paint Regions
```
1. DevTools → Rendering → "Paint flashing"
2. Swipe card
3. Only card area should flash green (not entire screen)
```

### Memory Leaks
```
1. DevTools → Memory → Take heap snapshot
2. Perform 20 swipes
3. Take second snapshot
4. Check "Detached DOM tree" - should be 0
```

---

## 🐛 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Card snaps back before exit | Recent fix applied (commit e7cecb0). Update branch. |
| Swipes feel slow | Threshold lowered to 80px (commit 524cde2). Update branch. |
| End of deck shows error | Fixed (commit 524cde2). Should show "All Caught Up". |
| Console errors | Check Network tab for failed API calls. Verify Supabase connection. |
| Automated tests fail | Ensure `yarn dev` is running. Update test credentials. |

---

## 📄 Full Documentation

- **Comprehensive Checklist**: [`QA_SWIPE_CHECKLIST.md`](./QA_SWIPE_CHECKLIST.md) (100+ test cases)
- **Test Suite README**: [`tests/README.md`](./tests/README.md) (Setup & configuration)
- **Automated Tests**: [`tests/swipe-automation.js`](./tests/swipe-automation.js) (Puppeteer)
- **Cypress Tests**: [`tests/swipe.cy.js`](./tests/swipe.cy.js) (Interactive testing)
- **Performance Monitor**: [`tests/performance-monitor.js`](./tests/performance-monitor.js) (Real-time metrics)

---

## 🎯 Test Priority Matrix

| Priority | Test Scenario | Time | Tool |
|----------|---------------|------|------|
| 🔴 HIGH | Basic swipes (right, left, half) | 1 min | Manual |
| 🔴 HIGH | Rapid swipes (3+ cards) | 30 sec | Manual |
| 🔴 HIGH | Console errors check | 10 sec | DevTools |
| 🟡 MEDIUM | End of deck state | 2 min | Manual |
| 🟡 MEDIUM | Automated test suite | 5 min | Puppeteer |
| 🟡 MEDIUM | Performance metrics | 3 min | Performance Monitor |
| 🟢 LOW | All viewport sizes | 5 min | DevTools |
| 🟢 LOW | Memory leak test | 5 min | DevTools |

**Recommended for PR Review**: HIGH priority tests (2 minutes total)

---

## 💡 Pro Tips

1. **Clear localStorage** before testing to simulate new user:
   ```javascript
   localStorage.clear(); location.reload();
   ```

2. **Throttle CPU** to simulate low-end devices:
   ```
   DevTools → Performance → CPU: 4x slowdown
   ```

3. **Record performance profile** for deep analysis:
   ```
   DevTools → Performance → Record → Perform swipes → Stop
   ```

4. **Test on actual mobile device** for most accurate results:
   ```bash
   # In vite.config.js, add:
   server: { host: '0.0.0.0' }

   # Then visit from phone: http://[YOUR_IP]:8080
   ```

5. **Watch Network tab** to verify swipe API calls complete:
   ```
   Should see POST to /swipes endpoint after each swipe
   ```

---

## 🆘 Need Help?

- Review recent fixes: `git log --oneline | head -20`
- Check implementation: `src/lib/swipe/SwipeEngine.ts`
- See known issues: `QA_SWIPE_CHECKLIST.md` (Section 8)
- Report bugs: Create issue with reproduction steps

---

**Last Updated**: 2026-01-16
**Branch**: `claude/qa-swipe-checklist-KJbz3`
**Recent Fixes**: Animation bounce-back, responsiveness, end-of-deck handling

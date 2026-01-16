# Swipe Functionality QA Checklist

**Date**: 2026-01-16
**Branch**: `claude/qa-swipe-checklist-KJbz3`
**Components**: SwipeEngine, SimpleSwipeCard, RecyclingCardStack
**Recent Fixes**: Animation bounce-back, end-of-deck handling, responsiveness improvements

---

## Quick Start Commands

```bash
# Run development server
yarn dev

# Open in browser
# Navigate to: http://localhost:8080

# For client swipe testing: /client-dashboard (listings)
# For owner swipe testing: /owner-dashboard (client cards)
```

---

## 1. Basic Swipe Mechanics

### Test Case 1.1: Slow Drag Right (Accept)
**Steps**:
1. Navigate to client or owner dashboard with active deck
2. Place pointer on card center
3. Slowly drag card to the right (>80px total distance)
4. Release pointer

**Expected Results**:
- ✅ Card follows pointer smoothly during drag (no lag)
- ✅ Card opacity/rotation changes as it moves
- ✅ Card exits screen to the right with tween animation (0.15s)
- ✅ Next card appears immediately after exit
- ✅ `currentIndex` increments by 1 in state
- ✅ No snap-back or bounce-back visible
- ✅ Network request sent to record swipe (check Network tab)

**Performance Target**: <8ms first touch response, 60fps during drag

---

### Test Case 1.2: Slow Drag Left (Reject)
**Steps**:
1. Drag card slowly to the left (>80px)
2. Release pointer

**Expected Results**:
- ✅ Card exits screen to the left with tween animation
- ✅ Exit animation duration: ~150ms
- ✅ No spring oscillation or bounce
- ✅ Next card appears
- ✅ Swipe recorded in database

---

### Test Case 1.3: Fast Swipe (Flick) Right
**Steps**:
1. Quickly flick card to the right (velocity >300px/s)
2. Distance may be <80px due to high velocity

**Expected Results**:
- ✅ Card detects swipe even with short distance
- ✅ Inertial animation applies momentum
- ✅ Card accelerates smoothly to exit
- ✅ Exit distance reaches `window.innerWidth + 100px`
- ✅ No jank or frame drops during exit

**Validation**: Check DevTools Performance tab for consistent 60fps

---

### Test Case 1.4: Fast Swipe (Flick) Left
**Steps**:
1. Quickly flick card to the left

**Expected Results**:
- ✅ Same smooth physics as right swipe
- ✅ Card exits fully off screen
- ✅ Next card appears instantly

---

### Test Case 1.5: Half-Swipe (Snap-Back)
**Steps**:
1. Drag card right by 50px (below 80px threshold)
2. Release with low velocity (<300px/s)

**Expected Results**:
- ✅ Card returns to center position (x=0, y=0)
- ✅ Spring animation applied (stiffness: 500, damping: 35)
- ✅ Smooth deceleration, no sudden jump
- ✅ Card settles at center within ~200-300ms
- ✅ No swipe recorded in database
- ✅ `currentIndex` remains unchanged

**Edge Case Check**: Verify no `isExitingRef` bugs cause reset during snap-back

---

### Test Case 1.6: Vertical Drag (Should Not Swipe)
**Steps**:
1. Drag card vertically up/down by 100px
2. Minimal horizontal movement (<20px)
3. Release

**Expected Results**:
- ✅ Card snaps back to center
- ✅ No horizontal swipe triggered
- ✅ `dragElastic` allows some vertical movement
- ✅ No console errors

---

### Test Case 1.7: Diagonal Drag (Mixed Movement)
**Steps**:
1. Drag card diagonally (right + up)
2. Ensure horizontal distance >80px

**Expected Results**:
- ✅ Swipe triggers based on horizontal component
- ✅ Card exits in diagonal direction
- ✅ Animation feels natural
- ✅ Swipe completes successfully

---

## 2. Edge-Case Dragging Scenarios

### Test Case 2.1: Drag Start at Card Edge
**Steps**:
1. Start pointer drag at far left/right edge of card
2. Drag horizontally >80px
3. Release

**Expected Results**:
- ✅ Drag initiates correctly from edge
- ✅ No unexpected rotation/skew
- ✅ Exit animation completes normally

---

### Test Case 2.2: Multi-Touch / Pointer Cancel
**Steps**:
1. Start dragging card with one finger
2. Touch screen with second finger mid-drag
3. Release first finger

**Expected Results**:
- ✅ Card either snaps back or continues with second pointer
- ✅ No "stuck" card state
- ✅ No console errors: "pointercancel event"

**Mobile Testing**: Use actual mobile device or browser emulation

---

### Test Case 2.3: Drag Outside Viewport
**Steps**:
1. Drag card beyond viewport edges (>window.innerWidth)
2. Release outside visible area

**Expected Results**:
- ✅ Card still registers swipe
- ✅ Exit animation completes even if card is off-screen
- ✅ Next card appears
- ✅ No layout shift or scroll

---

### Test Case 2.4: Rapid Pointer Movement (Stress Test)
**Steps**:
1. Shake/vibrate cursor rapidly while dragging card
2. Make erratic movements left-right-left
3. Release after >80px net displacement

**Expected Results**:
- ✅ GesturePredictor correctly calculates velocity
- ✅ No animation stuttering
- ✅ Final direction matches net displacement
- ✅ No dropped frames (<16.67ms frame time)

---

### Test Case 2.5: Slow Drag Then Fast Release
**Steps**:
1. Slowly drag card 60px right (below threshold)
2. At end of drag, quickly accelerate pointer
3. Release with high velocity (>300px/s)

**Expected Results**:
- ✅ Velocity detection overrides distance threshold
- ✅ Card exits right even though distance <80px
- ✅ Inertial physics feels natural

---

## 3. Deck Indexing Under Rapid Swipes

### Test Case 3.1: Double Swipe (Quick Succession)
**Steps**:
1. Swipe first card right (fast)
2. Immediately swipe second card left (within 200ms)
3. Observe third card

**Expected Results**:
- ✅ Both swipes complete without interference
- ✅ `currentIndex` increments twice: 0→1→2
- ✅ Third card displays correctly
- ✅ No duplicate swipes recorded (check DB)
- ✅ No "card stuck mid-exit" visual bug

**State Validation**:
```javascript
// Open browser console
window.swipeDeckStore.getState().currentIndex // Should be 2
window.swipeDeckStore.getState().swipedIds.size // Should include 2 IDs
```

---

### Test Case 3.2: Triple Swipe Burst (Stress Test)
**Steps**:
1. Rapidly swipe 3 cards in sequence (<500ms total)
2. Alternate directions: right, left, right

**Expected Results**:
- ✅ All 3 swipes complete
- ✅ No animation queue buildup or lag
- ✅ Fourth card appears smoothly
- ✅ RecyclingCardStack reuses DOM nodes correctly
- ✅ No memory leaks (check DevTools Memory tab)

**Performance Target**: <16ms per frame throughout burst

---

### Test Case 3.3: Swipe During Previous Exit Animation
**Steps**:
1. Swipe first card right
2. While first card is mid-exit (0-150ms), immediately drag second card

**Expected Results**:
- ✅ First card exit completes uninterrupted
- ✅ Second card drag starts normally
- ✅ No snap-back glitch on first card
- ✅ `isExitingRef` prevents reset interference
- ✅ SwipeEngine detaches/reattaches correctly

**Critical Check**: First card should NOT snap back to center before disappearing

---

### Test Case 3.4: End of Deck Handling
**Steps**:
1. Swipe through all cards until deck is empty
2. Observe final card and empty state

**Expected Results**:
- ✅ "All Caught Up" message displays (NOT error state)
- ✅ Refresh button appears
- ✅ No console errors logged
- ✅ Background fetch still attempts to load more cards
- ✅ If fetch succeeds, new cards appear automatically

**Edge Case**: If deck has exactly 1 card, swiping it should show "All Caught Up"

---

### Test Case 3.5: Undo After Rapid Swipes
**Steps**:
1. Rapidly swipe 3 cards
2. Click "Undo" button (if available)

**Expected Results**:
- ✅ Only last swipe is undone (third card)
- ✅ Third card reappears at top of deck
- ✅ `currentIndex` decrements by 1
- ✅ `lastSwipedId` is removed from `swipedIds` Set
- ✅ Previous two swipes remain recorded

**Timeout Check**: Undo should only work within 30 seconds

---

### Test Case 3.6: Offline Swipe Queue
**Steps**:
1. Open DevTools → Network tab → Enable "Offline" mode
2. Swipe 3 cards
3. Disable "Offline" mode

**Expected Results**:
- ✅ Toast displays: "📱 Saved Offline" after each swipe
- ✅ Swipes queue in `localStorage` (key: `offlineSwipeQueue`)
- ✅ When back online, swipes sync automatically
- ✅ Network requests sent for all 3 swipes
- ✅ UI shows "Synced" confirmation

**Validation**: Check localStorage in Application tab

---

## 4. Screen Sizes and Orientations

### Test Case 4.1: Mobile Portrait (375×667)
**Steps**:
1. Open DevTools → Toggle Device Toolbar
2. Select "iPhone SE" (375×667)
3. Perform swipe tests 1.1-1.5

**Expected Results**:
- ✅ Card fills screen appropriately
- ✅ Exit distance = 375 + 100 = 475px
- ✅ Touch targets are large enough (min 44×44px)
- ✅ No horizontal overflow/scroll
- ✅ Animations remain smooth at 60fps

---

### Test Case 4.2: Mobile Landscape (667×375)
**Steps**:
1. Rotate device to landscape (or set DevTools to landscape)
2. Swipe card right

**Expected Results**:
- ✅ Card layout adapts (no vertical clipping)
- ✅ Exit distance = 667 + 100 = 767px
- ✅ Card aspect ratio maintained
- ✅ No UI overlap (buttons, labels)

---

### Test Case 4.3: Tablet (768×1024)
**Steps**:
1. Select "iPad Mini" in DevTools
2. Test swipe gestures

**Expected Results**:
- ✅ Larger card size with proper spacing
- ✅ Touch areas still accessible
- ✅ Animations scale proportionally
- ✅ No excessive whitespace

---

### Test Case 4.4: Desktop (1920×1080)
**Steps**:
1. Use full desktop viewport
2. Test mouse drag (not touch)

**Expected Results**:
- ✅ Mouse pointer events work identically to touch
- ✅ Cursor changes to "grab" during drag
- ✅ Card size capped at max-width
- ✅ Smooth animations on high-refresh monitors (120Hz+)

---

### Test Case 4.5: Ultra-Wide (3440×1440)
**Steps**:
1. Set viewport to ultra-wide resolution
2. Swipe card

**Expected Results**:
- ✅ Exit distance accounts for extra width
- ✅ Card centered correctly
- ✅ No stretching or distortion

---

### Test Case 4.6: Orientation Change Mid-Swipe
**Steps**:
1. Start dragging card in portrait mode
2. Rotate device to landscape while dragging
3. Release

**Expected Results**:
- ✅ Swipe completes or cancels gracefully
- ✅ No layout breaks
- ✅ Card repositions to new viewport
- ✅ No console errors

---

## 5. Console Error Validation

### Test Case 5.1: Clean Swipe (No Errors)
**Steps**:
1. Open DevTools Console
2. Filter: "All levels" (including warnings)
3. Perform 5 swipes (mix of right/left)

**Expected Results**:
- ✅ Zero errors logged
- ✅ Zero warnings logged
- ✅ No "Failed to fetch" errors (unless actually offline)
- ✅ No React warnings (e.g., "Cannot update unmounted component")

**Acceptable Logs**:
- Info logs for swipe actions (if logging enabled)
- Network requests in Network tab

---

### Test Case 5.2: Network Failure Handling
**Steps**:
1. Enable "Offline" mode in DevTools
2. Swipe card

**Expected Results**:
- ✅ No errors logged to console
- ✅ Toast shows: "📱 Saved Offline"
- ✅ Swipe queued in localStorage
- ✅ UI continues functioning

---

### Test Case 5.3: React Strict Mode
**Steps**:
1. Ensure `<React.StrictMode>` is enabled in `main.tsx`
2. Swipe cards in development mode

**Expected Results**:
- ✅ No double-mount warnings
- ✅ No useEffect dependency warnings
- ✅ Refs and animations work correctly despite double-render

---

### Test Case 5.4: Memory Leaks
**Steps**:
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Perform 20 swipes
4. Take second heap snapshot
5. Compare detached DOM nodes

**Expected Results**:
- ✅ No detached DOM nodes accumulating
- ✅ RecyclingCardStack reuses 3 fixed nodes
- ✅ Event listeners cleaned up properly
- ✅ Heap growth <5MB for 20 swipes

---

### Test Case 5.5: Animation Frame Budget
**Steps**:
1. Open DevTools → Performance tab
2. Start recording
3. Perform 5 rapid swipes
4. Stop recording
5. Analyze frame timings

**Expected Results**:
- ✅ All frames <16.67ms (60fps)
- ✅ No "long tasks" >50ms
- ✅ No forced reflows/layouts during drag
- ✅ GPU acceleration active (check Layers tab)

---

## 6. Performance Checks

### Test Case 6.1: First Touch Response Time
**Steps**:
1. Open DevTools → Performance tab
2. Record performance
3. Tap card to initiate drag
4. Stop recording immediately

**Expected Results**:
- ✅ First `pointerdown` to visual feedback <8ms
- ✅ No layout thrashing
- ✅ Event handler executes in single frame

**Measurement**:
```javascript
// Add to SwipeEngine.ts temporarily
console.time('firstTouch');
// ... in pointerdown handler
console.timeEnd('firstTouch'); // Should log <8ms
```

---

### Test Case 6.2: Drag Frame Rate
**Steps**:
1. Enable "Rendering" → "Frame Rendering Stats" in DevTools
2. Drag card slowly across screen
3. Observe FPS counter (top-right overlay)

**Expected Results**:
- ✅ Steady 60fps throughout drag
- ✅ No frame drops below 55fps
- ✅ GPU memory usage stable

**Stress Test**: Drag on low-end device (throttle CPU 4x in DevTools)

---

### Test Case 6.3: Paint Times
**Steps**:
1. Open DevTools → Rendering → "Paint flashing"
2. Swipe card
3. Observe green flash regions

**Expected Results**:
- ✅ Only card area repaints (not entire viewport)
- ✅ Background elements do NOT repaint
- ✅ Paint regions are minimal (<20% of screen)

**Optimization Check**: Verify `will-change: transform` is applied

---

### Test Case 6.4: Composite Layers
**Steps**:
1. Open DevTools → Layers tab
2. Inspect card element during drag

**Expected Results**:
- ✅ Card is promoted to its own compositor layer
- ✅ Transform applied on GPU (not CPU)
- ✅ No "layer explosion" (total layers <10)

---

### Test Case 6.5: JavaScript Heap During Rapid Swipes
**Steps**:
1. Open DevTools → Memory → "Allocation instrumentation on timeline"
2. Start recording
3. Perform 30 rapid swipes
4. Stop recording
5. Analyze heap allocations

**Expected Results**:
- ✅ Minimal allocations during swipe (<1MB per swipe)
- ✅ No retained detached DOM nodes
- ✅ GesturePredictor velocity buffer is bounded (max 10 entries)

---

### Test Case 6.6: Network Request Timing
**Steps**:
1. Open DevTools → Network tab
2. Swipe card
3. Observe POST request to record swipe

**Expected Results**:
- ✅ Request sent in "fire-and-forget" mode (non-blocking)
- ✅ Swipe animation completes regardless of network speed
- ✅ Request completes within 500ms (on good connection)
- ✅ Offline queue activates if request fails

---

## 7. Automated Test Script

See `tests/swipe-automation.js` for Puppeteer-based automated tests.

**Run with**:
```bash
# Install Puppeteer
npm install --save-dev puppeteer

# Run automated tests
node tests/swipe-automation.js
```

**Tests Covered**:
- Swipe right detection
- Swipe left detection
- Snap-back on half-swipe
- Deck index progression
- End-of-deck state
- DOM state transitions

---

## 8. Known Issues & Recent Fixes

### ✅ Fixed: Snap-Back Glitch (Commit e7cecb0)
**Problem**: Cards briefly snapped back to center before exiting
**Fix**: Replaced spring animations with tween animations for exit
**Validation**: Test Case 1.1, 1.2 should show zero bounce

### ✅ Fixed: End-of-Deck Error (Commit 524cde2)
**Problem**: Error state shown when user finished deck
**Fix**: Show "All Caught Up" before error state
**Validation**: Test Case 3.4 should show friendly message

### ✅ Fixed: Swipe Responsiveness (Commit 524cde2)
**Problem**: Swipes felt sluggish
**Fix**: Lowered thresholds (80px, 300 velocity), faster exit (0.15s)
**Validation**: Test Case 1.3, 1.4 should feel instant

---

## 9. Regression Testing Checklist

After any swipe-related code changes, verify:

- [ ] Test Cases 1.1-1.7 (Basic mechanics)
- [ ] Test Case 2.3 (Drag outside viewport)
- [ ] Test Case 3.3 (Swipe during exit animation)
- [ ] Test Case 3.4 (End of deck)
- [ ] Test Case 4.6 (Orientation change)
- [ ] Test Case 5.1 (Zero console errors)
- [ ] Test Case 6.2 (60fps maintained)
- [ ] Run automated test suite (`node tests/swipe-automation.js`)

---

## 10. Device Testing Matrix

| Device | Viewport | OS | Browser | Priority |
|--------|----------|----|---------| ---------|
| iPhone 14 Pro | 393×852 | iOS 17 | Safari | HIGH |
| iPhone SE | 375×667 | iOS 16 | Safari | HIGH |
| Pixel 7 | 412×915 | Android 14 | Chrome | HIGH |
| iPad Air | 820×1180 | iPadOS 17 | Safari | MEDIUM |
| Galaxy Tab | 768×1024 | Android 13 | Chrome | MEDIUM |
| Desktop | 1920×1080 | macOS/Windows | Chrome/Firefox | MEDIUM |

**Testing Priority**: Start with HIGH priority devices

---

## Sign-Off

**Tester**: _________________
**Date**: _________________
**Build/Commit**: _________________
**Status**: ⬜ Pass ⬜ Fail ⬜ Blocked

**Notes**:

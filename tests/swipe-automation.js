/**
 * Automated Swipe Functionality Test Suite
 *
 * Tests swipe mechanics, deck indexing, and DOM state transitions
 * using Puppeteer for browser automation.
 *
 * Prerequisites:
 * 1. Install Puppeteer: npm install --save-dev puppeteer
 * 2. Start dev server: yarn dev (in separate terminal)
 * 3. Ensure test account has active deck with cards
 *
 * Run: node tests/swipe-automation.js
 */

const puppeteer = require('puppeteer');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:8080',
  testEmail: 'test@example.com', // Update with valid test account
  testPassword: 'testpassword123', // Update with valid password
  timeout: 30000,
  headless: false, // Set to true for CI/CD
  slowMo: 50, // Slow down for visual debugging
};

// Test Results Tracking
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Utility: Log test result
function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (message) console.log(`   ${message}`);

  results.tests.push({ testName, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// Utility: Swipe card by simulating touch gesture
async function swipeCard(page, direction = 'right', distance = 200) {
  const card = await page.$('.swipe-card, [class*="swipe"]');
  if (!card) throw new Error('Card element not found');

  const box = await card.boundingBox();
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endX = direction === 'right'
    ? startX + distance
    : startX - distance;

  // Simulate touch drag
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(50);

  // Drag in steps for realistic gesture
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const x = startX + (endX - startX) * (i / steps);
    await page.mouse.move(x, startY, { steps: 5 });
    await page.waitForTimeout(10);
  }

  await page.mouse.up();

  // Wait for animation to complete
  await page.waitForTimeout(300);
}

// Utility: Get deck state from Zustand store
async function getDeckState(page) {
  return await page.evaluate(() => {
    if (!window.swipeDeckStore) return null;
    const state = window.swipeDeckStore.getState();
    return {
      currentIndex: state.currentIndex,
      deckLength: state.deckItems?.length || 0,
      swipedCount: state.swipedIds?.size || 0,
      lastSwipedId: state.lastSwipedId,
    };
  });
}

// Utility: Check for console errors
async function setupConsoleErrorListener(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  return errors;
}

// Test Suite
async function runTests() {
  console.log('🚀 Starting Swipe Automation Tests\n');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Headless: ${CONFIG.headless}\n`);

  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const consoleErrors = await setupConsoleErrorListener(page);

  // Set viewport to mobile size
  await page.setViewport({ width: 375, height: 667 });

  try {
    // ============================
    // Test 0: Setup & Authentication
    // ============================
    console.log('📋 Test 0: Setup & Authentication');

    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2' });

    // Check if already logged in
    const isLoggedIn = await page.evaluate(() => {
      const token = localStorage.getItem('supabase.auth.token');
      return !!token;
    });

    if (!isLoggedIn) {
      console.log('   Logging in...');
      // Navigate to login and authenticate
      // NOTE: Update selectors based on your actual login form
      await page.goto(`${CONFIG.baseUrl}/login`);
      await page.type('input[type="email"]', CONFIG.testEmail);
      await page.type('input[type="password"]', CONFIG.testPassword);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Navigate to swipe deck
    await page.goto(`${CONFIG.baseUrl}/client-dashboard`, {
      waitUntil: 'networkidle2'
    });

    // Wait for deck to load
    await page.waitForSelector('[class*="swipe"], .swipe-card', {
      timeout: CONFIG.timeout
    });

    logTest('Setup & Authentication', true, 'Successfully loaded deck');

    // ============================
    // Test 1: Swipe Right Detection
    // ============================
    console.log('\n📋 Test 1: Swipe Right Detection');

    const initialState = await getDeckState(page);
    console.log(`   Initial index: ${initialState?.currentIndex}`);

    await swipeCard(page, 'right', 200);

    const afterSwipeState = await getDeckState(page);
    console.log(`   After swipe index: ${afterSwipeState?.currentIndex}`);

    const indexIncremented = afterSwipeState?.currentIndex === (initialState?.currentIndex || 0) + 1;
    const swipeRecorded = afterSwipeState?.swipedCount > initialState?.swipedCount;

    logTest(
      'Swipe Right Detection',
      indexIncremented && swipeRecorded,
      `Index: ${initialState?.currentIndex} → ${afterSwipeState?.currentIndex}, Swiped: ${afterSwipeState?.swipedCount}`
    );

    // ============================
    // Test 2: Swipe Left Detection
    // ============================
    console.log('\n📋 Test 2: Swipe Left Detection');

    const beforeLeftSwipe = await getDeckState(page);
    await swipeCard(page, 'left', 200);
    const afterLeftSwipe = await getDeckState(page);

    const leftSwipeWorks = afterLeftSwipe?.currentIndex === beforeLeftSwipe.currentIndex + 1;

    logTest(
      'Swipe Left Detection',
      leftSwipeWorks,
      `Index: ${beforeLeftSwipe?.currentIndex} → ${afterLeftSwipe?.currentIndex}`
    );

    // ============================
    // Test 3: Half-Swipe Snap-Back
    // ============================
    console.log('\n📋 Test 3: Half-Swipe Snap-Back');

    const beforeHalfSwipe = await getDeckState(page);

    // Swipe only 50px (below 80px threshold)
    await swipeCard(page, 'right', 50);

    const afterHalfSwipe = await getDeckState(page);

    // Index should NOT change
    const noIndexChange = afterHalfSwipe?.currentIndex === beforeHalfSwipe?.currentIndex;

    // Card should be visible (not exited)
    const cardVisible = await page.$('[class*="swipe"], .swipe-card');

    logTest(
      'Half-Swipe Snap-Back',
      noIndexChange && !!cardVisible,
      `Index unchanged: ${beforeHalfSwipe?.currentIndex} = ${afterHalfSwipe?.currentIndex}`
    );

    // ============================
    // Test 4: Rapid Successive Swipes
    // ============================
    console.log('\n📋 Test 4: Rapid Successive Swipes');

    const beforeRapid = await getDeckState(page);

    // Perform 3 rapid swipes
    await swipeCard(page, 'right', 200);
    await page.waitForTimeout(100);
    await swipeCard(page, 'left', 200);
    await page.waitForTimeout(100);
    await swipeCard(page, 'right', 200);
    await page.waitForTimeout(300);

    const afterRapid = await getDeckState(page);

    const expectedIndex = beforeRapid.currentIndex + 3;
    const rapidSwipesWork = afterRapid?.currentIndex === expectedIndex;

    logTest(
      'Rapid Successive Swipes',
      rapidSwipesWork,
      `3 swipes completed: ${beforeRapid?.currentIndex} → ${afterRapid?.currentIndex}`
    );

    // ============================
    // Test 5: DOM State Transitions
    // ============================
    console.log('\n📋 Test 5: DOM State Transitions');

    // Check that new card appears after swipe
    const cardBeforeSwipe = await page.evaluate(() => {
      const card = document.querySelector('[class*="swipe"], .swipe-card');
      return card ? card.getAttribute('data-listing-id') || card.textContent?.substring(0, 50) : null;
    });

    await swipeCard(page, 'right', 200);
    await page.waitForTimeout(300);

    const cardAfterSwipe = await page.evaluate(() => {
      const card = document.querySelector('[class*="swipe"], .swipe-card');
      return card ? card.getAttribute('data-listing-id') || card.textContent?.substring(0, 50) : null;
    });

    const cardChanged = cardBeforeSwipe !== cardAfterSwipe;

    logTest(
      'DOM State Transitions',
      cardChanged,
      cardChanged ? 'New card appeared after swipe' : 'Same card still visible'
    );

    // ============================
    // Test 6: No Console Errors
    // ============================
    console.log('\n📋 Test 6: No Console Errors');

    const hasNoErrors = consoleErrors.length === 0;

    if (!hasNoErrors) {
      console.log('   Errors found:');
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    }

    logTest(
      'No Console Errors',
      hasNoErrors,
      hasNoErrors ? 'Zero errors logged' : `${consoleErrors.length} errors found`
    );

    // ============================
    // Test 7: Animation Performance
    // ============================
    console.log('\n📋 Test 7: Animation Performance');

    // Start performance metrics
    await page.evaluate(() => performance.mark('swipe-start'));
    await swipeCard(page, 'right', 200);
    await page.evaluate(() => performance.mark('swipe-end'));

    const perfMetrics = await page.evaluate(() => {
      performance.measure('swipe-duration', 'swipe-start', 'swipe-end');
      const measure = performance.getEntriesByName('swipe-duration')[0];
      return {
        duration: measure.duration,
        target: 300, // Expected: <300ms total
      };
    });

    const goodPerformance = perfMetrics.duration < perfMetrics.target;

    logTest(
      'Animation Performance',
      goodPerformance,
      `Swipe duration: ${perfMetrics.duration.toFixed(0)}ms (target: <${perfMetrics.target}ms)`
    );

    // ============================
    // Test 8: End of Deck State
    // ============================
    console.log('\n📋 Test 8: End of Deck State');

    // Swipe through remaining cards to reach end
    let currentState = await getDeckState(page);
    const maxSwipes = 20; // Safety limit
    let swipeCount = 0;

    while (currentState.currentIndex < currentState.deckLength && swipeCount < maxSwipes) {
      await swipeCard(page, 'right', 200);
      await page.waitForTimeout(200);
      currentState = await getDeckState(page);
      swipeCount++;
    }

    // Check for "All Caught Up" message (not error state)
    const endOfDeckMessage = await page.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('All Caught Up') || text.includes('caught up');
    });

    // Should NOT have error boundary
    const noErrorBoundary = await page.evaluate(() => {
      const text = document.body.textContent;
      return !text.includes('Something went wrong') && !text.includes('Error');
    });

    logTest(
      'End of Deck State',
      endOfDeckMessage && noErrorBoundary,
      endOfDeckMessage
        ? '"All Caught Up" displayed correctly'
        : 'End state not found or error shown'
    );

    // ============================
    // Test 9: Responsive Viewport
    // ============================
    console.log('\n📋 Test 9: Responsive Viewport');

    // Test on tablet size
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('[class*="swipe"], .swipe-card', { timeout: 5000 });

    const tabletCard = await page.$('[class*="swipe"], .swipe-card');
    const tabletWorks = !!tabletCard;

    // Test on desktop size
    await page.setViewport({ width: 1920, height: 1080 });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('[class*="swipe"], .swipe-card', { timeout: 5000 });

    const desktopCard = await page.$('[class*="swipe"], .swipe-card');
    const desktopWorks = !!desktopCard;

    logTest(
      'Responsive Viewport',
      tabletWorks && desktopWorks,
      `Tablet: ${tabletWorks ? 'OK' : 'FAIL'}, Desktop: ${desktopWorks ? 'OK' : 'FAIL'}`
    );

    // ============================
    // Test 10: State Persistence
    // ============================
    console.log('\n📋 Test 10: State Persistence');

    // Navigate away and back
    await page.goto(`${CONFIG.baseUrl}/`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(500);
    await page.goto(`${CONFIG.baseUrl}/client-dashboard`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(500);

    const persistedState = await getDeckState(page);
    const stateRestored = persistedState && persistedState.currentIndex > 0;

    logTest(
      'State Persistence',
      stateRestored,
      stateRestored
        ? `State restored: index ${persistedState.currentIndex}`
        : 'State not persisted'
    );

  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }

  // Print Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

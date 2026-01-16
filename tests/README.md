# Swipe Functionality Test Suite

Comprehensive testing suite for swipe card functionality in the Tinderent application.

## Quick Start

### 1. Run the Application
```bash
# Start development server
yarn dev

# Application will be available at http://localhost:8080
```

### 2. Manual Testing
Follow the comprehensive checklist in [`../QA_SWIPE_CHECKLIST.md`](../QA_SWIPE_CHECKLIST.md)

### 3. Automated Testing

#### Option A: Puppeteer (Recommended)
```bash
# Install Puppeteer
npm install --save-dev puppeteer

# Update test credentials in swipe-automation.js
# Edit CONFIG.testEmail and CONFIG.testPassword

# Run tests
node tests/swipe-automation.js
```

**Features**:
- ✅ Automated swipe gestures
- ✅ Deck state validation
- ✅ Performance metrics
- ✅ Console error detection
- ✅ DOM state transitions
- ✅ End-of-deck handling
- ✅ Responsive viewport testing

#### Option B: Cypress
```bash
# Install Cypress
npm install --save-dev cypress

# Initialize Cypress
npx cypress open

# Copy test file to Cypress directory
mkdir -p cypress/e2e
cp tests/swipe.cy.js cypress/e2e/

# Run tests interactively
npx cypress open

# Or run headless
npx cypress run --spec cypress/e2e/swipe.cy.js
```

**Features**:
- ✅ Interactive test runner
- ✅ Time-travel debugging
- ✅ Automatic screenshots on failure
- ✅ Video recording
- ✅ Detailed logs

---

## Test Coverage

### Automated Tests

| Test Case | Puppeteer | Cypress | Manual |
|-----------|-----------|---------|--------|
| Swipe Right Detection | ✅ | ✅ | ✅ |
| Swipe Left Detection | ✅ | ✅ | ✅ |
| Half-Swipe Snap-Back | ✅ | ✅ | ✅ |
| Rapid Successive Swipes | ✅ | ✅ | ✅ |
| DOM State Transitions | ✅ | ✅ | ✅ |
| Console Error Detection | ✅ | ✅ | ✅ |
| Animation Performance | ✅ | ✅ | ✅ |
| End of Deck State | ✅ | ✅ | ✅ |
| Responsive Viewports | ✅ | ✅ | ✅ |
| State Persistence | ✅ | ✅ | ✅ |
| Vertical Drag | - | - | ✅ |
| Diagonal Drag | - | - | ✅ |
| Multi-Touch | - | - | ✅ |
| Orientation Change | - | - | ✅ |
| Paint Times | - | - | ✅ |
| Memory Leaks | - | - | ✅ |

### Manual Testing Only

Some tests require manual validation:
- Edge-case dragging (drag from card edge, outside viewport)
- Multi-touch gestures
- Device orientation changes
- Performance profiling (DevTools)
- Memory leak detection
- Paint flashing analysis

See [`../QA_SWIPE_CHECKLIST.md`](../QA_SWIPE_CHECKLIST.md) for detailed steps.

---

## Configuration

### Puppeteer Configuration

Edit `tests/swipe-automation.js`:

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:8080',
  testEmail: 'your-test@example.com',
  testPassword: 'your-password',
  timeout: 30000,
  headless: false, // Set true for CI/CD
  slowMo: 50, // Adjust speed
};
```

### Cypress Configuration

Edit `cypress.config.js` (create if not exists):

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    viewportWidth: 375,
    viewportHeight: 667,
    video: true,
    screenshotOnRunFailure: true,
  },
});
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| First Touch Response | <8ms | <16ms |
| Frame Rate | 60fps | >55fps |
| Frame Time | <16.67ms | <20ms |
| Exit Animation | ~150ms | <200ms |
| Swipe Detection | <50ms | <100ms |
| Paint Region | <20% screen | <30% |

### How to Measure

#### 1. Chrome DevTools Performance
```
1. Open DevTools → Performance tab
2. Click Record
3. Perform swipe gesture
4. Stop recording
5. Analyze:
   - Frame rate (should show 60fps)
   - Scripting time (<10ms)
   - Rendering time (<5ms)
   - Painting time (<2ms)
```

#### 2. Chrome DevTools Rendering
```
1. Open DevTools → More tools → Rendering
2. Enable:
   - Frame Rendering Stats (FPS overlay)
   - Paint flashing (green regions)
   - Layer borders (compositor layers)
3. Perform swipes and observe metrics
```

#### 3. Memory Profiling
```
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Perform 20 swipes
4. Take second snapshot
5. Compare for:
   - Detached DOM nodes (should be 0)
   - Memory growth (<5MB)
   - Event listener leaks
```

---

## Troubleshooting

### Puppeteer Tests Failing

**Issue**: "Card element not found"
- **Solution**: Ensure dev server is running (`yarn dev`)
- **Solution**: Update card selector in `swipeCard()` function

**Issue**: "Authentication failed"
- **Solution**: Update `CONFIG.testEmail` and `CONFIG.testPassword` with valid test account
- **Solution**: Check if login form selectors match your app

**Issue**: Tests timeout
- **Solution**: Increase `CONFIG.timeout` value
- **Solution**: Check network speed (background fetch may be slow)

### Cypress Tests Failing

**Issue**: "Timed out retrying"
- **Solution**: Ensure deck has cards to swipe
- **Solution**: Check if user is authenticated
- **Solution**: Increase timeout in `cy.get()` calls

**Issue**: Swipe not triggering
- **Solution**: Verify pointer event names match your implementation
- **Solution**: Adjust swipe distance in `swipeCard()` helper

### Manual Testing Issues

**Issue**: Cards snap back unexpectedly
- **Solution**: Check swipe threshold (should be 80px)
- **Solution**: Verify velocity threshold (should be 300px/s)
- **Solution**: Review recent commits for animation fixes

**Issue**: Console errors during swipe
- **Solution**: Check Network tab for failed API calls
- **Solution**: Verify Supabase connection
- **Solution**: Review error logs for stack traces

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Swipe Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install Puppeteer
        run: npm install --save-dev puppeteer

      - name: Build app
        run: npm run build

      - name: Start server
        run: npm run preview &
        env:
          CI: true

      - name: Wait for server
        run: npx wait-on http://localhost:4173

      - name: Run Puppeteer tests
        run: node tests/swipe-automation.js
        env:
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

---

## Contributing

When adding new swipe-related features:

1. ✅ Update manual checklist in `QA_SWIPE_CHECKLIST.md`
2. ✅ Add automated test to `swipe-automation.js` or `swipe.cy.js`
3. ✅ Run full test suite before committing
4. ✅ Update this README with new test coverage

---

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Chrome DevTools Performance Guide](https://developer.chrome.com/docs/devtools/performance/)
- [Framer Motion Animation Docs](https://www.framer.com/motion/)

---

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review recent commits for related fixes
3. Run manual tests to isolate problem
4. Create detailed bug report with reproduction steps

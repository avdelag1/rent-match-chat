/**
 * Real-Time Swipe Performance Monitor
 *
 * Inject this script into browser console to monitor swipe performance in real-time.
 * Tracks FPS, frame times, animation durations, and memory usage.
 *
 * Usage:
 * 1. Open browser DevTools console
 * 2. Copy and paste this entire script
 * 3. Perform swipe gestures
 * 4. View real-time metrics in console and overlay
 *
 * Or run from command line:
 * node tests/performance-monitor.js
 * (Note: CLI version uses Puppeteer to automate monitoring)
 */

// ============================================
// BROWSER VERSION (Paste in Console)
// ============================================

if (typeof window !== 'undefined') {
  // Running in browser
  (function() {
    console.log('🎯 Swipe Performance Monitor Active');
    console.log('Tracking: FPS, Frame Times, Animation Durations, Paint Events');
    console.log('Perform swipe gestures to see metrics\n');

    // Metrics storage
    const metrics = {
      fps: [],
      frameTimes: [],
      animationDurations: [],
      paintEvents: 0,
      swipeCount: 0,
      errors: [],
    };

    // FPS Counter
    let lastFrameTime = performance.now();
    let frameCount = 0;

    function measureFPS() {
      const now = performance.now();
      const delta = now - lastFrameTime;
      frameCount++;

      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        metrics.fps.push(fps);

        // Log if FPS drops below 55
        if (fps < 55) {
          console.warn(`⚠️ FPS Drop: ${fps}fps (target: 60fps)`);
        }

        frameCount = 0;
        lastFrameTime = now;
      }

      requestAnimationFrame(measureFPS);
    }

    measureFPS();

    // Frame Time Monitor
    let lastTime = performance.now();
    function monitorFrameTime() {
      const now = performance.now();
      const frameTime = now - lastTime;

      if (frameTime > 16.67) {
        metrics.frameTimes.push(frameTime);

        // Log long frames
        if (frameTime > 33) {
          console.warn(`⚠️ Long Frame: ${frameTime.toFixed(2)}ms (target: <16.67ms)`);
        }
      }

      lastTime = now;
      requestAnimationFrame(monitorFrameTime);
    }

    monitorFrameTime();

    // Swipe Detection & Timing
    const swipeElements = document.querySelectorAll('[class*="swipe"], .swipe-card');

    if (swipeElements.length > 0) {
      console.log(`✅ Found ${swipeElements.length} swipe card(s)`);

      swipeElements.forEach((el, index) => {
        let swipeStartTime = null;

        // Detect pointer down
        el.addEventListener('pointerdown', () => {
          swipeStartTime = performance.now();
          console.log(`👆 Swipe initiated on card ${index + 1}`);
        });

        // Detect pointer up
        el.addEventListener('pointerup', () => {
          if (swipeStartTime) {
            const duration = performance.now() - swipeStartTime;
            metrics.animationDurations.push(duration);
            metrics.swipeCount++;

            console.log(`✅ Swipe completed in ${duration.toFixed(0)}ms`);

            if (duration > 300) {
              console.warn(`⚠️ Slow Swipe: ${duration.toFixed(0)}ms (target: <300ms)`);
            }

            swipeStartTime = null;
          }
        });
      });
    } else {
      console.warn('⚠️ No swipe cards found. Navigate to client/owner dashboard.');
    }

    // Paint Event Monitor (Performance Observer)
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            metrics.paintEvents++;
          }
        }
      });

      try {
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // Paint events not supported in this browser
      }
    }

    // Error Logger
    const originalError = console.error;
    console.error = function(...args) {
      metrics.errors.push(args.join(' '));
      originalError.apply(console, args);
    };

    // Summary Report (Call manually or after swipes)
    window.printSwipeMetrics = function() {
      console.log('\n' + '='.repeat(50));
      console.log('📊 SWIPE PERFORMANCE REPORT');
      console.log('='.repeat(50));

      console.log(`\n🎯 Swipes Performed: ${metrics.swipeCount}`);

      if (metrics.fps.length > 0) {
        const avgFPS = (metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length).toFixed(1);
        const minFPS = Math.min(...metrics.fps);
        console.log(`\n📈 Frame Rate:`);
        console.log(`   Average: ${avgFPS}fps`);
        console.log(`   Minimum: ${minFPS}fps`);
        console.log(`   Target: 60fps`);
        console.log(`   Status: ${minFPS >= 55 ? '✅ PASS' : '❌ FAIL'}`);
      }

      if (metrics.frameTimes.length > 0) {
        const avgFrameTime = (metrics.frameTimes.reduce((a, b) => a + b, 0) / metrics.frameTimes.length).toFixed(2);
        const maxFrameTime = Math.max(...metrics.frameTimes).toFixed(2);
        console.log(`\n⏱️ Frame Times:`);
        console.log(`   Average: ${avgFrameTime}ms`);
        console.log(`   Maximum: ${maxFrameTime}ms`);
        console.log(`   Target: <16.67ms`);
        console.log(`   Long Frames: ${metrics.frameTimes.filter(t => t > 16.67).length}`);
      }

      if (metrics.animationDurations.length > 0) {
        const avgDuration = (metrics.animationDurations.reduce((a, b) => a + b, 0) / metrics.animationDurations.length).toFixed(0);
        const maxDuration = Math.max(...metrics.animationDurations).toFixed(0);
        console.log(`\n🎬 Animation Durations:`);
        console.log(`   Average: ${avgDuration}ms`);
        console.log(`   Maximum: ${maxDuration}ms`);
        console.log(`   Target: <300ms`);
        console.log(`   Status: ${maxDuration < 300 ? '✅ PASS' : '❌ FAIL'}`);
      }

      console.log(`\n🎨 Paint Events: ${metrics.paintEvents}`);

      if (metrics.errors.length > 0) {
        console.log(`\n❌ Errors Logged: ${metrics.errors.length}`);
        metrics.errors.forEach((err, i) => {
          console.log(`   ${i + 1}. ${err}`);
        });
      } else {
        console.log(`\n✅ No Errors Logged`);
      }

      console.log('\n' + '='.repeat(50));
      console.log('To generate new report, call: printSwipeMetrics()');
    };

    // Auto-print report after 10 swipes
    const checkAutoReport = setInterval(() => {
      if (metrics.swipeCount >= 10) {
        console.log('\n🎉 10 swipes completed! Generating report...\n');
        window.printSwipeMetrics();
        clearInterval(checkAutoReport);
      }
    }, 1000);

    console.log('\n📝 Call printSwipeMetrics() anytime to see report');
    console.log('📝 Report will auto-generate after 10 swipes\n');
  })();
}

// ============================================
// NODE.JS VERSION (Automated with Puppeteer)
// ============================================

if (typeof window === 'undefined') {
  // Running in Node.js
  const puppeteer = require('puppeteer');

  async function runPerformanceMonitor() {
    console.log('🚀 Starting Automated Performance Monitor\n');

    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Enable Performance monitoring
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');

    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });

    console.log('📱 Viewport: 375×667 (iPhone SE)');
    console.log('🌐 Navigating to http://localhost:8080/client-dashboard\n');

    await page.goto('http://localhost:8080/client-dashboard', {
      waitUntil: 'networkidle2'
    });

    // Wait for swipe card
    await page.waitForSelector('[class*="swipe"], .swipe-card', { timeout: 10000 });

    console.log('✅ Page loaded. Starting performance monitoring...\n');

    // Inject monitoring script
    await page.evaluate(() => {
      window.performanceMetrics = {
        fps: [],
        frameTimes: [],
        swipes: [],
      };

      // FPS tracker
      let lastFrameTime = performance.now();
      let frameCount = 0;

      function measureFPS() {
        const now = performance.now();
        const delta = now - lastFrameTime;
        frameCount++;

        if (delta >= 1000) {
          const fps = Math.round((frameCount * 1000) / delta);
          window.performanceMetrics.fps.push(fps);
          frameCount = 0;
          lastFrameTime = now;
        }

        requestAnimationFrame(measureFPS);
      }

      measureFPS();

      // Track swipes
      document.addEventListener('pointerdown', () => {
        window.swipeStart = performance.now();
      });

      document.addEventListener('pointerup', () => {
        if (window.swipeStart) {
          const duration = performance.now() - window.swipeStart;
          window.performanceMetrics.swipes.push(duration);
          window.swipeStart = null;
        }
      });
    });

    // Perform automated swipes
    console.log('🤖 Performing 10 automated swipes...\n');

    for (let i = 1; i <= 10; i++) {
      const card = await page.$('[class*="swipe"], .swipe-card');
      if (!card) break;

      const box = await card.boundingBox();
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      const endX = startX + (i % 2 === 0 ? 200 : -200); // Alternate left/right

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, startY, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(300);

      console.log(`✅ Swipe ${i}/10 completed`);
    }

    // Collect metrics
    console.log('\n📊 Collecting performance metrics...\n');

    const metrics = await page.evaluate(() => window.performanceMetrics);

    // Performance metrics from CDP
    const performanceMetrics = await client.send('Performance.getMetrics');

    // Print Report
    console.log('='.repeat(50));
    console.log('📊 AUTOMATED PERFORMANCE REPORT');
    console.log('='.repeat(50));

    const avgFPS = (metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length).toFixed(1);
    const minFPS = Math.min(...metrics.fps);

    console.log(`\n📈 Frame Rate:`);
    console.log(`   Average: ${avgFPS}fps`);
    console.log(`   Minimum: ${minFPS}fps`);
    console.log(`   Status: ${minFPS >= 55 ? '✅ PASS' : '❌ FAIL'}`);

    if (metrics.swipes.length > 0) {
      const avgSwipe = (metrics.swipes.reduce((a, b) => a + b, 0) / metrics.swipes.length).toFixed(0);
      const maxSwipe = Math.max(...metrics.swipes).toFixed(0);

      console.log(`\n🎬 Swipe Durations:`);
      console.log(`   Average: ${avgSwipe}ms`);
      console.log(`   Maximum: ${maxSwipe}ms`);
      console.log(`   Status: ${maxSwipe < 300 ? '✅ PASS' : '❌ FAIL'}`);
    }

    // Memory metrics
    const jsHeapUsed = performanceMetrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value || 0;
    const jsHeapTotal = performanceMetrics.metrics.find(m => m.name === 'JSHeapTotalSize')?.value || 0;

    console.log(`\n💾 Memory Usage:`);
    console.log(`   JS Heap Used: ${(jsHeapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   JS Heap Total: ${(jsHeapTotal / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n' + '='.repeat(50));

    // Keep browser open for manual inspection
    console.log('\n✨ Browser will remain open for manual inspection');
    console.log('Press Ctrl+C to close\n');
  }

  runPerformanceMonitor().catch(console.error);
}

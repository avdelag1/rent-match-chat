/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals: LCP, FID, CLS
 * Reports to analytics/logging service
 */

export interface VitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB';
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
  rating: 'good' | 'needs improvement' | 'poor';
}

/**
 * Report Web Vital to analytics
 * In production, send to your analytics service (Sentry, DataDog, etc.)
 */
function reportMetric(metric: VitalMetric) {
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
  }

  // Send to analytics service
  // Example: sendToAnalytics(metric)
  // Example: Sentry.captureMessage(`Web Vital: ${metric.name}`, 'info', { metric })

  // Store in localStorage for debugging
  try {
    const vitals = JSON.parse(localStorage.getItem('webVitals') || '[]');
    vitals.push({
      ...metric,
      timestamp: new Date().toISOString()
    });
    // Keep only last 50 metrics
    if (vitals.length > 50) {
      vitals.shift();
    }
    localStorage.setItem('webVitals', JSON.stringify(vitals));
  } catch (e) {
    // Silent fail
  }
}

/**
 * Get LCP (Largest Contentful Paint) rating
 * Good: < 2.5s
 * Needs Improvement: 2.5s - 4s
 * Poor: > 4s
 */
function getLCPRating(value: number): 'good' | 'needs improvement' | 'poor' {
  if (value < 2500) return 'good';
  if (value < 4000) return 'needs improvement';
  return 'poor';
}

/**
 * Get FID (First Input Delay) rating
 * Good: < 100ms
 * Needs Improvement: 100ms - 300ms
 * Poor: > 300ms
 */
function getFIDRating(value: number): 'good' | 'needs improvement' | 'poor' {
  if (value < 100) return 'good';
  if (value < 300) return 'needs improvement';
  return 'poor';
}

/**
 * Get CLS (Cumulative Layout Shift) rating
 * Good: < 0.1
 * Needs Improvement: 0.1 - 0.25
 * Poor: > 0.25
 */
function getCLSRating(value: number): 'good' | 'needs improvement' | 'poor' {
  if (value < 0.1) return 'good';
  if (value < 0.25) return 'needs improvement';
  return 'poor';
}

/**
 * Monitor LCP (Largest Contentful Paint)
 * Measures when the largest content element appears
 */
export function monitorLCP() {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    const lcp = lastEntry.renderTime || lastEntry.loadTime;

    reportMetric({
      name: 'LCP',
      value: lcp,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      rating: getLCPRating(lcp)
    });
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.warn('LCP monitoring not supported');
  }
}

/**
 * Monitor FID (First Input Delay)
 * Measures delay from user input to browser response
 */
export function monitorFID() {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();

    entries.forEach((entry) => {
      const fid = entry.processingStart - entry.startTime;

      reportMetric({
        name: 'FID',
        value: fid,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        rating: getFIDRating(fid)
      });
    });
  });

  try {
    observer.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.warn('FID monitoring not supported');
  }
}

/**
 * Monitor CLS (Cumulative Layout Shift)
 * Measures unexpected layout shifts
 */
export function monitorCLS() {
  let clsValue = 0;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();

    entries.forEach((entry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    });

    reportMetric({
      name: 'CLS',
      value: clsValue,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      rating: getCLSRating(clsValue)
    });
  });

  try {
    observer.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.warn('CLS monitoring not supported');
  }
}

/**
 * Initialize all Web Vitals monitoring
 */
export function initWebVitalsMonitoring() {
  if ('PerformanceObserver' in window) {
    monitorLCP();
    monitorFID();
    monitorCLS();

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Web Vitals monitoring initialized');
    }
  }
}

/**
 * Get all recorded Web Vitals from localStorage
 */
export function getRecordedVitals(): VitalMetric[] {
  try {
    return JSON.parse(localStorage.getItem('webVitals') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear recorded Web Vitals
 */
export function clearRecordedVitals() {
  localStorage.removeItem('webVitals');
}

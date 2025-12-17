/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals: LCP, FID, CLS
 * Reports to analytics/logging service
 */

import { STORAGE, LIMITS } from '@/constants/app';

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
  if (import.meta.env.DEV) {
  }

  // Send to analytics service
  // Example: sendToAnalytics(metric)
  // Example: Sentry.captureMessage(`Web Vital: ${metric.name}`, 'info', { metric })

  // Store in localStorage for debugging
  try {
    const vitals = JSON.parse(localStorage.getItem(STORAGE.WEB_VITALS_KEY) || '[]');
    vitals.push({
      ...metric,
      timestamp: new Date().toISOString()
    });
    // Keep only last MAX_WEB_VITALS_STORED metrics
    if (vitals.length > LIMITS.MAX_WEB_VITALS_STORED) {
      vitals.shift();
    }
    localStorage.setItem(STORAGE.WEB_VITALS_KEY, JSON.stringify(vitals));
  } catch (e) {
    console.error('Web vitals storage error:', e);
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

    const lcpEntry = lastEntry as PerformanceEntry & {
      renderTime?: number;
      loadTime?: number;
    };
    
    const lcp = lcpEntry.renderTime || lcpEntry.loadTime || 0;

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
    console.error('LCP monitoring error:', e);
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
      const fidEntry = entry as PerformanceEntry & {
        processingStart?: number;
      };
      
      const fid = (fidEntry.processingStart || entry.startTime) - entry.startTime;

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
    console.error('FID monitoring error:', e);
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
    console.error('CLS monitoring error:', e);
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

    if (import.meta.env.DEV) {
    }
  }
}

/**
 * Get all recorded Web Vitals from localStorage
 */
export function getRecordedVitals(): VitalMetric[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.WEB_VITALS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear recorded Web Vitals
 */
export function clearRecordedVitals() {
  localStorage.removeItem(STORAGE.WEB_VITALS_KEY);
}

/**
 * Google Analytics 4 Integration
 * Track user interactions, swipes, conversions, and custom events
 */

// GA4 Measurement ID - Replace with your actual ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Initialize GA4
export function initGA4() {
  if (typeof window === 'undefined') return;

  // Check if already initialized
  if (window.gtag) return;

  // Load gtag.js script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure'
  });
}

// Event tracking types
export type AnalyticsEvent =
  | 'page_view'
  | 'swipe_left'
  | 'swipe_right'
  | 'super_like'
  | 'tap_to_detail'
  | 'listing_view'
  | 'profile_view'
  | 'match_created'
  | 'message_sent'
  | 'conversation_started'
  | 'listing_created'
  | 'search_performed'
  | 'filter_applied'
  | 'share_listing'
  | 'save_listing'
  | 'signup'
  | 'login'
  | 'profile_complete';

interface EventParams {
  [key: string]: any;
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: AnalyticsEvent, params?: EventParams) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    ...params,
    timestamp: new Date().toISOString()
  });

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', eventName, params);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title
  });

  if (import.meta.env.DEV) {
    console.log('📊 Page View:', path, title);
  }
}

/**
 * Track swipe action
 */
export function trackSwipe(direction: 'left' | 'right', targetType: 'listing' | 'profile', targetId: string) {
  const eventName: AnalyticsEvent = direction === 'right' ? 'swipe_right' : 'swipe_left';
  trackEvent(eventName, {
    target_type: targetType,
    target_id: targetId,
    swipe_direction: direction
  });
}

/**
 * Track super like
 */
export function trackSuperLike(targetType: 'listing' | 'profile', targetId: string) {
  trackEvent('super_like', {
    target_type: targetType,
    target_id: targetId
  });
}

/**
 * Track detail view (when user taps card)
 */
export function trackDetailView(itemType: 'listing' | 'profile', itemId: string, itemTitle?: string) {
  trackEvent('tap_to_detail', {
    item_type: itemType,
    item_id: itemId,
    item_title: itemTitle
  });

  // Also track as content view
  const eventName: AnalyticsEvent = itemType === 'listing' ? 'listing_view' : 'profile_view';
  trackEvent(eventName, {
    item_id: itemId,
    item_title: itemTitle
  });
}

/**
 * Track match creation
 */
export function trackMatch(matchId: string, listingId?: string) {
  trackEvent('match_created', {
    match_id: matchId,
    listing_id: listingId,
    value: 1 // Can be used for conversion value
  });
}

/**
 * Track message sent
 */
export function trackMessage(conversationId: string, isFirst: boolean) {
  if (isFirst) {
    trackEvent('conversation_started', {
      conversation_id: conversationId
    });
  }

  trackEvent('message_sent', {
    conversation_id: conversationId,
    is_first_message: isFirst
  });
}

/**
 * Track listing creation
 */
export function trackListingCreated(listingId: string, category: string, price?: number) {
  trackEvent('listing_created', {
    listing_id: listingId,
    category: category,
    price: price,
    value: 1
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultsCount: number) {
  trackEvent('search_performed', {
    search_term: searchTerm,
    results_count: resultsCount
  });
}

/**
 * Track filter usage
 */
export function trackFilterApplied(filters: Record<string, any>) {
  trackEvent('filter_applied', {
    filters: JSON.stringify(filters),
    filter_count: Object.keys(filters).length
  });
}

/**
 * Track share action
 */
export function trackShare(itemType: 'listing' | 'profile', itemId: string, method: string) {
  trackEvent('share_listing', {
    item_type: itemType,
    item_id: itemId,
    method: method // 'copy_link', 'whatsapp', 'facebook', etc.
  });
}

/**
 * Track user signup
 */
export function trackSignup(method: string, userId?: string) {
  trackEvent('signup', {
    method: method, // 'email', 'google', 'facebook'
    user_id: userId
  });
}

/**
 * Track user login
 */
export function trackLogin(method: string, userId?: string) {
  trackEvent('login', {
    method: method,
    user_id: userId
  });
}

/**
 * Track profile completion
 */
export function trackProfileComplete(userId: string, role: 'client' | 'owner') {
  trackEvent('profile_complete', {
    user_id: userId,
    user_role: role,
    value: 1
  });
}

/**
 * Set user properties for enhanced tracking
 */
export function setUserProperties(properties: {
  user_id?: string;
  user_role?: 'client' | 'owner';
  subscription_tier?: 'free' | 'premium';
  location?: string;
}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('set', 'user_properties', properties);
}

/**
 * Track conversion (for Google Ads)
 */
export function trackConversion(conversionLabel: string, value?: number) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'conversion', {
    send_to: `AW-CONVERSION_ID/${conversionLabel}`,
    value: value,
    currency: 'MXN'
  });
}

// Debounced event tracking to prevent spam
let eventQueue: Array<{ event: AnalyticsEvent; params?: EventParams }> = [];
let flushTimeout: NodeJS.Timeout | null = null;

export function trackEventDebounced(eventName: AnalyticsEvent, params?: EventParams, delay = 1000) {
  eventQueue.push({ event: eventName, params });

  if (flushTimeout) {
    clearTimeout(flushTimeout);
  }

  flushTimeout = setTimeout(() => {
    // Send batch of events
    eventQueue.forEach(({ event, params }) => {
      trackEvent(event, params);
    });
    eventQueue = [];
  }, delay);
}

// TypeScript augmentation for window.gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default {
  init: initGA4,
  track: trackEvent,
  trackPageView,
  trackSwipe,
  trackSuperLike,
  trackDetailView,
  trackMatch,
  trackMessage,
  trackListingCreated,
  trackSearch,
  trackFilterApplied,
  trackShare,
  trackSignup,
  trackLogin,
  trackProfileComplete,
  setUserProperties,
  trackConversion,
  trackEventDebounced
};

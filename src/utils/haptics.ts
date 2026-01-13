import { logger } from './prodLogger';

/**
 * Trigger haptic feedback with various patterns
 * - light/medium/heavy: Simple single vibrations
 * - success: Double tap for likes
 * - warning: Double tap with longer pause for passes
 * - error: Single strong vibration
 * - match: Celebratory pattern for mutual matches
 * - celebration: Extended celebration pattern
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'match' | 'celebration') => {
  // Check if device supports haptics
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(30);
        break;
      case 'success':
        // Double tap for regular likes
        navigator.vibrate([10, 50, 10]);
        break;
      case 'warning':
        // Double tap with longer pause for passes
        navigator.vibrate([20, 100, 20]);
        break;
      case 'error':
        navigator.vibrate(50);
        break;
      case 'match':
        // Premium match pattern: quick succession build-up then strong finish
        // Creates a "heartbeat" then "celebration" feeling
        navigator.vibrate([15, 30, 15, 30, 30, 50, 40]);
        break;
      case 'celebration':
        // Extended celebration for special moments (e.g., first match)
        navigator.vibrate([10, 20, 10, 20, 10, 20, 30, 40, 50, 60, 40]);
        break;
    }
  }

  // iOS haptics (if available)
  if ('ontouchstart' in window && (window as any).Haptics) {
    try {
      // Map our custom types to iOS styles
      const iosStyle = type === 'match' || type === 'celebration' ? 'heavy' : type;
      (window as any).Haptics.impact({ style: iosStyle });

      // For match/celebration, trigger multiple haptics for iOS
      if (type === 'match') {
        setTimeout(() => (window as any).Haptics?.impact({ style: 'medium' }), 100);
        setTimeout(() => (window as any).Haptics?.impact({ style: 'heavy' }), 200);
      } else if (type === 'celebration') {
        setTimeout(() => (window as any).Haptics?.impact({ style: 'light' }), 80);
        setTimeout(() => (window as any).Haptics?.impact({ style: 'medium' }), 160);
        setTimeout(() => (window as any).Haptics?.impact({ style: 'heavy' }), 250);
        setTimeout(() => (window as any).Haptics?.impact({ style: 'heavy' }), 350);
      }
    } catch (e) {
      logger.error('iOS haptics error:', e);
    }
  }
};

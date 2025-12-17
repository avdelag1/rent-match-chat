export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
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
        navigator.vibrate([10, 50, 10]);
        break;
      case 'warning':
        navigator.vibrate([20, 100, 20]);
        break;
      case 'error':
        navigator.vibrate(50);
        break;
    }
  }
  
  // iOS haptics (if available)
  if ('ontouchstart' in window && (window as any).Haptics) {
    try {
      (window as any).Haptics.impact({ style: type });
    } catch (e) {
      console.error('iOS haptics error:', e);
    }
  }
};

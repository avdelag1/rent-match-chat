// Cache management utilities for immediate updates

export function clearAllCaches(): Promise<void> {
  return new Promise((resolve) => {
    if ('caches' in window) {
      caches.keys().then(names => {
        Promise.all(names.map(name => caches.delete(name)))
          .then(() => {
            console.log('All caches cleared');
            resolve();
          });
      });
    } else {
      resolve();
    }
  });
}

export function forceReload(): void {
  // Clear caches first, then reload
  clearAllCaches().then(() => {
    window.location.reload();
  });
}

export function checkForUpdates(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
  }
}

// Set up automatic update checking
export function setupUpdateChecker(): void {
  if ('serviceWorker' in navigator) {
    // Check for updates every 5 minutes (reduced from 30 seconds)
    setInterval(checkForUpdates, 300000);
    
    // Check immediately on focus
    window.addEventListener('focus', checkForUpdates);
    
    // Check on network reconnection
    window.addEventListener('online', checkForUpdates);
  }
}

// Force clear cache and version check
export function forceClearVersion(): void {
  const currentVersion = Date.now().toString();
  localStorage.setItem('tinderent_last_clear', currentVersion);
  clearAllCaches();
}
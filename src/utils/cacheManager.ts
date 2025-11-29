// Cache management utilities for immediate updates

export function clearAllCaches(): Promise<void> {
  return new Promise((resolve) => {
    if ('caches' in window) {
      caches.keys().then(names => {
        Promise.all(names.map(name => caches.delete(name)))
          .then(() => {
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
export function setupUpdateChecker(): () => void {
  if ('serviceWorker' in navigator) {
    // Check for updates every 5 minutes (reduced from 30 seconds)
    const intervalId = setInterval(checkForUpdates, 300000);

    // Check immediately on focus
    window.addEventListener('focus', checkForUpdates);

    // Check on network reconnection
    window.addEventListener('online', checkForUpdates);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkForUpdates);
      window.removeEventListener('online', checkForUpdates);
    };
  }

  // Return no-op cleanup if service worker not available
  return () => {};
}

// Force clear cache and version check
export function forceClearVersion(): void {
  const currentVersion = Date.now().toString();
  localStorage.setItem('tinderent_last_clear', currentVersion);
  clearAllCaches();
}

// Get current app version from meta tag
export function getCurrentVersion(): string | null {
  const metaTag = document.querySelector('meta[name="app-version"]');
  return metaTag ? metaTag.getAttribute('content') : null;
}

// Check if app version has changed and clear cache if needed
export function checkAppVersion(): void {
  const currentVersion = getCurrentVersion();
  const storedVersion = localStorage.getItem('app_version');
  
  if (currentVersion && storedVersion && currentVersion !== storedVersion) {
    
    // Clear caches immediately
    clearAllCaches().then(() => {
      localStorage.setItem('app_version', currentVersion);
    });
  } else if (currentVersion && !storedVersion) {
    // First time visiting, store current version
    localStorage.setItem('app_version', currentVersion);
  }
}

// Force update check by comparing service worker version
export function forceVersionCheck(): Promise<boolean> {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'VERSION_INFO') {
          const swVersion = event.data.version;
          const storedVersion = localStorage.getItem('app_version');
          
          if (swVersion !== storedVersion) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    } else {
      resolve(false);
    }
  });
}
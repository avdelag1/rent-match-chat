/**
 * InteractionLock - Hard isolation for gesture interactions
 * 
 * RULE: During a gesture, NOTHING ELSE EXISTS.
 * 
 * This singleton prevents ALL React/Zustand/storage/notification updates
 * from running during swipe gestures. Updates are queued and flushed
 * ONLY after the animation completes.
 * 
 * Usage:
 * - Call `lock()` on pointerdown
 * - Call `unlock()` after exit/snapback animation completes
 * - All state updates during lock are queued and batched on unlock
 */

type DeferredTask = () => void;

class InteractionLockManager {
  private _isLocked = false;
  private _deferredTasks: DeferredTask[] = [];
  private _lockStartTime = 0;
  
  // Subscribers notified when lock state changes
  private _lockListeners: Set<(locked: boolean) => void> = new Set();
  
  /**
   * Check if interaction is currently locked
   */
  get isLocked(): boolean {
    return this._isLocked;
  }
  
  /**
   * Lock all non-essential updates
   * Call this on pointer/touch down
   */
  lock(): void {
    if (this._isLocked) return;
    
    this._isLocked = true;
    this._lockStartTime = performance.now();
    this._deferredTasks = [];
    
    // Notify listeners
    this._lockListeners.forEach(fn => fn(true));
  }
  
  /**
   * Unlock and flush all deferred tasks
   * Call this AFTER animation completes (not on pointer up!)
   */
  unlock(): void {
    if (!this._isLocked) return;
    
    this._isLocked = false;
    
    // Batch all deferred tasks in a single microtask
    // This prevents React from re-rendering multiple times
    if (this._deferredTasks.length > 0) {
      const tasks = [...this._deferredTasks];
      this._deferredTasks = [];
      
      // Use queueMicrotask for immediate but non-blocking execution
      queueMicrotask(() => {
        // Execute all deferred tasks
        tasks.forEach(task => {
          try {
            task();
          } catch (e) {
            // Don't let one failed task break others
            console.warn('[InteractionLock] Deferred task failed:', e);
          }
        });
      });
    }
    
    // Notify listeners
    this._lockListeners.forEach(fn => fn(false));
  }
  
  /**
   * Defer a task until after unlock
   * If not locked, executes immediately
   */
  defer(task: DeferredTask): void {
    if (!this._isLocked) {
      task();
      return;
    }
    
    this._deferredTasks.push(task);
  }
  
  /**
   * Run immediately ONLY if not locked, otherwise defer
   * Use for critical updates that should never be dropped
   */
  runOrDefer(task: DeferredTask): void {
    this.defer(task);
  }
  
  /**
   * Skip entirely if locked - for non-critical updates like notifications
   * Returns true if task was executed, false if skipped
   */
  runIfUnlocked(task: DeferredTask): boolean {
    if (this._isLocked) {
      return false;
    }
    task();
    return true;
  }
  
  /**
   * Subscribe to lock state changes
   * Returns unsubscribe function
   */
  subscribe(listener: (locked: boolean) => void): () => void {
    this._lockListeners.add(listener);
    return () => {
      this._lockListeners.delete(listener);
    };
  }
  
  /**
   * Get lock duration in ms (for debugging)
   */
  getLockDuration(): number {
    if (!this._isLocked) return 0;
    return performance.now() - this._lockStartTime;
  }
  
  /**
   * Get number of pending deferred tasks
   */
  getPendingCount(): number {
    return this._deferredTasks.length;
  }
}

// Singleton instance
export const interactionLock = new InteractionLockManager();

/**
 * React hook to check if interactions are locked
 * Components can use this to pause non-essential updates
 */
export function useInteractionLock(): boolean {
  // This is intentionally NOT reactive to avoid re-renders during gesture
  // Components should use interactionLock.isLocked directly in callbacks
  return interactionLock.isLocked;
}

/**
 * Wrap a Zustand action to defer during interaction lock
 */
export function deferredAction<T extends (...args: any[]) => any>(
  action: T
): T {
  return ((...args: Parameters<T>) => {
    interactionLock.defer(() => action(...args));
  }) as T;
}

/**
 * Wrap a callback to skip if locked (for notifications, etc.)
 */
export function skipIfLocked<T extends (...args: any[]) => any>(
  callback: T
): T {
  return ((...args: Parameters<T>) => {
    if (interactionLock.isLocked) {
      return undefined;
    }
    return callback(...args);
  }) as T;
}

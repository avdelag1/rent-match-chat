/**
 * Utility functions for retry logic with exponential backoff
 */

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 * @param attempt - Current attempt number (1-based)
 * @param baseDelay - Base delay in milliseconds (default: 300ms)
 * @returns Delay in milliseconds
 */
export const calculateBackoffDelay = (attempt: number, baseDelay: number = 300): number => {
  return attempt * baseDelay;
};

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 300ms)
 * @param onRetry - Optional callback called on each retry attempt
 * @returns Result of the function if successful
 * @throws Last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 300,
  onRetry?: (attempt: number, error: any) => void
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (onRetry) {
        onRetry(attempt, error);
      }
      
      if (attempt < maxRetries) {
        const delay = calculateBackoffDelay(attempt, baseDelay);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * PostgreSQL error codes
 */
export const PG_ERROR_CODES = {
  DUPLICATE_KEY: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  UNIQUE_VIOLATION: '23505',
} as const;

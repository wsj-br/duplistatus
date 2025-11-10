import { AsyncLocalStorage } from 'async_hooks';

// Request-scoped storage for URL information
// This allows us to pass URL info from the custom server to server components
export const requestUrlStorage = new AsyncLocalStorage<{ pathname: string; searchParams: string }>();

/**
 * Get the current request URL from AsyncLocalStorage
 * Returns the pathname and search params for the current request
 */
export function getRequestUrl(): { pathname: string; searchParams: string } {
  const url = requestUrlStorage.getStore();
  return url || { pathname: '/', searchParams: '' };
}


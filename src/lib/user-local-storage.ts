/**
 * Utility functions for user-specific localStorage
 * 
 * All display and UI preferences should be stored per-user to allow
 * different users to have their own settings on the same browser.
 */

/**
 * Get a user-specific localStorage key
 * @param baseKey - The base key name (e.g., 'duplistatus-config')
 * @param userId - The user ID (optional, falls back to 'anonymous' if not provided)
 * @returns The user-specific key (e.g., 'duplistatus-config:user-123')
 */
export function getUserLocalStorageKey(baseKey: string, userId: string | null | undefined): string {
  if (!userId) {
    // Fallback to anonymous key if no user ID is available
    return `${baseKey}:anonymous`;
  }
  return `${baseKey}:user-${userId}`;
}

/**
 * Get an item from user-specific localStorage
 * @param baseKey - The base key name
 * @param userId - The user ID (optional)
 * @returns The stored value or null
 */
export function getUserLocalStorageItem(baseKey: string, userId: string | null | undefined): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userKey = getUserLocalStorageKey(baseKey, userId);
  return localStorage.getItem(userKey);
}

/**
 * Set an item in user-specific localStorage
 * @param baseKey - The base key name
 * @param userId - The user ID (optional)
 * @param value - The value to store
 */
export function setUserLocalStorageItem(
  baseKey: string,
  userId: string | null | undefined,
  value: string
): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const userKey = getUserLocalStorageKey(baseKey, userId);
  localStorage.setItem(userKey, value);
}

/**
 * Remove an item from user-specific localStorage
 * @param baseKey - The base key name
 * @param userId - The user ID (optional)
 */
export function removeUserLocalStorageItem(
  baseKey: string,
  userId: string | null | undefined
): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const userKey = getUserLocalStorageKey(baseKey, userId);
  localStorage.removeItem(userKey);
}


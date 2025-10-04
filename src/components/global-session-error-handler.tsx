"use client";

import { useEffect } from 'react';
import { recreateSession, isAuthenticationError } from '@/lib/client-session-csrf';

/**
 * Global error handler component that monitors for authentication errors
 * and automatically triggers session recovery when needed.
 * This provides a fallback mechanism for cases where individual components
 * don't handle authentication errors properly.
 * 
 * Note: This is now primarily a backup mechanism since most contexts
 * now use authenticatedRequestWithRecovery which handles recovery automatically.
 */
export function GlobalSessionErrorHandler() {
  useEffect(() => {
    // Override the global fetch function to intercept authentication errors
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      try {
        const response = await originalFetch(input, init);
        
        // Check for authentication errors on API requests
        if (typeof input === 'string' && input.startsWith('/api/') && isAuthenticationError(response)) {
          console.log('Global error handler detected authentication error, attempting recovery...');
          
          try {
            await recreateSession();
            console.log('Session recovery completed by global error handler');
            
            // Note: We don't retry the original request here because:
            // 1. The response has already been consumed
            // 2. Most contexts now use authenticatedRequestWithRecovery which handles retries
            // 3. This serves as a fallback for any remaining direct fetch calls
          } catch (error) {
            console.error('Global session recovery failed:', error);
          }
        }
        
        return response;
      } catch (error) {
        // Re-throw network errors as-is
        throw error;
      }
    };

    // Cleanup: restore original fetch when component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null; // This component doesn't render anything
}

"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSession, validateSession, recreateSession } from '@/lib/client-session-csrf';

/**
 * Check if session cookie exists (client-side)
 */
function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key] = cookie.trim().split('=');
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);
  return !!(cookies['sessionId'] || cookies['session']);
}

/**
 * Component responsible for initializing authentication session on app startup.
 * This ensures that all authenticated API calls work properly from the first page load.
 * Enhanced to handle Docker restart scenarios and session recovery.
 * Skips initialization on login page or when no session cookie exists to avoid unnecessary API calls.
 */
export function SessionInitializer() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname?.startsWith('/login');

  useEffect(() => {
    // Skip session initialization on login page
    if (isLoginPage) {
      return;
    }

    // If we're on root path and no session cookie, we'll be redirected to login
    // Skip session initialization to avoid unnecessary requests
    if (pathname === '/' && !hasSessionCookie()) {
      return;
    }

    const initializeSession = async () => {
      try {
        // First, try to validate existing session
        const hasValidSession = await validateSession();
        
        if (hasValidSession) {
          console.debug('Existing session validated successfully');
        } else {
          // No valid session found, create a new one
          console.debug('No valid session found, creating new session...');
          await getSession();
          console.debug('New session created successfully');
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        
        // If session initialization fails, try to recreate session
        // This handles cases where Docker has restarted and sessions are lost
        try {
          console.debug('Attempting session recreation...');
          await recreateSession();
          console.debug('Session recreated successfully');
        } catch (recoveryError) {
          console.error('Session recreation also failed:', recoveryError);
          // At this point, the user would need to refresh the page manually
          // or the application should handle this gracefully
        }
      }
    };
    
    initializeSession();
  }, [isLoginPage, pathname]);

  return null; // This component doesn't render anything
}

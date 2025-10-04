"use client";

import { useEffect } from 'react';
import { getSession, validateSession, recreateSession } from '@/lib/client-session-csrf';

/**
 * Component responsible for initializing authentication session on app startup.
 * This ensures that all authenticated API calls work properly from the first page load.
 * Enhanced to handle Docker restart scenarios and session recovery.
 */
export function SessionInitializer() {
  useEffect(() => {
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
  }, []);

  return null; // This component doesn't render anything
}

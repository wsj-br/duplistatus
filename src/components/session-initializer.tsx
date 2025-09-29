"use client";

import { useEffect } from 'react';
import { getSession } from '@/lib/client-session-csrf';

/**
 * Component responsible for initializing authentication session on app startup.
 * This ensures that all authenticated API calls work properly from the first page load.
 */
export function SessionInitializer() {
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Validate if we already have a session
        await getSession();
        console.debug('Session initialized or validated successfully');
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };
    
    initializeSession();
  }, []);

  return null; // This component doesn't render anything
}

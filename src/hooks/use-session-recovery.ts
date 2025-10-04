"use client";

import { useCallback } from 'react';
import { authenticatedRequestWithRecovery, isAuthenticationError, recreateSession } from '@/lib/client-session-csrf';

/**
 * Custom hook that provides session recovery capabilities for components.
 * This hook can be used by components that need to handle authentication errors gracefully.
 */
export function useSessionRecovery() {
  /**
   * Makes an authenticated request with automatic session recovery.
   * This is a wrapper around authenticatedRequestWithRecovery for convenience.
   */
  const makeAuthenticatedRequest = useCallback(async (
    url: string,
    options: RequestInit = {}
  ) => {
    return await authenticatedRequestWithRecovery(url, options);
  }, []);

  /**
   * Manually triggers session recreation.
   * Useful for components that want to proactively refresh their session.
   */
  const refreshSession = useCallback(async () => {
    try {
      await recreateSession();
      return true;
    } catch (error) {
      console.error('Manual session refresh failed:', error);
      return false;
    }
  }, []);

  /**
   * Checks if a response indicates an authentication error.
   * Useful for components that need to handle different types of errors.
   */
  const checkAuthenticationError = useCallback((response: Response) => {
    return isAuthenticationError(response);
  }, []);

  return {
    makeAuthenticatedRequest,
    refreshSession,
    checkAuthenticationError,
  };
}

'use client';

import { useState, useEffect } from 'react';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

/**
 * Hook to fetch and cache the password policy from the server
 * The policy is fetched once and cached for the component lifecycle
 */
export function usePasswordPolicy(): PasswordPolicy | null {
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const response = await fetch('/api/auth/password-policy');
        if (response.ok) {
          const data = await response.json();
          setPolicy(data);
        } else {
          // Fallback to default policy if fetch fails
          setPolicy({
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
          });
        }
      } catch (error) {
        console.error('Error fetching password policy:', error);
        // Fallback to default policy on error
        setPolicy({
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
        });
      }
    }

    fetchPolicy();
  }, []);

  return policy;
}

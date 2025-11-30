"use client";

import { useState, useEffect } from 'react';

interface CurrentUser {
  id: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword?: boolean;
}

/**
 * Hook to get the current authenticated user
 * Returns null if not authenticated or while loading
 */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Return null while loading to avoid using stale data
  if (isLoading) {
    return null;
  }

  return user;
}


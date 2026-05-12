"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface CurrentUser {
  id: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword?: boolean;
}

/**
 * Hook to get the current authenticated user.
 * Returns `undefined` while the auth check is in-flight (loading).
 * Returns `null` when loading is complete and the user is not authenticated.
 * Returns a `CurrentUser` object when authenticated.
 * Skips fetching on the login page.
 */
export function useCurrentUser(): CurrentUser | null | undefined {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname?.startsWith('/login');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for pathname to be available
    if (!pathname) {
      return;
    }

    // Skip fetching on login page - user data not needed there
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    // NOTE: We cannot check for session cookie here because it's httpOnly
    // The API call to /api/auth/me will determine if user is authenticated
    // Server will return { authenticated: false } if no valid session

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
  }, [isLoginPage, pathname]);

  // Return undefined while loading so callers can distinguish "still loading"
  // from "loaded but unauthenticated" (null).
  if (isLoading) {
    return undefined;
  }

  return user;
}

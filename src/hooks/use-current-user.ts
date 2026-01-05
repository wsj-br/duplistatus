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
 * Check if session cookie exists (client-side)
 * This helps detect if user will be redirected to login
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
 * Hook to get the current authenticated user
 * Returns null if not authenticated or while loading.
 * Skips fetching on login page or when no session cookie exists to avoid unnecessary API calls.
 */
export function useCurrentUser(): CurrentUser | null {
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

    // If we're on root path and no session cookie, we'll be redirected to login
    // Skip API call to avoid unnecessary requests
    if (pathname === '/' && !hasSessionCookie()) {
      setIsLoading(false);
      return;
    }

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

  // Return null while loading to avoid using stale data
  if (isLoading) {
    return null;
  }

  return user;
}


"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

export interface CurrentUser {
  id: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword?: boolean;
}

interface CurrentUserContextValue {
  /** undefined = loading; null = unauthenticated; CurrentUser = authenticated */
  currentUser: CurrentUser | null | undefined;
  refreshCurrentUser: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(
  undefined,
);

let authMeInFlight: Promise<CurrentUser | null> | null = null;
let hasResolvedAuthMe = false;
let resolvedAuthMeUser: CurrentUser | null = null;

function resetAuthMeCache(): void {
  hasResolvedAuthMe = false;
  resolvedAuthMeUser = null;
  authMeInFlight = null;
}

async function fetchCurrentUserOnce(): Promise<CurrentUser | null> {
  if (hasResolvedAuthMe) {
    return resolvedAuthMeUser;
  }

  if (authMeInFlight) {
    return authMeInFlight;
  }

  authMeInFlight = (async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      if (data.authenticated && data.user) {
        return data.user as CurrentUser;
      }
      return null;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  })();

  try {
    const user = await authMeInFlight;
    hasResolvedAuthMe = true;
    resolvedAuthMeUser = user;
    return user;
  } finally {
    authMeInFlight = null;
  }
}

function isLoginPath(pathname: string | null): boolean {
  return pathname === "/login" || (pathname?.startsWith("/login") ?? false);
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null | undefined>(
    undefined,
  );

  const loadCurrentUser = useCallback(async () => {
    const user = await fetchCurrentUserOnce();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (isLoginPath(pathname)) {
      resetAuthMeCache();
      setCurrentUser(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      const user = await fetchCurrentUserOnce();
      if (!cancelled) {
        setCurrentUser(user);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const refreshCurrentUser = useCallback(async () => {
    if (!pathname || isLoginPath(pathname)) {
      resetAuthMeCache();
      setCurrentUser(null);
      return;
    }
    resetAuthMeCache();
    setCurrentUser(undefined);
    await loadCurrentUser();
  }, [loadCurrentUser, pathname]);

  const value = useMemo(
    () => ({ currentUser, refreshCurrentUser }),
    [currentUser, refreshCurrentUser],
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

/**
 * Returns the current authenticated user from shared context.
 * Returns `undefined` while the auth check is in-flight (loading).
 * Returns `null` when loading is complete and the user is not authenticated.
 * Returns a `CurrentUser` object when authenticated.
 */
export function useCurrentUser(): CurrentUser | null | undefined {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context.currentUser;
}

export function useRefreshCurrentUser(): () => Promise<void> {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error(
      "useRefreshCurrentUser must be used within a CurrentUserProvider",
    );
  }
  return context.refreshCurrentUser;
}

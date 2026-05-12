"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getUserLocalStorageItem, setUserLocalStorageItem } from '@/lib/user-local-storage';
import { useCurrentUser } from '@/hooks/use-current-user';

export type ThemePreference = "light" | "dark" | "system";

/** Resolved light/dark appearance actually applied to the document */
export type ResolvedTheme = "light" | "dark";

interface ThemeContextProps {
  /** Stored user choice: explicit light/dark, or follow OS */
  themePreference: ThemePreference;
  /** Effective light/dark after resolving `system` via the OS */
  resolvedTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
  /** Toggles between explicit light and dark (based on current resolved appearance). */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

/**
 * Returns whether the OS color scheme is dark (`prefers-color-scheme`).
 * Server / non-browser: defaults to `dark` (matches prior SSR behavior).
 */
export function getResolvedSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function parseStoredPreference(raw: string | null): ThemePreference | null {
  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw;
  }
  return null;
}

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const currentUser = useCurrentUser();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [osResolvedTheme, setOsResolvedTheme] = useState<ResolvedTheme>(getResolvedSystemTheme);
  const lastAppliedUserIdRef = useRef<string | null>(null);

  // Load user-specific theme preference when the authenticated user is known
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    // undefined = still loading; null = loaded but unauthenticated.
    if (currentUser === undefined) {
      return;
    }
    if (currentUser === null) {
      lastAppliedUserIdRef.current = null;
      return;
    }
    if (lastAppliedUserIdRef.current === currentUser.id) {
      return;
    }
    lastAppliedUserIdRef.current = currentUser.id;
    const stored = parseStoredPreference(getUserLocalStorageItem('theme', currentUser.id));
    if (stored !== null) {
      setThemePreferenceState(stored);
    }
  }, [currentUser]);

  // Subscribe to OS theme changes while using "system" preference
  useEffect(() => {
    if (typeof window === 'undefined' || themePreference !== 'system') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = (): void => {
      setOsResolvedTheme(media.matches ? 'dark' : 'light');
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [themePreference]);

  const resolvedTheme: ResolvedTheme = useMemo(
    () => (themePreference === 'system' ? osResolvedTheme : themePreference),
    [themePreference, osResolvedTheme],
  );

  useEffect(() => {
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (currentUser) {
      setUserLocalStorageItem('theme', currentUser.id, themePreference);
    }
  }, [resolvedTheme, themePreference, currentUser]);

  const setThemePreference = (preference: ThemePreference): void => {
    setThemePreferenceState(preference);
  };

  const toggleTheme = (): void => {
    setThemePreferenceState((prev) => {
      const resolved =
        prev === 'system' ? getResolvedSystemTheme() : prev;
      return resolved === 'light' ? 'dark' : 'light';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        resolvedTheme,
        setThemePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

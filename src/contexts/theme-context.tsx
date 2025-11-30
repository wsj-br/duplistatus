"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getUserLocalStorageItem, setUserLocalStorageItem } from '@/lib/user-local-storage';
import { useCurrentUser } from '@/hooks/use-current-user';

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Improved helper function to get initial theme (fallback for SSR/initial load)
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    // First check if the dark class is already applied to the document
    // This is important because the inline script may have already set this
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    
    // Fallback to system preference if no user-specific theme found
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark"; // Default for SSR or environments without window (headless browsers)
};

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const currentUser = useCurrentUser();
  // Initialize theme based on existing class or preference
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const hasLoadedUserThemeRef = useRef(false);

  // Load user-specific theme when user is available
  useEffect(() => {
    if (typeof window === 'undefined' || currentUser === null || hasLoadedUserThemeRef.current) {
      return;
    }

    hasLoadedUserThemeRef.current = true;
    const storedTheme = getUserLocalStorageItem("theme", currentUser.id) as Theme | null;
    if (storedTheme === 'dark' || storedTheme === 'light') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(storedTheme);
    }
  }, [currentUser]);

  useEffect(() => {
    // This effect handles theme changes triggered by toggleTheme
    // AND ensures initial synchronization of the class and localStorage
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save to user-specific localStorage if user is loaded
    if (currentUser) {
      setUserLocalStorageItem("theme", currentUser.id, theme);
    }
  }, [theme, currentUser]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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

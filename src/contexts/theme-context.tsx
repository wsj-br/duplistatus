"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Improved helper function to get initial theme
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    // First check if the dark class is already applied to the document
    // This is important because the inline script may have already set this
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    
    // Then check localStorage
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      return storedTheme;
    }
    
    // Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light"; // Default for SSR or environments without window
};

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize theme based on existing class or preference
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // This effect handles theme changes triggered by toggleTheme
    // AND ensures initial synchronization of the class and localStorage
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

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

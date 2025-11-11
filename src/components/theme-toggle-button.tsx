"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  // Track if component has mounted on client (prevents hydration mismatch)
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after first render (runs only on client)
  // This is intentional for handling hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // During SSR and initial client render, show Sun icon to prevent hydration mismatch
  // After mounting, show correct icon based on theme
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}

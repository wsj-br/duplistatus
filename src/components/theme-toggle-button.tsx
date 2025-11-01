"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only set mounted to true after component has mounted on the client
  // This ensures server and client render the same initial HTML
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial render, always show Sun icon to match server
  // After mounting, show the correct icon based on theme:
  // - Light theme: show Moon (clicking will switch to dark)
  // - Dark theme: show Sun (clicking will switch to light)
  const icon = mounted && theme === "light" ? (
    <Moon className="h-[1.2rem] w-[1.2rem]" />
  ) : (
    <Sun className="h-[1.2rem] w-[1.2rem]" />
  );

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
      {icon}
    </Button>
  );
}

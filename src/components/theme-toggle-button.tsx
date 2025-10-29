"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [isClient] = useState(() => {
    // Client-side detection with lazy initialization
    return typeof window !== 'undefined';
  });

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
      {isClient ? (
        theme === "light" ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}

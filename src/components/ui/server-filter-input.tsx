"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerFilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  /** When empty: show only the search icon until hover, focus, or click expands the field. */
  variant?: "default" | "collapsible";
}

export function ServerFilterInput({
  value,
  onChange,
  placeholder,
  className,
  autoFocus = false,
  variant = "default",
}: ServerFilterInputProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  /** Tap icon (no hover on touch) to keep field open until blur when empty. */
  const [openedByClick, setOpenedByClick] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const collapsible = variant === "collapsible";
  const hasQuery = value.trim().length > 0;
  const isExpanded =
    !collapsible ||
    hasQuery ||
    isFocused ||
    isHovered ||
    openedByClick;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!openedByClick || !inputRef.current) return;
    inputRef.current.focus();
  }, [openedByClick]);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (value) {
        handleClear();
      } else if (collapsible) {
        inputRef.current?.blur();
        setOpenedByClick(false);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    window.setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current?.contains(active)) return;
      if (!value.trim()) {
        setOpenedByClick(false);
      }
    }, 0);
  };

  const expandFromIcon = () => {
    setOpenedByClick(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (collapsible && !isExpanded) {
    return (
      <div
        ref={containerRef}
        className={cn("relative shrink-0", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label={placeholder || t("Filter servers by name, alias, or backup name...")}
          aria-expanded={false}
          onClick={expandFromIcon}
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-xs transition-[max-width] duration-200 ease-out",
        collapsible && "max-w-[min(100vw-6rem,280px)]",
        className
      )}
      onMouseEnter={() => collapsible && setIsHovered(true)}
      onMouseLeave={() => collapsible && setIsHovered(false)}
    >
      <Search className="absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder || t("Filter servers by name, alias, or backup name...")}
        className={cn(
          "pl-10 pr-8 h-9 text-sm transition-all duration-200",
          isFocused && "ring-2 ring-ring ring-offset-background"
        )}
        aria-expanded={true}
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 z-[1] -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t("Clear filter")}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

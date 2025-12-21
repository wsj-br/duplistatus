"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface TogglePasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TogglePasswordInput({
  id,
  value,
  onChange,
  placeholder,
  className,
  disabled
}: TogglePasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preserve focus and cursor position when toggling password visibility
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      const cursorPosition = input.selectionStart ?? value.length;
      
      // Restore cursor position after type change
      setTimeout(() => {
        if (input && document.activeElement === input) {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
  }, [showPassword, value.length]);

  const handleTogglePassword = () => {
    const input = inputRef.current;
    if (!input) return;
    
    // Check if input was focused before toggle or force focus
    const wasFocused = document.activeElement === input;
    const cursorPosition = input.selectionStart ?? value.length;
    
    setShowPassword(!showPassword);
    
    // Always restore focus and cursor position after toggling
    // This ensures the cursor remains visible when revealing/hiding password
    setTimeout(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} pr-10`}
        autoComplete={showPassword ? 'off' : 'current-password'}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-10"
        onClick={handleTogglePassword}
        onMouseDown={(e) => e.preventDefault()}
        disabled={disabled}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

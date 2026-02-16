"use client";

import { useState, useRef, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useIntlayer } from 'react-intlayer';

interface TogglePasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  // New props for shared visibility state
  showPassword?: boolean; // Controlled visibility
  onTogglePassword?: () => void; // Toggle callback
  isConfirmation?: boolean; // Is this a confirmation field?
  syncValue?: string; // Value to sync when visible
  passwordInputRef?: React.RefObject<HTMLInputElement | null> | React.MutableRefObject<HTMLInputElement | null>; // Ref to password field for focus transfer
}

export const TogglePasswordInput = forwardRef<HTMLInputElement, TogglePasswordInputProps>(function TogglePasswordInput({
  id,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  showPassword: controlledShowPassword,
  onTogglePassword,
  isConfirmation = false,
  syncValue,
  passwordInputRef
}, ref) {
  const common = useIntlayer('common');
  // Use controlled mode if showPassword and onTogglePassword are provided, otherwise use internal state
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const isControlled = controlledShowPassword !== undefined && onTogglePassword !== undefined;
  const showPassword = isControlled ? controlledShowPassword : internalShowPassword;
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Callback ref to merge forwarded ref with internal ref
  const setInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };
  
  // Determine if this field should be read-only (confirmation field when password is visible)
  const isReadOnly = isConfirmation && showPassword;
  
  // Sync value when confirmation field and password is visible
  const displayValue = isReadOnly && syncValue !== undefined ? syncValue : value;

  // Handle focus transfer for confirmation field
  useEffect(() => {
    if (isConfirmation && showPassword && inputRef.current && document.activeElement === inputRef.current) {
      // Transfer focus to password field if available
      if (passwordInputRef?.current) {
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 0);
      }
    }
  }, [isConfirmation, showPassword, passwordInputRef]);

  // Preserve focus and cursor position when toggling password visibility
  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current && !isReadOnly) {
      const cursorPosition = inputRef.current.selectionStart ?? displayValue.length;
      
      // Restore cursor position after type change
      setTimeout(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
  }, [showPassword, displayValue.length, isReadOnly]);

  const handleTogglePassword = () => {
    if (!inputRef.current) return;
    
    // Check if input was focused before toggle or force focus
    const wasFocused = document.activeElement === inputRef.current;
    const cursorPosition = inputRef.current.selectionStart ?? displayValue.length;
    
    if (isControlled) {
      // Use controlled mode
      onTogglePassword();
    } else {
      // Use internal state
      setInternalShowPassword(!internalShowPassword);
    }
    
    // Always restore focus and cursor position after toggling (unless it's a read-only confirmation field)
    if (!isReadOnly) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
  };

  // Determine muted styling classes for confirmation field
  const mutedClasses = isReadOnly 
    ? 'opacity-60 bg-muted/50 cursor-not-allowed transition-opacity transition-colors' 
    : '';

  return (
    <div className="relative">
      <Input
        ref={setInputRef}
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={displayValue}
        onChange={(e) => {
          if (!isReadOnly) {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
        className={`${className || ''} pr-10 ${mutedClasses}`}
        autoComplete={showPassword ? 'off' : 'current-password'}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
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
        aria-label={showPassword ? common.ui.hidePassword.value : common.ui.showPassword.value}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
});

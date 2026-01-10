'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TogglePasswordInput } from '@/components/ui/toggle-password-input';
import { Check, X } from 'lucide-react';
import { usePasswordPolicy } from '@/hooks/use-password-policy';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  required?: boolean;
}

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  passwordsMatch: boolean;
}

// Requirement item component (defined outside to avoid recreation on each render)
const RequirementItem = ({ met, label }: { met: boolean; label: string }) => (
  <div className="flex items-center gap-2 text-sm">
    {met ? (
      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    )}
    <span className={met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
      {label}
    </span>
  </div>
);

export function ChangePasswordModal({ open, onOpenChange, required = false }: ChangePasswordModalProps) {
  const router = useRouter();
  const passwordPolicy = usePasswordPolicy();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Safely clear password fields by overwriting before clearing
  const safeClearPasswords = () => {
    // Overwrite with random characters to clear from memory
    const randomStr = 'x'.repeat(Math.max(newPassword.length, confirmPassword.length, 100));
    setNewPassword(randomStr);
    setConfirmPassword(randomStr);
    // Clear after overwrite
    setTimeout(() => {
      setNewPassword('');
      setConfirmPassword('');
    }, 0);
  };

  // Handle modal open/close - reset form when opening, clear passwords when closing
  useEffect(() => {
    if (open) {
      // Reset form state when modal opens
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
      setShowPassword(false);
      setLoading(false);
    } else {
      // Safely clear passwords from memory when modal closes (covers all close methods)
      // Capture current values before clearing
      const currentNewPassword = newPassword;
      const currentConfirmPassword = confirmPassword;
      const randomStr = 'x'.repeat(Math.max(currentNewPassword.length, currentConfirmPassword.length, 100));
      setNewPassword(randomStr);
      setConfirmPassword(randomStr);
      // Clear after overwrite
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
      }, 0);
      setError('');
      setSuccess(false);
      setShowPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Copy new password to confirm password when hiding password
  const prevShowPasswordRef = useRef(showPassword);
  useEffect(() => {
    // When password visibility changes from shown to hidden, copy new password to confirm
    if (prevShowPasswordRef.current === true && showPassword === false && newPassword) {
      setConfirmPassword(newPassword);
    }
    prevShowPasswordRef.current = showPassword;
  }, [showPassword, newPassword]);

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  // Real-time password validation
  const requirements = useMemo<PasswordRequirements>(() => {
    // When password is visible, confirmation field is synced, so consider them matching
    const passwordsMatch = showPassword 
      ? newPassword.length > 0 
      : newPassword === confirmPassword && confirmPassword.length > 0;
    
    // Use policy if available, otherwise fallback to defaults
    const minLength = passwordPolicy?.minLength ?? 8;
    const requireUppercase = passwordPolicy?.requireUppercase ?? true;
    const requireLowercase = passwordPolicy?.requireLowercase ?? true;
    const requireNumbers = passwordPolicy?.requireNumbers ?? true;
    
    return {
      minLength: newPassword.length >= minLength,
      hasUppercase: !requireUppercase || /[A-Z]/.test(newPassword),
      hasLowercase: !requireLowercase || /[a-z]/.test(newPassword),
      hasNumber: !requireNumbers || /[0-9]/.test(newPassword),
      passwordsMatch,
    };
  }, [newPassword, confirmPassword, showPassword, passwordPolicy]);

  // Check if all requirements are met
  const isPasswordValid = useMemo(() => {
    if (!passwordPolicy) {
      // Wait for policy to load
      return false;
    }
    return (
      requirements.minLength &&
      requirements.hasUppercase &&
      requirements.hasLowercase &&
      requirements.hasNumber &&
      requirements.passwordsMatch
    );
  }, [requirements, passwordPolicy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isPasswordValid) {
      setError('Please ensure all password requirements are met');
      setLoading(false);
      return;
    }

    try {
      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf');
      const { token: csrfToken } = await csrfResponse.json();

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ 
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to change password');
        if (data.validationErrors && Array.isArray(data.validationErrors)) {
          setError(data.validationErrors.join(', '));
        }
        setLoading(false);
        return;
      }

      // Password changed successfully
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        if (required) {
          // Force page reload to ensure all state is refreshed
          window.location.href = '/';
        } else {
          router.refresh();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Change password error:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={required ? () => {} : handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            {required 
              ? 'You must change your password before continuing. Please set a new password that meets the requirements below.'
              : 'Set a new password for your account. Make sure it meets all the requirements below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3">
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3">
              <div className="text-sm text-green-800 dark:text-green-200">
                ✓ Password changed successfully!
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <TogglePasswordInput
              ref={passwordInputRef}
              id="new-password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter new password"
              disabled={loading || success}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className={showPassword ? 'opacity-60' : ''}>Confirm New Password</Label>
            <TogglePasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm new password"
              disabled={loading || success}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              isConfirmation={true}
              syncValue={newPassword}
              passwordInputRef={passwordInputRef}
            />
          </div>

          <div className="space-y-2 rounded-md bg-muted p-3">
            <div className="text-sm font-semibold mb-2">Password Requirements:</div>
            <div className="space-y-1.5">
              {passwordPolicy && (
                <>
                  <RequirementItem 
                    met={requirements.minLength} 
                    label={`At least ${passwordPolicy.minLength} characters long`}
                  />
                  {passwordPolicy.requireUppercase && (
                    <RequirementItem 
                      met={requirements.hasUppercase} 
                      label="Contains at least one uppercase letter (A-Z)" 
                    />
                  )}
                  {passwordPolicy.requireLowercase && (
                    <RequirementItem 
                      met={requirements.hasLowercase} 
                      label="Contains at least one lowercase letter (a-z)" 
                    />
                  )}
                  {passwordPolicy.requireNumbers && (
                    <RequirementItem 
                      met={requirements.hasNumber} 
                      label="Contains at least one number (0-9)" 
                    />
                  )}
                  <RequirementItem 
                    met={requirements.passwordsMatch} 
                    label="Passwords match" 
                  />
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            {!required && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || success}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isPasswordValid || loading || success}
            >
              {loading ? 'Changing...' : success ? 'Success!' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
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

export function ChangePasswordModal({ open, onOpenChange, required = false }: ChangePasswordModalProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
    }
  }, [open]);

  // Real-time password validation
  const requirements = useMemo<PasswordRequirements>(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      passwordsMatch: newPassword === confirmPassword && confirmPassword.length > 0,
    };
  }, [newPassword, confirmPassword]);

  // Check if all requirements are met
  const isPasswordValid = useMemo(() => {
    return (
      requirements.minLength &&
      requirements.hasUppercase &&
      requirements.hasLowercase &&
      requirements.hasNumber &&
      requirements.passwordsMatch
    );
  }, [requirements]);

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

  return (
    <Dialog open={open} onOpenChange={required ? () => {} : onOpenChange}>
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
              id="new-password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter new password"
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <TogglePasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm new password"
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2 rounded-md bg-muted p-3">
            <div className="text-sm font-semibold mb-2">Password Requirements:</div>
            <div className="space-y-1.5">
              <RequirementItem 
                met={requirements.minLength} 
                label="At least 8 characters long" 
              />
              <RequirementItem 
                met={requirements.hasUppercase} 
                label="Contains at least one uppercase letter (A-Z)" 
              />
              <RequirementItem 
                met={requirements.hasLowercase} 
                label="Contains at least one lowercase letter (a-z)" 
              />
              <RequirementItem 
                met={requirements.hasNumber} 
                label="Contains at least one number (0-9)" 
              />
              <RequirementItem 
                met={requirements.passwordsMatch} 
                label="Passwords match" 
              />
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


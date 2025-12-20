'use client';

import { useState, useEffect } from 'react';
import { ChangePasswordModal } from '@/components/change-password-modal';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword?: boolean;
}

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

/**
 * PasswordChangeGuard component that checks if the user must change their password
 * before rendering children. If password change is required, it shows the modal
 * and blocks rendering until the password is changed.
 */
export function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Check authentication status and password change requirement
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
        });
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          // If password change is required, open modal immediately
          if (data.user.mustChangePassword) {
            setChangePasswordOpen(true);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // If user must change password, block rendering and show modal
  // The modal will reload the page after successful password change
  if (user?.mustChangePassword) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center bg-background min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">Please change your password to continue</div>
          </div>
        </div>
        <ChangePasswordModal
          open={changePasswordOpen}
          onOpenChange={setChangePasswordOpen}
          required={true}
        />
      </>
    );
  }

  // Password change not required, render children normally
  return <>{children}</>;
}

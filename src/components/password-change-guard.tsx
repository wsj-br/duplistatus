'use client';
import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { ChangePasswordModal } from '@/components/change-password-modal';
import { useCurrentUser } from '@/hooks/use-current-user';

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

/**
 * PasswordChangeGuard component that checks if the user must change their password
 * before rendering children. If password change is required, it shows the modal
 * and blocks rendering until the password is changed.
 */
export function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const loading = currentUser === undefined;
  const user = currentUser ?? null;
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (user?.mustChangePassword) {
      setChangePasswordOpen(true);
    }
  }, [user?.mustChangePassword]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">{t("Loading...")}</div>
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
            <div className="text-lg text-muted-foreground">{t("Please change your password to continue")}</div>
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

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Settings, BookOpenText, LogOut, User, KeyRound, Users, ChevronDown, ArrowLeft, ScrollText } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { DisplayMenu } from '@/components/display-menu';
import { DatabaseMaintenanceMenu } from '@/components/database-maintenance-menu';
import { BackupCollectMenu } from '@/components/backup-collect-menu';
import { GlobalRefreshControls } from '@/components/global-refresh-controls';
import { NtfyMessagesButton } from '@/components/ntfy-messages-button';
import { OpenServerConfigButton } from '@/components/open-server-config-button';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { ChangePasswordModal } from '@/components/change-password-modal';

//import the logo image
import DupliLogo from '../../public/images/duplistatus_logo.png';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword?: boolean;
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboardPage = pathname === '/';
  const isSettingsPage = pathname === '/settings';
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
          // Auto-open change password modal if required
          if (data.user.mustChangePassword) {
            setChangePasswordOpen(true);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]); // Re-check when pathname changes

  const handleLogout = async () => {
    try {
      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf');
      const { token: csrfToken } = await csrfResponse.json();

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-x-[20px] border-solid border-b-border border-x-transparent bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-[95%] mx-auto flex flex-wrap items-center py-4 min-h-16">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="p-1">
            <Image
              src={DupliLogo}
              alt="duplistatus Logo"
              width={40}
              height={40}
            />
          </div>
          <span className="text-3xl text-blue-600 sm:inline-block">
            duplistatus
          </span>
        </Link>
        
        {!isDashboardPage && (
          <div className="flex items-center gap-2 ml-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-sm font-medium">Return to Dashboard</span>
            </Link>
            {isSettingsPage && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            )}
          </div>
        )}
        
        <div className="flex flex-1 items-center justify-end flex-wrap gap-2 self-start">
          <GlobalRefreshControls />
          <NtfyMessagesButton />
          <OpenServerConfigButton />
          <BackupCollectMenu />
          <DatabaseMaintenanceMenu />
          <DisplayMenu />
          <Link href="/settings">
            <Button variant="outline" size="icon" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon" 
            title="User Guide"
            className="ml-4"
            onClick={() => window.open('/docs/user-guide/overview', '_blank', 'noopener,noreferrer')}
          >
            <BookOpenText className="h-4 w-4" />
          </Button>
          <ThemeToggleButton />
          
          {/* User Authentication Section */}
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-4 flex items-center gap-2 px-3 py-2 h-auto"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.username}</span>
                  {user.isAdmin && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings?tab=users')}>
                      <Users className="h-4 w-4 mr-2" />
                      Admin Users
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings?tab=audit')}>
                  <ScrollText className="h-4 w-4 mr-2" />
                  Audit Log
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <ChangePasswordModal 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen}
        required={user?.mustChangePassword || false}
      />
    </div>
  );
}

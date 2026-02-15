'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Settings, BookOpenText, LogOut, User, KeyRound, Users, ChevronDown, ArrowLeft, ScrollText, Languages } from 'lucide-react';
import { BackupCollectMenu } from '@/components/backup-collect-menu';
import { GlobalRefreshControls } from '@/components/global-refresh-controls';
import { NtfyMessagesButton } from '@/components/ntfy-messages-button';
import { OpenServerConfigButton } from '@/components/open-server-config-button';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { ChangePasswordModal } from '@/components/change-password-modal';
import { getHelpUrl } from '@/lib/helpMapper';
import { useLocale } from '@/contexts/locale-context';
import { useIntlayer } from 'react-intlayer';

//import the logo image
import DupliLogo from '../../public/images/duplistatus_logo.png';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword?: boolean;
}

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  "pt-BR": "Português (BR)",
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const content = useIntlayer('app-header');
  const common = useIntlayer('common');
  const isDashboardPage = pathname === '/' || /^\/[^/]+\/?$/.test(pathname ?? '');
  const isSettingsPage = /\/settings/.test(pathname ?? '');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Get context-aware help URL and page name
  const helpInfo = getHelpUrl(pathname, searchParams.toString(), locale);
  const helpTooltip = helpInfo.pageName === 'User Guide' 
    ? common.navigation.help.value
    : common.navigation.helpFor.value.replace('{pageName}', helpInfo.pageName);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store', // Always fetch fresh data, but don't cache
        });
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
          // Note: Auto-opening password change modal for required changes is handled
          // by PasswordChangeGuard component, not here
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
  }, []); // Only check once on mount

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;
    
    // Set cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    
    // Get current path without locale prefix
    const currentPath = pathname || '';
    let pathWithoutLocale = currentPath.replace(/^\/(en|de|fr|es|pt-BR)(\/|$)/, '/');
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = '';
    }
    
    // Preserve query parameters
    const queryString = searchParams.toString();
    const newPath = `/${newLocale}${pathWithoutLocale}${queryString ? `?${queryString}` : ''}`;
    
    // Redirect to new locale
    window.location.href = newPath;
  };

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
        router.push(`/${locale}/login`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-x-[20px] border-solid border-b-border border-x-transparent bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-[95%] mx-auto flex flex-wrap items-center py-4 min-h-16">
        <Link href={`/${locale}`} className="mr-6 flex items-center space-x-2">
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
              href={`/${locale}`} 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-sm font-medium">{content.returnToDashboard.value}</span>
            </Link>
            {isSettingsPage && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4 rtl-flip-icon" />
                <span>{common.ui.back.value}</span>
              </Button>
            )}
          </div>
        )}
        
        <div className="flex flex-1 items-center justify-end flex-wrap gap-2 self-start">
          <GlobalRefreshControls />
          <NtfyMessagesButton />
          <OpenServerConfigButton />
          <BackupCollectMenu />
          <Link href={`/${locale}/settings`} className="ml-4">
            <Button variant="outline" size="icon" title={common.navigation.settings.value}>
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* User Authentication Section */}
          {loading ? (
            // Placeholder to prevent layout shift while loading
            <Button
              variant="outline"
              className="ml-4 flex items-center gap-2 px-3 py-2 h-auto"
              disabled
              aria-hidden="true"
            >
              <User className="h-4 w-4 text-muted-foreground opacity-50" />
              <span className="text-sm font-medium opacity-0 min-w-[60px]">Loading</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-4 flex items-center gap-2 px-3 py-2 h-auto"
                  data-screenshot-target="user-menu-trigger"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.username}</span>
                  {user.isAdmin && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      {content.admin.value}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" data-screenshot-target="user-menu">
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  {content.changePassword.value}
                </DropdownMenuItem>
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`/${locale}/settings?tab=users`)}>
                      <Users className="h-4 w-4 mr-2" />
                      {content.users.value}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${locale}/settings?tab=audit`)}>
                  <ScrollText className="h-4 w-4 mr-2" />
                  {content.auditLog.value}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Languages className="h-4 w-4 mr-2" />
                    {content.language.value}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
                      {SUPPORTED_LOCALES.map((loc) => (
                        <DropdownMenuRadioItem key={loc} value={loc}>
                          {LOCALE_NAMES[loc]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {common.navigation.logout.value}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <Button 
            variant="outline" 
            size="icon" 
            title={helpTooltip}
            className="ml-4"
            onClick={() => window.open(helpInfo.url, '_blank', 'noopener,noreferrer')}
          >
            <BookOpenText className="h-4 w-4" />
          </Button>
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

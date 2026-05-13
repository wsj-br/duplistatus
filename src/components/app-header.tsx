'use client';
import { useTranslation } from "react-i18next";
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Settings, BookOpenText, LogOut, User, KeyRound, Users, ChevronDown, ArrowLeft, ScrollText, Languages } from 'lucide-react';
import { BackupCollectMenu } from '@/components/backup-collect-menu';
import { GlobalRefreshControls } from '@/components/global-refresh-controls';
import { NtfyMessagesButton } from '@/components/ntfy-messages-button';
import { OpenServerConfigButton } from '@/components/open-server-config-button';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useConnectivityError } from '@/components/ui/connectivity-error-modal';
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
import { ServerFilterInput } from '@/components/ui/server-filter-input';
import { getHelpUrl } from '@/lib/helpMapper';
import { useLocale } from '@/contexts/locale-context';
import { useDashboardServerFilter } from '@/contexts/dashboard-server-filter-context';
import i18n, { loadLocale } from '@/i18n';
import {
  getLocaleLabel,
  isSupportedLocale,
  LOCALE_CODE_LIST,
  LOCALE_COOKIE_NAME,
  type LocaleCode,
} from '@/lib/locales';
//import the logo image
import DupliLogo from '../../public/images/duplistatus_logo.png';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword?: boolean;
}

const LOCALES = LOCALE_CODE_LIST;

const LOCALE_NAMES: Record<LocaleCode, string> = Object.fromEntries(
  LOCALES.map((code) => [code, getLocaleLabel(code)])
) as Record<LocaleCode, string>;

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { t } = useTranslation();
  const { showConnectivityError, hideConnectivityError } = useConnectivityError();
  const { serverFilter, setServerFilter } = useDashboardServerFilter();
  /** Home dashboard only — app routes are not locale-prefixed (language via cookie / i18n). */
  const isDashboardPage = pathname === '/';
  const isHomeDashboard = pathname === '/';
  const isSettingsPage = /\/settings/.test(pathname ?? '');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Get context-aware help URL and page name
  const helpInfo = getHelpUrl(pathname, searchParams.toString(), locale);
  const helpTooltip = helpInfo.pageName === 'User Guide' 
    ? t("Help")
    : t('Help for {{pageName}}', { pageName: helpInfo.pageName });

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

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === locale) return;
    if (!isSupportedLocale(newLocale)) return;
    document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(newLocale)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    await loadLocale(newLocale);
    await i18n.changeLanguage(newLocale);
    router.refresh();
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
        router.push(`/login`);
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
              <span className="text-sm font-medium">{t("Return to Dashboard")}</span>
            </Link>
            {isSettingsPage && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4 rtl-flip-icon" />
                <span>{t("Back")}</span>
              </Button>
            )}
          </div>
        )}
        
        <div className="flex flex-1 items-center justify-end flex-wrap gap-2 self-start">
          {isHomeDashboard && (
            <ServerFilterInput
              variant="collapsible"
              value={serverFilter}
              onChange={setServerFilter}
              placeholder={t("Filter by name, alias, or backup...")}
              className="shrink-0"
            />
          )}
          <GlobalRefreshControls />
          <NtfyMessagesButton />
          <OpenServerConfigButton />
          <BackupCollectMenu />
          <Link href={`/settings`} className="ml-4">
            <Button variant="outline" size="icon" title={t("Settings")}>
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
                      {t("Admin")}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" data-screenshot-target="user-menu">
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t("Change Password")}
                </DropdownMenuItem>
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`/settings?tab=users`)}>
                      <Users className="h-4 w-4 mr-2" />
                      {t("Users")}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/settings?tab=audit`)}>
                  <ScrollText className="h-4 w-4 mr-2" />
                  {t("Audit Log")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Languages className="h-4 w-4 mr-2" />
                    {t("Language")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
                      {LOCALES.map((loc) => (
                        <DropdownMenuRadioItem key={loc} value={loc}>
                          {LOCALE_NAMES[loc as LocaleCode]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("Logout")}
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

"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useIntlayer } from 'react-intlayer';
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TogglePasswordInput } from "@/components/ui/toggle-password-input";
import { Checkbox } from "@/components/ui/checkbox";
import AppVersion from "@/components/app-version";
import { GithubLink } from "@/components/github-link";
import DupliLogo from "../../../../public/images/duplistatus_logo.png";
import { Info } from "lucide-react";
import { KeyChangedModal } from "@/components/key-changed-modal";
import { useLocale } from "@/contexts/locale-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";

const REMEMBERED_USERNAME_KEY = "duplistatus_remembered_username";
const REMEMBER_ME_ENABLED_KEY = "duplistatus_remember_me_enabled";
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

function LoginForm() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const content = useIntlayer('login-page');
  const common = useIntlayer('common');
  const layoutContent = useIntlayer('conditional-layout');
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REMEMBERED_USERNAME_KEY) || "";
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem(REMEMBER_ME_ENABLED_KEY) === "true" &&
        localStorage.getItem(REMEMBERED_USERNAME_KEY) !== ""
      );
    }
    return false;
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminTip, setShowAdminTip] = useState(false);
  const [showKeyChangedModal, setShowKeyChangedModal] = useState(false);
  const checkAuthCalledRef = useRef(false);
  const checkAdminTipCalledRef = useRef(false);

  const homeUrl = `/${locale}`;

  const validateRedirectUrl = useCallback((url: string | null): string => {
    if (!url) return homeUrl;
    try {
      const decoded = decodeURIComponent(url);
      if (decoded.startsWith("/") && !decoded.startsWith("//") && !decoded.includes("://")) {
        return decoded;
      }
    } catch {
      // fall through
    }
    return homeUrl;
  }, [homeUrl]);

  useEffect(() => {
    if (checkAuthCalledRef.current) return;
    checkAuthCalledRef.current = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.authenticated) {
          const redirectUrl = searchParams.get("redirect");
          const targetUrl = validateRedirectUrl(redirectUrl);
          if (
            targetUrl === "/login" ||
            targetUrl.startsWith("/login?") ||
            /\/login$/.test(targetUrl) ||
            /\/login\?/.test(targetUrl)
          ) {
            window.location.href = homeUrl;
            return;
          }
          window.location.href = targetUrl;
        }
      } catch {
        // ignore
      }
    }
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [searchParams, homeUrl, validateRedirectUrl]);

  useEffect(() => {
    if (checkAdminTipCalledRef.current) return;
    checkAdminTipCalledRef.current = true;

    async function checkAdminMustChangePassword() {
      try {
        const response = await fetch("/api/auth/admin-must-change-password");
        const data = await response.json();
        if (data.mustChangePassword) setShowAdminTip(true);
      } catch {
        // ignore
      }
    }
    checkAdminMustChangePassword();
  }, []);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (typeof window !== "undefined") {
      if (checked) {
        if (username) localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
        localStorage.setItem(REMEMBER_ME_ENABLED_KEY, "true");
      } else {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY);
        localStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
      }
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (typeof window !== "undefined" && rememberMe) {
      if (newUsername) localStorage.setItem(REMEMBERED_USERNAME_KEY, newUsername);
      else localStorage.removeItem(REMEMBERED_USERNAME_KEY);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const csrfResponse = await fetch("/api/csrf");
      const { token: csrfToken } = await csrfResponse.json();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || content.loginFailed);
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
          localStorage.setItem(REMEMBER_ME_ENABLED_KEY, "true");
        } else {
          localStorage.removeItem(REMEMBERED_USERNAME_KEY);
          localStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
        }
      }

      if (data.keyChanged) {
        setShowKeyChangedModal(true);
        setLoading(false);
        return;
      }

      const redirectUrl = searchParams.get("redirect");
      const targetUrl = validateRedirectUrl(redirectUrl);
      window.location.href = targetUrl;
    } catch {
      setError(content.unexpectedError);
      setLoading(false);
    }
  };

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;
    
    // Set cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    
    // Get current path without locale prefix
    const currentPath = window.location.pathname;
    let pathWithoutLocale = currentPath.replace(/^\/(en|de|fr|es|pt-BR)(\/|$)/, '/');
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = '/login';
    }
    
    // Preserve query parameters
    const queryString = window.location.search;
    const newPath = `/${newLocale}${pathWithoutLocale}${queryString}`;
    
    // Redirect to new locale
    window.location.href = newPath;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <Select value={locale} onValueChange={handleLocaleChange}>
          <SelectTrigger className="w-[160px] h-9 pl-3">
            <Languages className="h-4 w-4 mr-2 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LOCALES.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {LOCALE_NAMES[loc]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-1">
                <Image src={DupliLogo} alt="duplistatus Logo" width={40} height={40} />
              </div>
              <span className="text-3xl text-blue-600 sm:inline-block">duplistatus</span>
            </div>
            <p className="text-sm text-muted-foreground">{content.subtitle}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{content.logIn}</CardTitle>
              <CardDescription>{content.enterYourCredentials}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-md bg-destructive/10 p-4">
                    <div className="text-sm text-destructive">{error}</div>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{content.username}</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      placeholder={content.usernamePlaceholder.value}
                      value={username}
                      onChange={handleUsernameChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{content.password}</Label>
                    <TogglePasswordInput
                      id="password"
                      value={password}
                      onChange={setPassword}
                      placeholder={content.passwordPlaceholder.value}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => handleRememberMeChange(checked === true)}
                      disabled={loading}
                    />
                    <Label htmlFor="remember-me" className="cursor-pointer text-sm font-normal">
                      {content.rememberMe}
                    </Label>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? content.loginInProgress : content.logIn}
                </Button>
              </form>
            </CardContent>
          </Card>

          {showAdminTip && (
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <span className="flex items-center gap-1 text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                    {content.note}
                  </span>
                  <p>
                    {content.defaultLoginCredentialsAre}{" "}
                    <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">admin</code> /{" "}
                    <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Duplistatus09</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-6">
          <AppVersion />
          <GithubLink />
        </div>
        <span className="text-tiny text-muted-foreground text-center mb-4">
          Copyright &copy; {new Date().getFullYear()} Waldemar Scudeller Jr.
        </span>
      </div>

      <KeyChangedModal
        open={showKeyChangedModal}
        onOpenChange={(open) => {
          setShowKeyChangedModal(open);
          if (!open) {
            const redirectUrl = searchParams.get("redirect");
            const targetUrl = validateRedirectUrl(redirectUrl);
            window.location.href = targetUrl;
          }
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  const content = useIntlayer('login-page');
  const common = useIntlayer('common');
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">{content.loading}</div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

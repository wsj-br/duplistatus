'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TogglePasswordInput } from '@/components/ui/toggle-password-input';
import { Checkbox } from '@/components/ui/checkbox';
import AppVersion from '@/components/app-version';
import { GithubLink } from '@/components/github-link';
import DupliLogo from '../../../public/images/duplistatus_logo.png';

const REMEMBERED_USERNAME_KEY = 'duplistatus_remembered_username';
const REMEMBER_ME_ENABLED_KEY = 'duplistatus_remember_me_enabled';

function LoginForm() {
  const searchParams = useSearchParams();
  // Initialize state with lazy initializers to read from localStorage
  // This avoids hydration mismatches and setState in effects
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REMEMBERED_USERNAME_KEY) || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REMEMBER_ME_ENABLED_KEY) === 'true' && 
             localStorage.getItem(REMEMBERED_USERNAME_KEY) !== '';
    }
    return false;
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Use lazy initializer to check if we're in the browser
  const [mounted, setMounted] = useState(() => typeof window !== 'undefined');

  // Validate redirect URL to prevent open redirect vulnerabilities
  const validateRedirectUrl = (url: string | null): string => {
    if (!url) return '/';
    
    try {
      const decoded = decodeURIComponent(url);
      // Only allow relative URLs (starting with /)
      // Reject absolute URLs, protocol-relative URLs, and javascript: schemes
      if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('://')) {
        return decoded;
      }
    } catch (error) {
      console.error('Error decoding redirect URL:', error);
    }
    
    return '/';
  };

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.authenticated) {
          // Already logged in, redirect to the redirect URL or home
          const redirectUrl = searchParams.get('redirect');
          const targetUrl = validateRedirectUrl(redirectUrl);
          window.location.href = targetUrl;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    }
    checkAuth();
  }, [searchParams]);

  // Handle remember me checkbox change
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    if (typeof window !== 'undefined') {
      if (checked) {
        // Save username and remember me preference
        if (username) {
          localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
        }
        localStorage.setItem(REMEMBER_ME_ENABLED_KEY, 'true');
      } else {
        // Clear saved data
        localStorage.removeItem(REMEMBERED_USERNAME_KEY);
        localStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
      }
    }
  };

  // Handle username change - update localStorage if remember me is checked
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    
    if (typeof window !== 'undefined' && rememberMe) {
      if (newUsername) {
        localStorage.setItem(REMEMBERED_USERNAME_KEY, newUsername);
      } else {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf');
      const { token: csrfToken } = await csrfResponse.json();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Save username and remember me preference on successful login
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
          localStorage.setItem(REMEMBER_ME_ENABLED_KEY, 'true');
        } else {
          localStorage.removeItem(REMEMBERED_USERNAME_KEY);
          localStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
        }
      }

      // Login successful - redirect to the redirect URL or home
      // Use full page reload to ensure cookie is available
      // The change password modal will auto-open if mustChangePassword is true
      const redirectUrl = searchParams.get('redirect');
      const targetUrl = validateRedirectUrl(redirectUrl);
      window.location.href = targetUrl;
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-6">
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
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Log in</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-md bg-destructive/10 p-4">
                    <div className="text-sm text-destructive">
                      {error}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      placeholder="Username"
                      value={username}
                      onChange={handleUsernameChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <TogglePasswordInput
                      id="password"
                      value={password}
                      onChange={setPassword}
                      placeholder="Password"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={mounted ? rememberMe : false}
                      onCheckedChange={(checked) => handleRememberMeChange(checked === true)}
                      disabled={loading}
                    />
                    <Label htmlFor="remember-me" className="cursor-pointer text-sm font-normal">
                      Remember me
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-6">
          <AppVersion />
          <GithubLink />
        </div>
        <span className="text-tiny text-muted-foreground text-center mb-4">
          Product names and icons belong to their respective owners and are used for identification purposes only.
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

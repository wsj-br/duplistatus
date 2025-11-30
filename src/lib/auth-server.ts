import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { dbOps, ensureDatabaseInitialized } from './db';
import { validateSession, getUserIdFromSession } from './session-csrf';
import { getRequestUrl, requestUrlStorage } from './request-url-storage';

export interface ServerAuthContext {
  userId: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword: boolean;
}

/**
 * Server-side authentication check for Server Components
 * Redirects to login page if not authenticated
 * Preserves the current URL as a redirect parameter for post-login redirect
 */
export async function requireServerAuth(): Promise<ServerAuthContext> {
  // Ensure database is ready
  await ensureDatabaseInitialized();

  // Get session ID from cookie
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  // Get current URL for redirect parameter
  // Try AsyncLocalStorage first (from custom server), then headers (from middleware)
  const urlFromStore = getRequestUrl();
  const headersList = await headers();
  
  // Prefer AsyncLocalStorage if available (custom server), otherwise use headers (middleware)
  const pathname = urlFromStore.pathname !== '/' || !headersList.get('x-pathname')
    ? urlFromStore.pathname
    : (headersList.get('x-pathname') || '/');
  const searchParams = urlFromStore.searchParams || headersList.get('x-search-params') || '';
  
  // Construct the full URL with query params if they exist
  const currentUrl = searchParams && searchParams.length > 0 
    ? `${pathname}?${searchParams}` 
    : pathname;
  const redirectUrl = encodeURIComponent(currentUrl);

  if (!sessionId) {
    redirect(`/login?redirect=${redirectUrl}`);
  }

  // Validate session
  const isValid = validateSession(sessionId);
  if (!isValid) {
    redirect(`/login?redirect=${redirectUrl}`);
  }

  // Get user ID from session
  const userId = getUserIdFromSession(sessionId);
  if (!userId) {
    redirect(`/login?redirect=${redirectUrl}`);
  }

  // Get user from database
  const user = dbOps.getUserById.get(userId) as {
    id: string;
    username: string;
    is_admin: number;
    must_change_password: number;
    locked_until: string | null;
  } | undefined;

  if (!user) {
    redirect(`/login?redirect=${redirectUrl}`);
  }

  // Check if user is locked
  if (user.locked_until) {
    const lockExpiry = new Date(user.locked_until);
    if (lockExpiry > new Date()) {
      redirect(`/login?redirect=${redirectUrl}`);
    }
  }

  // Note: If user must change password, we allow the page to load
  // The change password modal will be auto-opened by the app header
  // The modal cannot be closed until password is changed (when required=true)

  return {
    userId: user.id,
    username: user.username,
    isAdmin: user.is_admin === 1,
    mustChangePassword: user.must_change_password === 1,
  };
}

/**
 * Optional server-side authentication check
 * Returns null if not authenticated instead of redirecting
 */
export async function getServerAuth(): Promise<ServerAuthContext | null> {
  try {
    // Ensure database is ready
    await ensureDatabaseInitialized();

    // Get session ID from cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    if (!sessionId) {
      return null;
    }

    // Validate session
    const isValid = validateSession(sessionId);
    if (!isValid) {
      return null;
    }

    // Get user ID from session
    const userId = getUserIdFromSession(sessionId);
    if (!userId) {
      return null;
    }

    // Get user from database
    const user = dbOps.getUserById.get(userId) as {
      id: string;
      username: string;
      is_admin: number;
      must_change_password: number;
      locked_until: string | null;
    } | undefined;

    if (!user) {
      return null;
    }

    // Check if user is locked
    if (user.locked_until) {
      const lockExpiry = new Date(user.locked_until);
      if (lockExpiry > new Date()) {
        return null;
      }
    }

    return {
      userId: user.id,
      username: user.username,
      isAdmin: user.is_admin === 1,
      mustChangePassword: user.must_change_password === 1,
    };
  } catch (error) {
    console.error('[Auth Server] Error getting server auth:', error);
    return null;
  }
}


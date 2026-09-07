'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { parseLocaleTag } from '@/lib/locales';
import {
  getUserLocalStorageItem,
  setUserLocalStorageItem,
} from '@/lib/user-local-storage';
import {
  UI_LOCALE_STORAGE_KEY,
  applyUiLocale,
  getActiveUiLocale,
  readLocaleCookie,
  setLocaleCookie,
} from '@/lib/ui-locale-client';

/**
 * Applies the authenticated user's stored UI language after login / user switch.
 * Seeds from the NEXT_LOCALE cookie when the user has no saved preference yet.
 */
export function UserLocaleSync() {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const lastAppliedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    // undefined = still loading; null = unauthenticated (e.g. login page).
    if (currentUser === undefined) {
      return;
    }
    if (currentUser === null) {
      lastAppliedUserIdRef.current = null;
      return;
    }
    if (lastAppliedUserIdRef.current === currentUser.id) {
      return;
    }
    lastAppliedUserIdRef.current = currentUser.id;

    void (async () => {
      const storedRaw = getUserLocalStorageItem(
        UI_LOCALE_STORAGE_KEY,
        currentUser.id,
      );
      const storedLocale = storedRaw ? parseLocaleTag(storedRaw) : null;

      if (!storedLocale) {
        const cookieLocale = parseLocaleTag(readLocaleCookie() ?? '');
        if (cookieLocale) {
          setUserLocalStorageItem(
            UI_LOCALE_STORAGE_KEY,
            currentUser.id,
            cookieLocale,
          );
        }
        return;
      }

      const active = getActiveUiLocale();
      if (active === storedLocale) {
        setLocaleCookie(storedLocale);
        return;
      }

      await applyUiLocale(storedLocale);
      router.refresh();
    })();
  }, [currentUser, router]);

  return null;
}

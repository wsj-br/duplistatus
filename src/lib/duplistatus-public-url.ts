import { getDailySummaryConfig } from '@/lib/db-utils';
import { isValidHttpPublicUrl, normalizePublicUrl } from '@/lib/public-url-utils';

export { isValidHttpPublicUrl, normalizePublicUrl } from '@/lib/public-url-utils';

export function getDuplistatusPublicUrlFromEnvironment(): string | null {
  const configured = process.env.DUPLISTATUS_PUBLIC_URL?.trim();
  if (!configured) {
    return null;
  }
  return normalizePublicUrl(configured);
}

export function isDuplistatusPublicUrlEnvOverrideActive(): boolean {
  return getDuplistatusPublicUrlFromEnvironment() !== null;
}

/**
 * Effective public base URL for `{duplistatus_link}` in Daily Summary emails.
 * Resolution order: `DUPLISTATUS_PUBLIC_URL` env, then Settings → Daily Summary public URL.
 */
export function getDuplistatusPublicUrl(): string | null {
  const fromEnv = getDuplistatusPublicUrlFromEnvironment();
  if (fromEnv) {
    return fromEnv;
  }
  const fromSettings = getDailySummaryConfig().publicUrl.trim();
  if (!fromSettings) {
    return null;
  }
  return normalizePublicUrl(fromSettings);
}

import { createHash, randomBytes } from 'crypto';
import type { ApiKeyScope } from './types';
import { assertApiKeyScope } from './types';

export const API_KEY_FINGERPRINT_LENGTH = 4;
const UNMATCHED_PLACEHOLDER = 'unmatched';
const MAX_MASK_INPUT = 128;

export function generateApiKeySecret(): string {
  return randomBytes(32)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function hashApiKey(secret: string): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex');
}

export function apiKeyPrefix(secret: string): string {
  return secret.slice(0, API_KEY_FINGERPRINT_LENGTH);
}

export function apiKeySuffix(secret: string): string {
  return secret.slice(-API_KEY_FINGERPRINT_LENGTH);
}

export function formatApiKeyFingerprint(prefix: string, suffix: string): string {
  if (!prefix || !suffix) {
    return UNMATCHED_PLACEHOLDER;
  }
  return `${prefix}…${suffix}`;
}

export function maskApiKeyValue(value: string): string {
  const trimmed = value.trim().slice(0, MAX_MASK_INPUT);
  if (trimmed.length < API_KEY_FINGERPRINT_LENGTH * 2) {
    return UNMATCHED_PLACEHOLDER;
  }
  return formatApiKeyFingerprint(
    trimmed.slice(0, API_KEY_FINGERPRINT_LENGTH),
    trimmed.slice(-API_KEY_FINGERPRINT_LENGTH)
  );
}

export function redactApiKeyFromUrl(url: string): string {
  return url.replace(/([?&]api_key=)[^&]*/gi, '$1[REDACTED]');
}

export function scopeLabel(scope: ApiKeyScope): string {
  assertApiKeyScope(scope);
  switch (scope) {
    case 'upload':
      return 'upload';
    case 'read':
      return 'read';
    default: {
      const exhaustive: never = scope;
      throw new Error(`Unhandled API key scope: ${String(exhaustive)}`);
    }
  }
}

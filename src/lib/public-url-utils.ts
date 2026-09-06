export function normalizePublicUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function isValidHttpPublicUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

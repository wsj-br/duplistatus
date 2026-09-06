import { NextRequest } from 'next/server';

export const PEER_IP_HEADER = 'x-duplistatus-peer-ip';

/**
 * TCP peer address written by scripts/peer-ip.cjs. Empty when the preload
 * is not wired. Never taken from a client-controlled header.
 */
export function getPeerIp(request: NextRequest): string {
  const raw = request.headers.get(PEER_IP_HEADER);
  if (!raw) {
    return '';
  }
  return normalizeIpAddress(raw);
}

export function normalizeIpAddress(address: string): string {
  const trimmed = address.trim();
  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice('::ffff:'.length);
  }
  return trimmed;
}

export function isLoopbackIp(ip: string): boolean {
  const normalized = normalizeIpAddress(ip);
  return normalized === '127.0.0.1' || normalized === '::1' || normalized === 'localhost';
}

/**
 * Extract client IP address from Next.js request.
 * Handles various proxy headers and fallbacks.
 * Prefer getPeerIp() / resolveClientIp() when the value is used for access control.
 */
export function getClientIpAddress(request: NextRequest): string {
  const peer = getPeerIp(request);
  if (peer) {
    return peer;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) {
      return normalizeIpAddress(firstIp);
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return normalizeIpAddress(realIp);
  }

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return normalizeIpAddress(cfIp);
  }

  const clientIp = request.headers.get('x-client-ip');
  if (clientIp) {
    return normalizeIpAddress(clientIp);
  }

  return 'unknown';
}

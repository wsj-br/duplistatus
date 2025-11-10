import { NextRequest } from 'next/server';

/**
 * Extract client IP address from Next.js request
 * Handles various proxy headers and fallbacks
 */
export function getClientIpAddress(request: NextRequest): string {
  // Try x-forwarded-for first (most common in production)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
    // The first IP is usually the original client IP
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) {
      console.log('[IP Utils] Found IP from x-forwarded-for:', firstIp);
      return firstIp;
    }
  }

  // Try x-real-ip (used by some proxies like nginx)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    console.log('[IP Utils] Found IP from x-real-ip:', realIp);
    return realIp.trim();
  }

  // Try cf-connecting-ip (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    console.log('[IP Utils] Found IP from cf-connecting-ip:', cfIp);
    return cfIp.trim();
  }

  // Try x-client-ip (some load balancers)
  const clientIp = request.headers.get('x-client-ip');
  if (clientIp) {
    console.log('[IP Utils] Found IP from x-client-ip:', clientIp);
    return clientIp.trim();
  }

  // Try to get from request.geo (Next.js 13+)
  // @ts-ignore - geo might not be in types
  if (request.geo?.ip) {
    // @ts-ignore
    console.log('[IP Utils] Found IP from request.geo:', request.geo.ip);
    // @ts-ignore
    return request.geo.ip;
  }

  // Fallback: try to get from request URL (for development)
  // In Next.js, we can't directly access the socket, but we can check
  // if we're in development and use localhost
  if (process.env.NODE_ENV === 'development') {
    // In development, if no proxy headers, it's likely localhost
    console.log('[IP Utils] Using development fallback: 127.0.0.1');
    return '127.0.0.1';
  }

  // Last resort: return unknown
  console.log('[IP Utils] No IP found, using unknown. Available headers:', {
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
    'x-real-ip': request.headers.get('x-real-ip'),
    'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
    'x-client-ip': request.headers.get('x-client-ip'),
  });
  return 'unknown';
}


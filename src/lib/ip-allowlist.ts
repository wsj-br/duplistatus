import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { BlockList } from 'node:net';
import type { NextRequest } from 'next/server';
import { getConfiguration } from './db-utils';
import { isNextProductionBuild } from './next-build-phase';
import { getDataDir } from './paths';
import {
  getPeerIp,
  normalizeIpAddress,
} from './ip-utils';
import { ensureLoopbackAllowlistCidrs } from './cidr-format';
import type { CidrAllowlistConfig, TrustedProxiesConfig } from './types';

export const DEFAULT_TRUSTED_PROXIES: TrustedProxiesConfig = {
  trustProxy: false,
  trustedProxies: [],
};

export const DEFAULT_ADMIN_IP_ALLOWLIST: CidrAllowlistConfig = {
  enabled: false,
  cidrs: ensureLoopbackAllowlistCidrs([]),
};

export const DEFAULT_EXTERNAL_API_IP_ALLOWLIST: CidrAllowlistConfig = {
  enabled: false,
  cidrs: ensureLoopbackAllowlistCidrs([]),
};

const CACHE_TTL_MS = 10_000;

interface CachedAllowlists {
  expiresAt: number;
  revision: string;
  trusted: TrustedProxiesConfig;
  admin: CidrAllowlistConfig;
  external: CidrAllowlistConfig;
  adminBlock: BlockList | null;
  externalBlock: BlockList | null;
  trustedBlock: BlockList | null;
}

let cache: CachedAllowlists | null = null;
let missingPeerWarned = false;

function allowlistRevisionPath(): string {
  return path.join(getDataDir(), '.ip-allowlist-rev');
}

function readAllowlistRevision(): string {
  try {
    return readFileSync(allowlistRevisionPath(), 'utf8');
  } catch {
    return '';
  }
}

export function invalidateIpAllowlistCache(): void {
  cache = null;
  try {
    writeFileSync(allowlistRevisionPath(), String(Date.now()), 'utf8');
  } catch {
    // Best-effort cross-isolate invalidation; the 10s TTL still expires.
  }
}

function parseBoolEnv(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  const lowered = value.trim().toLowerCase();
  if (lowered === 'true' || lowered === '1') {
    return true;
  }
  if (lowered === 'false' || lowered === '0') {
    return false;
  }
  return undefined;
}

function parseCidrList(value: string | undefined): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseJsonObject(raw: string | null): Record<string, unknown> | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function cidrsFromUnknown(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
}

function readDbConfigs(): {
  trusted: TrustedProxiesConfig;
  admin: CidrAllowlistConfig;
  external: CidrAllowlistConfig;
} {
  if (isNextProductionBuild()) {
    return {
      trusted: { ...DEFAULT_TRUSTED_PROXIES },
      admin: { ...DEFAULT_ADMIN_IP_ALLOWLIST },
      external: { ...DEFAULT_EXTERNAL_API_IP_ALLOWLIST },
    };
  }

  try {
    const trustedRaw = parseJsonObject(getConfiguration('ip_trusted_proxies'));
    const adminRaw = parseJsonObject(getConfiguration('admin_ip_allowlist'));
    const externalRaw = parseJsonObject(getConfiguration('external_api_ip_allowlist'));

    return {
      trusted: {
        trustProxy: trustedRaw?.trustProxy === true,
        trustedProxies: cidrsFromUnknown(trustedRaw?.trustedProxies),
      },
      admin: {
        enabled: adminRaw?.enabled === true,
        cidrs: cidrsFromUnknown(adminRaw?.cidrs),
      },
      external: {
        enabled: externalRaw?.enabled === true,
        cidrs: cidrsFromUnknown(externalRaw?.cidrs),
      },
    };
  } catch {
    return {
      trusted: { ...DEFAULT_TRUSTED_PROXIES },
      admin: { ...DEFAULT_ADMIN_IP_ALLOWLIST },
      external: { ...DEFAULT_EXTERNAL_API_IP_ALLOWLIST },
    };
  }
}

function applyEnvOverrides(base: {
  trusted: TrustedProxiesConfig;
  admin: CidrAllowlistConfig;
  external: CidrAllowlistConfig;
}): {
  trusted: TrustedProxiesConfig;
  admin: CidrAllowlistConfig;
  external: CidrAllowlistConfig;
} {
  const trustedProxies = parseCidrList(process.env.IP_TRUSTED_PROXIES);
  const adminEnabled = parseBoolEnv(process.env.ADMIN_IP_ALLOWLIST_ENABLED);
  const adminCidrs = parseCidrList(process.env.ADMIN_IP_ALLOWLIST);
  const externalEnabled = parseBoolEnv(process.env.EXTERNAL_API_IP_ALLOWLIST_ENABLED);
  const externalCidrs = parseCidrList(process.env.EXTERNAL_API_IP_ALLOWLIST);

  return {
    trusted: {
      trustProxy: trustedProxies !== undefined ? trustedProxies.length > 0 : base.trusted.trustProxy,
      trustedProxies: trustedProxies ?? base.trusted.trustedProxies,
    },
    admin: {
      enabled: adminEnabled ?? base.admin.enabled,
      cidrs: adminCidrs ?? base.admin.cidrs,
    },
    external: {
      enabled: externalEnabled ?? base.external.enabled,
      cidrs: externalCidrs ?? base.external.cidrs,
    },
  };
}

function addCidr(block: BlockList, cidr: string): void {
  const trimmed = cidr.trim();
  if (!trimmed) {
    return;
  }
  const slash = trimmed.indexOf('/');
  if (slash === -1) {
    const ip = normalizeIpAddress(trimmed);
    const family = ip.includes(':') ? 'ipv6' : 'ipv4';
    block.addAddress(ip, family);
    return;
  }
  const address = normalizeIpAddress(trimmed.slice(0, slash));
  const prefix = Number(trimmed.slice(slash + 1));
  if (!Number.isInteger(prefix) || prefix < 0) {
    return;
  }
  const family = address.includes(':') ? 'ipv6' : 'ipv4';
  const maxPrefix = family === 'ipv6' ? 128 : 32;
  if (prefix > maxPrefix) {
    return;
  }
  block.addSubnet(address, prefix, family);
}

function buildBlockList(cidrs: string[]): BlockList | null {
  if (cidrs.length === 0) {
    return null;
  }
  const block = new BlockList();
  for (const cidr of cidrs) {
    try {
      addCidr(block, cidr);
    } catch {
      // Skip invalid CIDRs rather than failing closed for the whole list.
    }
  }
  return block;
}

function loadCached(): CachedAllowlists {
  const now = Date.now();
  const revision = readAllowlistRevision();
  if (cache && cache.expiresAt > now && cache.revision === revision) {
    return cache;
  }
  const merged = applyEnvOverrides(readDbConfigs());
  const admin = {
    ...merged.admin,
    cidrs: ensureLoopbackAllowlistCidrs(merged.admin.cidrs),
  };
  const external = {
    ...merged.external,
    cidrs: ensureLoopbackAllowlistCidrs(merged.external.cidrs),
  };
  cache = {
    expiresAt: now + CACHE_TTL_MS,
    revision,
    trusted: merged.trusted,
    admin,
    external,
    adminBlock: buildBlockList(admin.cidrs),
    externalBlock: buildBlockList(external.cidrs),
    trustedBlock: buildBlockList(merged.trusted.trustedProxies),
  };
  return cache;
}

export function getIpAllowlistSnapshot(): {
  trusted: TrustedProxiesConfig;
  admin: CidrAllowlistConfig;
  external: CidrAllowlistConfig;
} {
  const cached = loadCached();
  return {
    trusted: cached.trusted,
    admin: cached.admin,
    external: cached.external,
  };
}

function ipInBlock(block: BlockList | null, ip: string): boolean {
  if (!block) {
    return false;
  }
  const normalized = normalizeIpAddress(ip);
  const family = normalized.includes(':') ? 'ipv6' : 'ipv4';
  try {
    return block.check(normalized, family);
  } catch {
    return false;
  }
}

function lastUntrustedHop(forwardedFor: string, trustedBlock: BlockList | null): string {
  const hops = forwardedFor
    .split(',')
    .map((hop) => normalizeIpAddress(hop))
    .filter((hop) => hop.length > 0);
  if (hops.length === 0) {
    return '';
  }
  for (let i = hops.length - 1; i >= 0; i -= 1) {
    if (!ipInBlock(trustedBlock, hops[i])) {
      return hops[i];
    }
  }
  return hops[0];
}

/**
 * Client IP used for allowlist decisions. Never trusts X-Forwarded-For unless
 * the TCP peer is a configured trusted proxy.
 */
export function resolveAllowlistIp(request: NextRequest): string {
  const peer = getPeerIp(request);
  const cached = loadCached();

  if (!cached.trusted.trustProxy || !peer || !ipInBlock(cached.trustedBlock, peer)) {
    return peer;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return normalizeIpAddress(realIp);
  }
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return lastUntrustedHop(forwardedFor, cached.trustedBlock);
  }
  return peer;
}

export type AllowlistSurface = 'admin' | 'external' | 'exempt';

export function classifyAllowlistPath(pathname: string): AllowlistSurface {
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/api/health' ||
    pathname === '/api/ping'
  ) {
    return 'exempt';
  }
  if (
    pathname === '/api/upload' ||
    pathname.startsWith('/api/upload/') ||
    pathname === '/api/summary' ||
    pathname.startsWith('/api/summary/') ||
    pathname.startsWith('/api/lastbackup') ||
    pathname.startsWith('/api/lastbackups')
  ) {
    return 'external';
  }
  return 'admin';
}

export function isIpAllowed(surface: AllowlistSurface, ip: string, _peer: string): boolean {
  if (surface === 'exempt') {
    return true;
  }
  const cached = loadCached();
  const list = surface === 'admin' ? cached.admin : cached.external;
  const block = surface === 'admin' ? cached.adminBlock : cached.externalBlock;

  if (!list.enabled) {
    return true;
  }

  if (!ip) {
    if (!missingPeerWarned) {
      missingPeerWarned = true;
      console.warn(
        '[IP allowlist] Peer IP header is missing. Ensure scripts/peer-ip.cjs is loaded via --require / NODE_OPTIONS. Denying while the allowlist is enabled.'
      );
    }
    return false;
  }

  return ipInBlock(block, ip);
}

export function ipMatchesCidrs(ip: string, cidrs: string[]): boolean {
  const block = buildBlockList(cidrs);
  return ipInBlock(block, ip);
}

export function parseCidrInput(cidrs: unknown): string[] | null {
  if (!Array.isArray(cidrs)) {
    return null;
  }
  const result: string[] = [];
  for (const item of cidrs) {
    if (typeof item !== 'string') {
      return null;
    }
    const trimmed = item.trim();
    if (!trimmed) {
      continue;
    }
    try {
      const probe = new BlockList();
      addCidr(probe, trimmed);
      result.push(trimmed);
    } catch {
      return null;
    }
  }
  return result;
}

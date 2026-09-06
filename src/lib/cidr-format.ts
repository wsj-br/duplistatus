/**
 * Client-safe IP/CIDR helpers for the allowlist editor.
 * Server-side parseCidrInput remains the authoritative validator.
 */

function isIpv4Address(value: string): boolean {
  const parts = value.split('.');
  if (parts.length !== 4) {
    return false;
  }
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) {
      return false;
    }
    const octet = Number(part);
    return octet >= 0 && octet <= 255;
  });
}

function isIpv6Address(value: string): boolean {
  if (value.includes('%')) {
    return false;
  }

  let address = value;
  if (address.includes('.')) {
    const lastColon = address.lastIndexOf(':');
    if (lastColon === -1) {
      return false;
    }
    const mappedIpv4 = address.slice(lastColon + 1);
    if (!isIpv4Address(mappedIpv4)) {
      return false;
    }
    address = `${address.slice(0, lastColon + 1)}0:0`;
  }

  if ((address.match(/::/g) ?? []).length > 1 || address.includes(':::')) {
    return false;
  }

  const hextet = /^[0-9a-fA-F]{1,4}$/;
  if (address.includes('::')) {
    const [left, right] = address.split('::');
    const leftParts = left === '' ? [] : left.split(':');
    const rightParts = right === '' ? [] : right.split(':');
    if (leftParts.some((part) => !hextet.test(part)) || rightParts.some((part) => !hextet.test(part))) {
      return false;
    }
    return leftParts.length + rightParts.length < 8;
  }

  const parts = address.split(':');
  return parts.length === 8 && parts.every((part) => hextet.test(part));
}

export function isPlausibleCidr(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const slash = trimmed.indexOf('/');
  if (slash === -1) {
    return isIpv4Address(trimmed) || isIpv6Address(trimmed);
  }

  const address = trimmed.slice(0, slash);
  const prefixRaw = trimmed.slice(slash + 1);
  if (!/^\d{1,3}$/.test(prefixRaw)) {
    return false;
  }
  const prefix = Number(prefixRaw);
  if (isIpv4Address(address)) {
    return prefix >= 0 && prefix <= 32;
  }
  if (isIpv6Address(address)) {
    return prefix >= 0 && prefix <= 128;
  }
  return false;
}

export function splitCidrInput(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function cidrsEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function appendUniqueCidrs(existing: string[], incoming: string[]): string[] {
  const next = [...existing];
  for (const item of incoming) {
    const trimmed = item.trim();
    if (!trimmed) {
      continue;
    }
    if (next.some((current) => cidrsEqual(current, trimmed))) {
      continue;
    }
    next.push(trimmed);
  }
  return next;
}

/** Loopback addresses always allowed on admin and external allowlists. */
export const LOOPBACK_ALLOWLIST_CIDRS = ['127.0.0.1', '::1'] as const;

export function ensureLoopbackAllowlistCidrs(cidrs: string[]): string[] {
  return appendUniqueCidrs([...LOOPBACK_ALLOWLIST_CIDRS], cidrs);
}

export function isLoopbackAllowlistCidr(cidr: string): boolean {
  return LOOPBACK_ALLOWLIST_CIDRS.some((loopback) => cidrsEqual(cidr, loopback));
}

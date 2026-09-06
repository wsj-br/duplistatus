const MAX_BUCKETS = 2000;
const SWEEP_INTERVAL_MS = 60_000;

interface WindowHits {
  minute: number[];
  hour: number[];
  lastSeen: number;
}

const buckets = new Map<string, WindowHits>();
let lastSweep = Date.now();

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) {
    return;
  }
  lastSweep = now;
  const hourAgo = now - 60 * 60 * 1000;
  for (const [key, hits] of buckets) {
    hits.minute = hits.minute.filter((t) => now - t < 60_000);
    hits.hour = hits.hour.filter((t) => t > hourAgo);
    if (hits.hour.length === 0 && now - hits.lastSeen > 60 * 60 * 1000) {
      buckets.delete(key);
    }
  }
}

function evictOldest(): void {
  if (buckets.size < MAX_BUCKETS) {
    return;
  }
  let oldestKey: string | null = null;
  let oldestSeen = Number.POSITIVE_INFINITY;
  for (const [key, hits] of buckets) {
    if (hits.lastSeen < oldestSeen) {
      oldestSeen = hits.lastSeen;
      oldestKey = key;
    }
  }
  if (oldestKey) {
    buckets.delete(oldestKey);
  }
}

function getBucket(key: string, now: number): WindowHits {
  sweep(now);
  let hits = buckets.get(key);
  if (!hits) {
    evictOldest();
    hits = { minute: [], hour: [], lastSeen: now };
    buckets.set(key, hits);
  }
  hits.minute = hits.minute.filter((t) => now - t < 60_000);
  hits.hour = hits.hour.filter((t) => now - t < 60 * 60 * 1000);
  hits.lastSeen = now;
  return hits;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  perMinute: number,
  perHour: number
): RateLimitDecision {
  const now = Date.now();
  const hits = getBucket(key, now);

  if (hits.minute.length >= perMinute) {
    const retryAfterSeconds = Math.max(1, Math.ceil((hits.minute[0] + 60_000 - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }
  if (hits.hour.length >= perHour) {
    const retryAfterSeconds = Math.max(1, Math.ceil((hits.hour[0] + 60 * 60 * 1000 - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  hits.minute.push(now);
  hits.hour.push(now);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function peekRateLimit(
  key: string,
  perMinute: number,
  perHour: number
): RateLimitDecision {
  const now = Date.now();
  const hits = getBucket(key, now);
  if (hits.minute.length >= perMinute) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((hits.minute[0] + 60_000 - now) / 1000)),
    };
  }
  if (hits.hour.length >= perHour) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((hits.hour[0] + 60 * 60 * 1000 - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordRateLimitHit(key: string): void {
  const now = Date.now();
  const hits = getBucket(key, now);
  hits.minute.push(now);
  hits.hour.push(now);
}

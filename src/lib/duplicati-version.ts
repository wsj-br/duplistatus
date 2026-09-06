import {
  DUPLICATI_CHANNELS,
  DUPLICATI_VERSION_CHECK_INTERVALS,
  type DuplicatiChannel,
  type DuplicatiChannelVersion,
  type DuplicatiParsedVersion,
  type DuplicatiVersionCache,
  type DuplicatiVersionCheckInterval,
  type DuplicatiVersionStatus,
} from './types';

import {
  formatTimeLabel,
  isValidLocalTime,
  parseLocalTime,
} from './daily-summary-schedule';

export const DUPLICATI_VERSION_CACHE_KEY = 'duplicati_versions';
export const DUPLICATI_VERSION_CHECK_CONFIG_KEY = 'duplicati_version_check';
export const DUPLICATI_VERSION_STALE_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_DUPLICATI_VERSION_CHECK_INTERVAL: DuplicatiVersionCheckInterval = 'daily';
export const DEFAULT_DUPLICATI_VERSION_START_TIME_UTC = '03:00';

const CHANNEL_SET = new Set<string>(DUPLICATI_CHANNELS);

const VERSION_WITH_CHANNEL_RE =
  /v?(\d+(?:\.\d+){1,3})[_-](stable|beta|experimental|canary)(?:[_-]\d{4}-\d{2}-\d{2})?/i;
const VERSION_NUMBER_RE = /v?(\d+(?:\.\d+){1,3})/;

function isDuplicatiChannel(value: string): value is DuplicatiChannel {
  return CHANNEL_SET.has(value);
}

export function createEmptyDuplicatiVersionCache(): DuplicatiVersionCache {
  return {
    updatedAt: '',
    source: 'github',
    channels: {
      stable: null,
      beta: null,
      experimental: null,
      canary: null,
    },
  };
}

export function createUnavailableDuplicatiVersionStatus(
  raw: string | null = null
): DuplicatiVersionStatus {
  return {
    raw,
    versionNumber: null,
    channel: null,
    latestVersionNumber: null,
    comparison: 'unavailable',
  };
}

export function parseVersionComponents(
  versionNumber: string
): readonly [number, number, number, number] | null {
  const parts = versionNumber.split('.').map((part) => Number.parseInt(part, 10));
  if (parts.length < 2 || parts.length > 4 || parts.some((part) => Number.isNaN(part) || part < 0)) {
    return null;
  }

  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 0] as const;
}

export function compareVersionNumbers(left: string, right: string): number {
  const leftComponents = parseVersionComponents(left);
  const rightComponents = parseVersionComponents(right);
  if (!leftComponents && !rightComponents) {
    return 0;
  }
  if (!leftComponents) {
    return -1;
  }
  if (!rightComponents) {
    return 1;
  }

  for (let index = 0; index < 4; index += 1) {
    const delta = leftComponents[index] - rightComponents[index];
    if (delta !== 0) {
      return delta < 0 ? -1 : 1;
    }
  }

  return 0;
}

export function parseDuplicatiVersion(raw: string | null | undefined): DuplicatiParsedVersion | null {
  if (!raw || raw.trim() === '') {
    return null;
  }

  const normalized = raw.trim();
  const channelMatch = normalized.match(VERSION_WITH_CHANNEL_RE);
  if (channelMatch) {
    const versionNumber = channelMatch[1];
    const channelValue = channelMatch[2]?.toLowerCase() ?? '';
    const components = parseVersionComponents(versionNumber);
    if (!components || !isDuplicatiChannel(channelValue)) {
      return null;
    }

    return {
      versionNumber,
      channel: channelValue,
      components,
    };
  }

  const numberMatch = normalized.match(VERSION_NUMBER_RE);
  if (!numberMatch) {
    return null;
  }

  const versionNumber = numberMatch[1];
  const components = parseVersionComponents(versionNumber);
  if (!components) {
    return null;
  }

  return {
    versionNumber,
    channel: null,
    components,
  };
}

export function parseDuplicatiReleaseTag(tagName: string | null | undefined): DuplicatiParsedVersion | null {
  if (!tagName) {
    return null;
  }

  return parseDuplicatiVersion(tagName.trim());
}

export function isDuplicatiVersionCheckInterval(
  value: unknown
): value is DuplicatiVersionCheckInterval {
  return typeof value === 'string'
    && (DUPLICATI_VERSION_CHECK_INTERVALS as readonly string[]).includes(value);
}

export function isValidUtcHour(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 23;
}

export function isValidUtcTime(value: unknown): value is string {
  return typeof value === 'string' && isValidLocalTime(value);
}

export function legacyUtcHourToStartTimeUtc(hour: number): string {
  return formatTimeLabel(hour, 0);
}

const DAY_MINUTES = 24 * 60;

function utcTimeToTotalMinutes(utcTime: string): number {
  const { hour, minute } = parseLocalTime(utcTime);
  return hour * 60 + minute;
}

function totalMinutesToUtcTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return formatTimeLabel(Math.floor(normalized / 60), normalized % 60);
}

export function getDuplicatiVersionRunTimesUtc(
  interval: DuplicatiVersionCheckInterval,
  startTimeUtc: string
): string[] {
  const startTotalMinutes = utcTimeToTotalMinutes(startTimeUtc);
  const stepMinutes = interval === 'daily' ? DAY_MINUTES : interval === '12h' ? 12 * 60 : 6 * 60;
  const times: string[] = [];
  for (let offset = 0; offset < DAY_MINUTES; offset += stepMinutes) {
    times.push(totalMinutesToUtcTime(startTotalMinutes + offset));
  }
  return times.sort((left, right) => utcTimeToTotalMinutes(left) - utcTimeToTotalMinutes(right));
}

export function buildDuplicatiVersionCronExpression(
  interval: DuplicatiVersionCheckInterval,
  startTimeUtc: string
): string {
  const runTimes = getDuplicatiVersionRunTimesUtc(interval, startTimeUtc);
  const first = parseLocalTime(runTimes[0] ?? startTimeUtc);
  const hours = runTimes.map((time) => parseLocalTime(time).hour).sort((left, right) => left - right);
  return `${first.minute} ${hours.join(',')} * * *`;
}

export function getDuplicatiVersionStaleMs(interval: DuplicatiVersionCheckInterval): number {
  switch (interval) {
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case '12h':
      return 12 * 60 * 60 * 1000;
    case '6h':
      return 6 * 60 * 60 * 1000;
    default: {
      const exhaustive: never = interval;
      return exhaustive;
    }
  }
}

export function isDuplicatiVersionCacheStale(
  cache: DuplicatiVersionCache | null,
  staleMs: number = DUPLICATI_VERSION_STALE_MS,
  now: Date = new Date()
): boolean {
  if (!cache || !cache.updatedAt) {
    return true;
  }

  const updatedAt = new Date(cache.updatedAt);
  if (Number.isNaN(updatedAt.getTime())) {
    return true;
  }

  return now.getTime() - updatedAt.getTime() > staleMs;
}

export function compareServerVersionToCache(
  raw: string | null | undefined,
  cache: DuplicatiVersionCache | null
): DuplicatiVersionStatus {
  const parsed = parseDuplicatiVersion(raw);
  if (!parsed) {
    return createUnavailableDuplicatiVersionStatus(raw ?? null);
  }

  const latest = parsed.channel && cache ? cache.channels[parsed.channel] : null;
  if (!parsed.channel || !latest) {
    return {
      raw: raw ?? null,
      versionNumber: parsed.versionNumber,
      channel: parsed.channel,
      latestVersionNumber: null,
      comparison: 'unavailable',
    };
  }

  const comparison = compareVersionNumbers(parsed.versionNumber, latest.versionNumber) < 0
    ? 'outdated'
    : 'current';

  return {
    raw: raw ?? null,
    versionNumber: parsed.versionNumber,
    channel: parsed.channel,
    latestVersionNumber: latest.versionNumber,
    comparison,
  };
}

export function selectHighestChannelVersions(
  releases: Array<{ tagName: string; publishedAt: string | null }>
): Record<DuplicatiChannel, DuplicatiChannelVersion | null> {
  const channels = createEmptyDuplicatiVersionCache().channels;

  for (const release of releases) {
    const parsed = parseDuplicatiReleaseTag(release.tagName);
    if (!parsed || !parsed.channel) {
      continue;
    }

    const current = channels[parsed.channel];
    if (!current || compareVersionNumbers(parsed.versionNumber, current.versionNumber) > 0) {
      channels[parsed.channel] = {
        versionNumber: parsed.versionNumber,
        tagName: release.tagName,
        publishedAt: release.publishedAt,
      };
    }
  }

  return channels;
}

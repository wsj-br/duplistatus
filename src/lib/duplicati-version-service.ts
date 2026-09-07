import fs from 'fs';
import path from 'path';
import { AuditLogger } from './audit-logger';
import { getDuplicatiVersionCache, getDuplicatiVersionCheckConfig, setDuplicatiVersionCache } from './db-utils';
import {
  getDuplicatiVersionStaleMs,
  isDuplicatiVersionCacheStale,
  parseDuplicatiReleaseTag,
  selectHighestChannelVersions,
} from './duplicati-version';
import { getDataDir } from './paths';
import {
  DUPLICATI_CHANNELS,
  type DuplicatiChannel,
  type DuplicatiChannelVersion,
  type DuplicatiVersionCache,
  type DuplicatiVersionRefreshResult,
  type DuplicatiVersionRefreshTrigger,
} from './types';

export const runtime = 'nodejs';

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/duplicati/duplicati/releases';
const GITHUB_PAGE_SIZE = 100;
const GITHUB_MAX_PAGES = 2;
const GITHUB_REQUEST_TIMEOUT_MS = 15000;
const GITHUB_MAX_ATTEMPTS = 3;
const GITHUB_RETRY_DELAY_MS = 750;
const GITHUB_RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const LOCK_TIMEOUT_MS = 30000;
const LOCK_RETRY_INTERVAL_MS = 250;
const LOCK_FILE_NAME = '.duplicati-version-refresh.lock';

interface GitHubRelease {
  tag_name?: unknown;
  name?: unknown;
  draft?: unknown;
  published_at?: unknown;
}

class VersionRefreshLock {
  private readonly lockFilePath: string;
  private lockFileHandle: number | null = null;

  constructor() {
    this.lockFilePath = path.join(getDataDir(), LOCK_FILE_NAME);
  }

  async acquire(): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < LOCK_TIMEOUT_MS) {
      try {
        this.lockFileHandle = fs.openSync(this.lockFilePath, 'wx');
        fs.writeFileSync(
          this.lockFileHandle,
          JSON.stringify({
            pid: process.pid,
            timestamp: new Date().toISOString(),
          })
        );
        return true;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }

        if (this.removeStaleLock()) {
          continue;
        }

        await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_INTERVAL_MS));
      }
    }

    return false;
  }

  release(): void {
    if (this.lockFileHandle !== null) {
      try {
        fs.closeSync(this.lockFileHandle);
      } catch {
        // Ignore close errors
      }
      this.lockFileHandle = null;
    }

    try {
      if (fs.existsSync(this.lockFilePath)) {
        fs.unlinkSync(this.lockFilePath);
      }
    } catch {
      // Ignore unlink errors
    }
  }

  private removeStaleLock(): boolean {
    try {
      const lockInfo = JSON.parse(fs.readFileSync(this.lockFilePath, 'utf8')) as { pid?: number };
      if (typeof lockInfo.pid !== 'number') {
        fs.unlinkSync(this.lockFilePath);
        return true;
      }

      try {
        process.kill(lockInfo.pid, 0);
        return false;
      } catch {
        fs.unlinkSync(this.lockFilePath);
        return true;
      }
    } catch {
      try {
        if (fs.existsSync(this.lockFilePath)) {
          fs.unlinkSync(this.lockFilePath);
        }
      } catch {
        // Ignore cleanup errors
      }
      return true;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGitHubRelease(value: unknown): value is GitHubRelease {
  return isRecord(value);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGitHubStatus(status: number): boolean {
  return GITHUB_RETRYABLE_STATUS_CODES.has(status);
}

function isRetryableGitHubFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const nodeError = error as NodeJS.ErrnoException;
  if (
    nodeError.code === 'ABORT_ERR'
    || nodeError.code === 'ETIMEDOUT'
    || nodeError.code === 'ECONNRESET'
    || nodeError.code === 'EAI_AGAIN'
    || nodeError.code === 'UND_ERR_CONNECT_TIMEOUT'
    || nodeError.code === 'UND_ERR_HEADERS_TIMEOUT'
    || nodeError.code === 'UND_ERR_BODY_TIMEOUT'
  ) {
    return true;
  }

  return error.name === 'AbortError'
    || error.name === 'TimeoutError'
    || error.name === 'ConnectTimeoutError'
    || /HTTP 50[234]/.test(error.message);
}

function hasAllChannelVersions(
  channels: Record<DuplicatiChannel, DuplicatiChannelVersion | null>
): boolean {
  return DUPLICATI_CHANNELS.every((channel) => channels[channel] !== null);
}

function hasAnyChannelVersion(
  channels: Record<DuplicatiChannel, DuplicatiChannelVersion | null>
): boolean {
  return DUPLICATI_CHANNELS.some((channel) => channels[channel] !== null);
}

async function fetchGitHubReleasePage(page: number): Promise<GitHubRelease[]> {
  const url = `${GITHUB_RELEASES_URL}?per_page=${GITHUB_PAGE_SIZE}&page=${page}`;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= GITHUB_MAX_ATTEMPTS; attempt += 1) {
    try {
      // Bypass the Next.js Data Cache so production/standalone startup uses a
      // live GitHub request instead of a cached or in-progress fetch.
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'duplistatus',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        await response.arrayBuffer().catch(() => undefined);
        const error = new Error(`GitHub releases request failed with HTTP ${response.status}`);
        if (!isRetryableGitHubStatus(response.status) || attempt === GITHUB_MAX_ATTEMPTS) {
          throw error;
        }
        lastError = error;
      } else {
        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error('GitHub releases response is not an array');
        }
        return payload.filter(isGitHubRelease);
      }
    } catch (error) {
      if (attempt === GITHUB_MAX_ATTEMPTS || !isRetryableGitHubFetchError(error)) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    await sleep(GITHUB_RETRY_DELAY_MS * attempt);
  }

  throw lastError ?? new Error('GitHub releases request failed');
}

function collectReleasesFromPage(
  items: GitHubRelease[]
): Array<{ tagName: string; publishedAt: string | null }> {
  const releases: Array<{ tagName: string; publishedAt: string | null }> = [];

  for (const item of items) {
    if (item.draft === true) {
      continue;
    }

    const tagName = typeof item.tag_name === 'string'
      ? item.tag_name
      : typeof item.name === 'string'
        ? item.name
        : '';
    if (!tagName || !parseDuplicatiReleaseTag(tagName)) {
      continue;
    }

    releases.push({
      tagName,
      publishedAt: typeof item.published_at === 'string' ? item.published_at : null,
    });
  }

  return releases;
}

async function fetchLatestDuplicatiVersions(): Promise<DuplicatiVersionCache> {
  const releases: Array<{ tagName: string; publishedAt: string | null }> = [];

  for (let page = 1; page <= GITHUB_MAX_PAGES; page += 1) {
    let items: GitHubRelease[];
    try {
      items = await fetchGitHubReleasePage(page);
    } catch (error) {
      const channelsSoFar = selectHighestChannelVersions(releases);
      if (hasAnyChannelVersion(channelsSoFar)) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(
          '[DuplicatiVersion] GitHub page fetch failed after collecting channel versions; using releases gathered so far:',
          errorMessage
        );
        break;
      }
      throw error;
    }

    if (items.length === 0) {
      break;
    }

    releases.push(...collectReleasesFromPage(items));

    if (hasAllChannelVersions(selectHighestChannelVersions(releases))) {
      break;
    }

    if (items.length < GITHUB_PAGE_SIZE) {
      break;
    }
  }

  const channels = selectHighestChannelVersions(releases);
  if (!hasAnyChannelVersion(channels)) {
    throw new Error('No valid Duplicati channel releases were found');
  }

  return {
    updatedAt: new Date().toISOString(),
    source: 'github',
    channels,
  };
}

function channelVersionsForAudit(
  cache: DuplicatiVersionCache | null
): Partial<Record<DuplicatiChannel, string>> {
  if (!cache) {
    return {};
  }

  const versions: Partial<Record<DuplicatiChannel, string>> = {};
  for (const [channel, value] of Object.entries(cache.channels)) {
    if (value) {
      versions[channel as DuplicatiChannel] = value.versionNumber;
    }
  }
  return versions;
}

async function logDuplicatiVersionRefresh(
  trigger: DuplicatiVersionRefreshTrigger,
  status: 'success' | 'error',
  details: Record<string, unknown>,
  errorMessage?: string
): Promise<void> {
  await AuditLogger.logSystem(
    'duplicati_version_refresh',
    {
      trigger,
      source: 'github',
      ...details,
    },
    status,
    errorMessage
  );
}

export async function refreshDuplicatiVersions(
  options: { force?: boolean; trigger?: DuplicatiVersionRefreshTrigger } = {}
): Promise<DuplicatiVersionRefreshResult> {
  const force = options.force === true;
  const existingCache = getDuplicatiVersionCache();
  const staleMs = getDuplicatiVersionStaleMs(getDuplicatiVersionCheckConfig().interval);

  if (!force && !isDuplicatiVersionCacheStale(existingCache, staleMs)) {
    return {
      success: true,
      refreshed: false,
      message: 'Duplicati version cache is already up to date',
      cache: existingCache,
    };
  }

  const lock = new VersionRefreshLock();
  const lockAcquired = await lock.acquire();
  if (!lockAcquired) {
    const cache = getDuplicatiVersionCache();
    return {
      success: true,
      refreshed: false,
      message: 'Duplicati version refresh already running; using cached versions',
      cache,
    };
  }

  try {
    const cacheAfterLock = getDuplicatiVersionCache();
    if (!force && !isDuplicatiVersionCacheStale(cacheAfterLock, staleMs)) {
      return {
        success: true,
        refreshed: false,
        message: 'Duplicati version cache is already up to date',
        cache: cacheAfterLock,
      };
    }

    const cache = await fetchLatestDuplicatiVersions();
    setDuplicatiVersionCache(cache);

    const channelSummary = Object.entries(cache.channels)
      .filter(([, value]) => value !== null)
      .map(([channel, value]) => `${channel}=${value?.versionNumber}`)
      .join(', ');

    if (options.trigger) {
      await logDuplicatiVersionRefresh(options.trigger, 'success', {
        refreshed: true,
        updatedAt: cache.updatedAt,
        channels: channelVersionsForAudit(cache),
        message: `Updated Duplicati versions from GitHub (${channelSummary})`,
      });
    }

    return {
      success: true,
      refreshed: true,
      message: `Updated Duplicati versions from GitHub (${channelSummary})`,
      cache,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[DuplicatiVersion] Failed to refresh versions:', errorMessage);
    if (options.trigger) {
      await logDuplicatiVersionRefresh(options.trigger, 'error', {
        refreshed: false,
        channels: channelVersionsForAudit(existingCache),
        error: errorMessage,
      }, errorMessage);
    }
    return {
      success: false,
      refreshed: false,
      message: errorMessage,
      cache: existingCache,
    };
  } finally {
    lock.release();
  }
}

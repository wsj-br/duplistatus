import fs from 'fs';
import path from 'path';
import { getDuplicatiVersionCache, setDuplicatiVersionCache } from './db-utils';
import {
  isDuplicatiVersionCacheStale,
  parseDuplicatiReleaseTag,
  selectHighestChannelVersions,
} from './duplicati-version';
import { getDataDir } from './paths';
import type { DuplicatiVersionCache, DuplicatiVersionRefreshResult } from './types';

export const runtime = 'nodejs';

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/duplicati/duplicati/releases';
const GITHUB_PAGE_SIZE = 100;
const GITHUB_MAX_PAGES = 5;
const GITHUB_REQUEST_TIMEOUT_MS = 15000;
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

async function fetchGitHubReleasePage(page: number): Promise<GitHubRelease[]> {
  const url = `${GITHUB_RELEASES_URL}?per_page=${GITHUB_PAGE_SIZE}&page=${page}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'duplistatus',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`GitHub releases request failed with HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('GitHub releases response is not an array');
  }

  return payload.filter(isGitHubRelease);
}

async function fetchLatestDuplicatiVersions(): Promise<DuplicatiVersionCache> {
  const releases: Array<{ tagName: string; publishedAt: string | null }> = [];

  for (let page = 1; page <= GITHUB_MAX_PAGES; page += 1) {
    const items = await fetchGitHubReleasePage(page);
    if (items.length === 0) {
      break;
    }

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

    if (items.length < GITHUB_PAGE_SIZE) {
      break;
    }
  }

  const channels = selectHighestChannelVersions(releases);
  const hasAnyChannel = Object.values(channels).some((value) => value !== null);
  if (!hasAnyChannel) {
    throw new Error('No valid Duplicati channel releases were found');
  }

  return {
    updatedAt: new Date().toISOString(),
    source: 'github',
    channels,
  };
}

export async function refreshDuplicatiVersions(
  options: { force?: boolean } = {}
): Promise<DuplicatiVersionRefreshResult> {
  const force = options.force === true;
  const existingCache = getDuplicatiVersionCache();

  if (!force && !isDuplicatiVersionCacheStale(existingCache)) {
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
    if (!force && !isDuplicatiVersionCacheStale(cacheAfterLock)) {
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

    return {
      success: true,
      refreshed: true,
      message: `Updated Duplicati versions from GitHub (${channelSummary})`,
      cache,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[DuplicatiVersion] Failed to refresh versions:', errorMessage);
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

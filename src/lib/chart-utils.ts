import type { ChartDataPoint } from '@/lib/types';

/**
 * Maps a ChartTimeRange value to the bucket size in days to use for bar-chart / line-chart
 * time-bucket aggregation. Ensures max ~30 data points for readability.
 */
export function getBucketSizeDays(chartTimeRange: string): number {
  switch (chartTimeRange) {
    case '1 week':
      return 1;   // daily → max 7 points
    case '2 weeks':
      return 1;   // daily → max 14 points
    case '1 month':
      return 1;   // daily → max 31 points, but capped below
    case '3 months':
      return 3;   // 3-day → max ~30 points
    default:
      return 1;
  }
}

/**
 * Calculates the optimal bucket size to ensure max 30 data points.
 * This is a dynamic fallback when the preset bucket size would produce too many points.
 */
export function calculateOptimalBucketSize(daysInRange: number): number {
  if (daysInRange <= 30) {
    return 1; // Daily buckets for ranges up to 30 days
  }
  // For ranges > 30 days, calculate bucket size to get ~30 points
  return Math.ceil(daysInRange / 30);
}

/**
 * Converts chartTimeRange value to a display label.
 * This is the centralized mapping - used by both chart panels.
 */
export function getTimeRangeLabel(timeRange: string): string {
  switch (timeRange) {
    case '1 week':
      return 'Last week';
    case '2 weeks':
      return 'Last 2 weeks';
    case '1 month':
      return 'Last month';
    case '3 months':
      return 'Last quarter';
    default:
      return timeRange;
  }
}

/**
 * Gets the abbreviated label for time range buttons (e.g., '1W', '2W', '1M', '3M').
 * Used for compact time range selectors.
 */
export function getTimeRangeAbbreviation(timeRange: string): string {
  switch (timeRange) {
    case '1 week':
      return '1W';
    case '2 weeks':
      return '2W';
    case '1 month':
      return '1M';
    case '3 months':
      return '3M';
    default:
      return timeRange;
  }
}

/**
 * Type for all valid ChartTimeRange values.
 * Limited to 4 options for simplicity: 1W, 2W, 1M, 3M
 */
export type ChartTimeRangeValue = '1 week' | '2 weeks' | '1 month' | '3 months';

/**
 * All available time range options in order.
 */
export const CHART_TIME_RANGES: ChartTimeRangeValue[] = [
  '1 week',
  '2 weeks',
  '1 month',
  '3 months',
];

/**
 * Chart data point with nullable metric values, used internally for bucketed output.
 * The shape matches ChartDataPoint but all numeric fields can be null (empty bucket).
 */
export interface BucketedChartPoint {
  date: string;
  isoDate: string;
  uploadedSize: number | null;
  duration: number | null;
  fileCount: number | null;
  fileSize: number | null;
  storageSize: number | null;
  backupVersions: number | null;
}

/**
 * Aggregates an array of daily ChartDataPoints into time buckets.
 *
 * Aggregation rules per bucket:
 *  - uploadedSize, fileSize, duration, fileCount → SUM (totals over the period)
 *  - storageSize → last value in the bucket (state at end of period)
 *  - backupVersions → MAX (peak count seen)
 *  - Empty buckets → all metric fields are null (Recharts renders nothing)
 *
 * The input array must already be sorted by isoDate ascending (as returned by the APIs).
 * All data points are consolidated by calendar day (time component is ignored).
 *
 * @param data        Raw ChartDataPoint[] from the API (one point per calendar day)
 * @param bucketDays  Size of each time bucket in days
 * @returns           Array of BucketedChartPoints, one per bucket
 */
export function bucketChartData(
  data: ChartDataPoint[],
  bucketDays: number
): BucketedChartPoint[] {
  if (data.length === 0) return [];

  // First, consolidate all data points by calendar day (ignore time component)
  const dailyMap = new Map<string, ChartDataPoint[]>();
  
  for (const point of data) {
    // Extract just the date part (YYYY-MM-DD) to group by day
    const dayKey = point.isoDate.split('T')[0];
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, []);
    }
    dailyMap.get(dayKey)!.push(point);
  }
  
  // Aggregate points within each day
  const dailyData: ChartDataPoint[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, points]) => {
      // Sum cumulative metrics
      const uploadedSize = points.reduce((acc, p) => acc + p.uploadedSize, 0);
      const duration = points.reduce((acc, p) => acc + p.duration, 0);
      const fileCount = points.reduce((acc, p) => acc + p.fileCount, 0);
      const fileSize = points.reduce((acc, p) => acc + p.fileSize, 0);
      
      // Last value for storage size
      const sortedPoints = [...points].sort((a, b) => 
        new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime()
      );
      const storageSize = sortedPoints[sortedPoints.length - 1].storageSize;
      
      // Max for backup versions
      const backupVersions = Math.max(...points.map(p => p.backupVersions));
      
      return {
        date: dayKey,
        isoDate: dayKey,
        uploadedSize,
        duration,
        fileCount,
        fileSize,
        storageSize,
        backupVersions,
      };
    });

  // Use bucketDays=1 as a pass-through (no aggregation needed, just return daily data)
  if (bucketDays <= 1) {
    return dailyData.map(p => ({
      date: p.date,
      isoDate: p.isoDate,
      uploadedSize: p.uploadedSize,
      duration: p.duration,
      fileCount: p.fileCount,
      fileSize: p.fileSize,
      storageSize: p.storageSize,
      backupVersions: p.backupVersions,
    }));
  }

  // Determine the date span
  const firstDate = new Date(dailyData[0].isoDate);
  const lastDate = new Date(dailyData[dailyData.length - 1].isoDate);
  const daysSpan = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  
  // Ensure we don't exceed 30 points - adjust bucket size if needed
  const optimalBucketDays = Math.max(bucketDays, Math.ceil(daysSpan / 30));

  // Align the first bucket start to the first data point's date
  const bucketMs = optimalBucketDays * 24 * 60 * 60 * 1000;

  // Build bucket boundaries (start timestamps)
  const buckets: { startMs: number; endMs: number }[] = [];
  let cursor = firstDate.getTime();
  while (cursor <= lastDate.getTime()) {
    buckets.push({ startMs: cursor, endMs: cursor + bucketMs - 1 });
    cursor += bucketMs;
  }

  // Assign each data point to a bucket
  const bucketPoints: ChartDataPoint[][] = buckets.map(() => []);
  for (const point of dailyData) {
    const pointMs = new Date(point.isoDate).getTime();
    const bucketIndex = Math.floor((pointMs - firstDate.getTime()) / bucketMs);
    const clampedIndex = Math.min(bucketIndex, buckets.length - 1);
    if (clampedIndex >= 0) {
      bucketPoints[clampedIndex].push(point);
    }
  }

  // Aggregate each bucket
  return buckets.map((bucket, i) => {
    const points = bucketPoints[i];
    const bucketStartDate = new Date(bucket.startMs);
    const isoDate = bucketStartDate.toISOString().split('T')[0];
    // Simple display label: YYYY-MM-DD of bucket start
    const date = isoDate;

    if (points.length === 0) {
      return {
        date,
        isoDate,
        uploadedSize: null,
        duration: null,
        fileCount: null,
        fileSize: null,
        storageSize: null,
        backupVersions: null,
      };
    }

    // SUM for cumulative metrics
    const uploadedSize = points.reduce((acc, p) => acc + p.uploadedSize, 0);
    const duration = points.reduce((acc, p) => acc + p.duration, 0);
    const fileCount = points.reduce((acc, p) => acc + p.fileCount, 0);
    const fileSize = points.reduce((acc, p) => acc + p.fileSize, 0);

    // LAST VALUE for storageSize (state at end of period)
    const storageSize = points[points.length - 1].storageSize;

    // MAX for backupVersions
    const backupVersions = Math.max(...points.map(p => p.backupVersions));

    return {
      date,
      isoDate,
      uploadedSize,
      duration,
      fileCount,
      fileSize,
      storageSize,
      backupVersions,
    };
  });
}

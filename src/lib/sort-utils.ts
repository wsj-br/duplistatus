import type { BackupStatus, NotificationEvent } from "./types";

export type SortDirection = 'asc' | 'desc';
export type SortColumn = string;

export interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

// Parse duration string (e.g., "30m 15s", "1h 5m 30s", "01:23:45") to seconds for comparison
export function parseDurationToSeconds(duration: string): number {
  if (!duration || duration === "N/A") return 0;
  
  // Handle HH:MM:SS format (e.g., "01:23:45")
  if (duration.includes(':')) {
    const parts = duration.split(':').map(part => parseInt(part) || 0);
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    }
    if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    }
  }
  
  // Handle space-separated format (e.g., "30m 15s", "1h 5m 30s")
  let totalSeconds = 0;
  const parts = duration.split(' ');
  
  for (const part of parts) {
    if (part.endsWith('h')) {
      totalSeconds += parseInt(part) * 3600;
    } else if (part.endsWith('m')) {
      totalSeconds += parseInt(part) * 60;
    } else if (part.endsWith('s')) {
      totalSeconds += parseInt(part);
    }
  }
  
  return totalSeconds;
}

// Status ordering: Failed/Error -> Warning -> Success
export function getStatusSortValue(status: BackupStatus | 'N/A'): number {
  const statusOrder: Record<string, number> = {
    'Success': 5,
    'Warning': 4,
    'Unknown': 3,
    'Error': 2,
    'Fatal': 1,
  };
  return statusOrder[status] ?? 3;
}

// Notification event ordering: Off -> All -> Warnings -> Errors
export function getNotificationEventSortValue(event: NotificationEvent): number {
  const eventOrder: Record<NotificationEvent, number> = {
    'off': 0,
    'all': 1,
    'warnings': 2,
    'errors': 3,
  };
  return eventOrder[event] ?? 0;
}

// Generic sort functions for different data types
export const sortFunctions = {
  text: (a: string, b: string): number => {
    const aVal = a?.toString().toLowerCase() ?? '';
    const bVal = b?.toString().toLowerCase() ?? '';
    return aVal.localeCompare(bVal);
  },

  number: (a: number | null, b: number | null): number => {
    // Handle null values - put them at the end
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
  },

  date: (a: string, b: string): number => {
    if (a === "N/A" && b === "N/A") return 0;
    if (a === "N/A") return 1;
    if (b === "N/A") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  },

  status: (a: BackupStatus | 'N/A', b: BackupStatus | 'N/A'): number => {
    return getStatusSortValue(a) - getStatusSortValue(b);
  },

  duration: (a: string, b: string): number => {
    return parseDurationToSeconds(a) - parseDurationToSeconds(b);
  },

  notificationEvent: (a: NotificationEvent, b: NotificationEvent): number => {
    return getNotificationEventSortValue(a) - getNotificationEventSortValue(b);
  },

  serverUrl: (a: string, b: string): number => {
    const aEmpty = !a || a.trim() === '';
    const bEmpty = !b || b.trim() === '';
    
    // Empty URLs come first
    if (aEmpty && !bEmpty) return -1;
    if (!aEmpty && bEmpty) return 1;
    if (aEmpty && bEmpty) return 0;
    
    // If both are non-empty, sort alphabetically
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }
};

// Helper function to get the appropriate sort function based on column type
export function getSortFunction(columnType: keyof typeof sortFunctions) {
  return sortFunctions[columnType] || sortFunctions.text;
}

// Helper function to safely get a value from an object by path
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

// Create a generic sort function that can be used by both tables
export function createSortedArray<T>(
  array: T[],
  sortConfig: SortConfig,
  columnConfig: Record<string, { type: keyof typeof sortFunctions; path: string }>
): T[] {
  if (!sortConfig.column || !columnConfig[sortConfig.column]) {
    return array;
  }

  const { type, path } = columnConfig[sortConfig.column];
  const sortFn = getSortFunction(type);

  const sorted = [...array].sort((a, b) => {
    const aValue = getNestedValue(a as Record<string, unknown>, path);
    const bValue = getNestedValue(b as Record<string, unknown>, path);
    
    // Type assertion for the sort function call
    const typedSortFn = sortFn as (a: unknown, b: unknown) => number;
    const result = typedSortFn(aValue, bValue);
    return sortConfig.direction === 'desc' ? -result : result;
  });

  return sorted;
} 
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: unknown, decimals = 2): string {
  // Handle all possible invalid inputs
  if (bytes === null || bytes === undefined) return '0 Bytes';
  
  let numBytes: number;
  
  if (typeof bytes === 'number') {
    numBytes = bytes;
  } else if (typeof bytes === 'string') {
    try {
      numBytes = Number(bytes);
    } catch (e) {
      return '0 Bytes';
    }
  } else {
    return '0 Bytes';
  }
  
  if (isNaN(numBytes) || !isFinite(numBytes) || numBytes <= 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(numBytes) / Math.log(k));

  return parseFloat((numBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDurationFromMinutes(totalMinutes: unknown): string {
  // Handle all possible invalid inputs
  if (totalMinutes === null || totalMinutes === undefined) return "00:00:00";
  
  let numMinutes: number;
  
  if (typeof totalMinutes === 'number') {
    numMinutes = totalMinutes;
  } else if (typeof totalMinutes === 'string') {
    try {
      numMinutes = Number(totalMinutes);
    } catch (e) {
      return "00:00:00";
    }
  } else {
    return "00:00:00";
  }
  
  if (isNaN(numMinutes) || numMinutes < 0 || !isFinite(numMinutes)) return "00:00:00";
  if (numMinutes === 0) return "00:00:00";

  const hours = Math.floor(numMinutes / 60);
  const minutes = Math.floor(numMinutes % 60);
  // Calculate seconds from the fractional part of totalMinutes
  const seconds = Math.round((numMinutes * 60) % 60);

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

export function formatTimeAgo(dateString: string): string {
  if (!dateString || dateString === "N/A") return "";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return ""; 
    }

    // Use a fixed reference time (server-side) to avoid hydration mismatches
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) {
      return "in the future";
    }

    if (diffInSeconds < 60) {
      return "just now";
    }

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }

    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    }

    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  } catch (error) {
    return "";
  }
}

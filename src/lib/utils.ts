import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  if (isNaN(bytes) || !isFinite(bytes)) return 'N/A';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDurationFromMinutes(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes < 0 || !isFinite(totalMinutes)) return "N/A";
  if (totalMinutes === 0) return "00:00:00";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  // Calculate seconds from the fractional part of totalMinutes
  const seconds = Math.round((totalMinutes * 60) % 60);

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
      // Check if the date is valid using isValid from date-fns
      return ""; 
    }
    // Ensure the date is in the past, otherwise formatDistanceToNow might say "in X minutes"
    if (date > new Date()) {
        return "in the future"; 
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    // console.error("Error formatting time ago for date:", dateString, error);
    return ""; // Return empty string or some indicator of error
  }
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, isValid } from 'date-fns';

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
    } catch {
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
    } catch {
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

    // Calculate years and remaining months for periods longer than 1 year
    const years = Math.floor(diffInSeconds / 31536000);
    const remainingSeconds = diffInSeconds % 31536000;
    const months = Math.floor(remainingSeconds / 2592000);
    
    if (months === 0) {
      return `${years} year${years === 1 ? '' : 's'} ago`;
    } else {
      return `${years} year${years === 1 ? '' : 's'} and ${months} month${months === 1 ? '' : 's'} ago`;
    }
  } catch {
    return "";
  }
}

// Function to convert timestamp from Duplicati format to ISO format
export function convertTimestampToISO(timestamp: string): string {
  try {
    // Handle various timestamp formats that might come from Duplicati
    // Expected format: "14/07/2025 00:05:06" or similar
    const cleanTimestamp = timestamp.trim();
    
    // Try to parse DD/MM/YYYY HH:mm:ss format - be strict about this format
    const match = cleanTimestamp.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
      const [, day, month, year, hour, minute, second] = match;
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      const secondNum = parseInt(second);
      
      // Validate ranges
      if (dayNum < 1 || dayNum > 31 || 
          monthNum < 1 || monthNum > 12 || 
          yearNum < 1900 || yearNum > 2100 ||
          hourNum < 0 || hourNum > 23 ||
          minuteNum < 0 || minuteNum > 59 ||
          secondNum < 0 || secondNum > 59) {
        console.warn(`Invalid timestamp values: ${timestamp}`);
        return '';
      }
      
      const date = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum, secondNum);
      
      // Additional validation - check if the date is valid
      if (date.getFullYear() !== yearNum || 
          date.getMonth() !== monthNum - 1 || 
          date.getDate() !== dayNum) {
        console.warn(`Invalid date constructed from timestamp: ${timestamp}`);
        return '';
      }
      
      return date.toISOString();
    }
    
    console.warn(`Timestamp format not recognized: ${timestamp}`);
    return '';
  } catch (error) {
    console.warn(`Error converting timestamp ${timestamp}:`, error);
    return '';
  }
}

// Helper function to extract from plain text (non-JSON strings)
function extractFromPlainText(text: string): string[] {
  let backupsToConsider: string[] = [];
  let backupsToDelete: string[] = [];
  
  // Split by lines and process each line
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (typeof line !== 'string') continue;
    
    if (line.includes("Backups to consider:")) {
      const timestampsStr = line.split("Backups to consider:")[1]?.trim();
      if (timestampsStr) {
        backupsToConsider = timestampsStr.split(",")
          .map(ts => ts.trim())
          .filter(ts => ts.length > 0)
          .map(convertTimestampToISO)
          .filter(ts => ts.length > 0);
      }
    }
    
    if (line.includes("All backups to delete:")) {
      const timestampsStr = line.split("All backups to delete:")[1]?.trim();
      if (timestampsStr) {
        backupsToDelete = timestampsStr.split(",")
          .map(ts => ts.trim())
          .filter(ts => ts.length > 0)
          .map(convertTimestampToISO)
          .filter(ts => ts.length > 0);
      }
    }
  }
  
  if (backupsToConsider.length === 0) return [];
  
  // Filter out backups to delete
  return backupsToConsider.filter(backup => !backupsToDelete.includes(backup));
}

// Function to extract available backups from message array
export function extractAvailableBackups(messagesArray: string | null): string[] {
  if (!messagesArray) return [];
  
  // Trim whitespace and check for empty strings
  const cleanedMessages = messagesArray.trim();
  if (cleanedMessages.length === 0) return [];
  
  let messages: unknown;
  
  try {
    messages = JSON.parse(cleanedMessages);
  } catch (jsonError) {
    // If JSON parsing fails, try to handle as plain text
    console.warn('Messages array is not valid JSON, attempting to parse as plain text:', jsonError instanceof Error ? jsonError.message : 'Unknown error');
    
    // Try to extract directly from the string if it contains the target lines
    if (typeof cleanedMessages === 'string') {
      return extractFromPlainText(cleanedMessages);
    }
    
    return [];
  }
  
  // Handle case where JSON was parsed but result is not an array
  if (!Array.isArray(messages)) {
    console.warn('Parsed messages is not an array, got:', typeof messages);
    
    // If it's a string, try to extract from it
    if (typeof messages === 'string') {
      return extractFromPlainText(messages);
    }
    
    return [];
  }
  
  let backupsToConsider: string[] = [];
  let backupsToDelete: string[] = [];
  
  for (const message of messages) {
    // Skip non-string elements
    if (typeof message !== 'string') {
      console.warn('Skipping non-string message element:', typeof message);
      continue;
    }
    
    if (message.includes("Backups to consider:")) {
      const timestampsStr = message.split("Backups to consider:")[1]?.trim();
      if (timestampsStr) {
        backupsToConsider = timestampsStr.split(",")
          .map(ts => ts.trim())
          .filter(ts => ts.length > 0)
          .map(convertTimestampToISO)
          .filter(ts => ts.length > 0);
      }
    }
    
    if (message.includes("All backups to delete:")) {
      const timestampsStr = message.split("All backups to delete:")[1]?.trim();
      if (timestampsStr) {
        backupsToDelete = timestampsStr.split(",")
          .map(ts => ts.trim())
          .filter(ts => ts.length > 0)
          .map(convertTimestampToISO)
          .filter(ts => ts.length > 0);
      }
    }
  }
  
  if (backupsToConsider.length === 0) return [];
  
  // Filter out backups to delete
  return backupsToConsider.filter(backup => !backupsToDelete.includes(backup));
}

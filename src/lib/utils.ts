import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes conditionally using clsx and tailwind-merge
 * @param {...ClassValue[]} inputs - Class names or conditional class objects
 * @returns {string} Merged and deduplicated class string
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'rounded')
 * // Returns: "px-2 py-1 bg-blue-500 rounded"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into a human-readable string with month, day, year, hour, and minute
 * @param {Date | string | any} date - Date object, string, or Firestore timestamp
 * @returns {string} Formatted date string (e.g., "Jan 15, 2024, 02:30 PM")
 * Returns empty string if date is falsy
 * @example
 * formatDate(new Date()) // "May 10, 2026, 03:45 PM"
 * formatDate(firebaseTimestamp) // "May 10, 2026, 03:45 PM"
 */
export function formatDate(date: any) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

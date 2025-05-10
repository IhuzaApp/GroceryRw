/**
 * Format timestamp to display date as "Today", "Yesterday", or date
 * @param timestamp ISO string timestamp
 * @returns Formatted date string
 */
export function formatMessageDate(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

/**
 * Format timestamp to display time as HH:MM
 * @param timestamp ISO string timestamp
 * @returns Formatted time string
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Check if user is on mobile device based on screen width
 * @returns boolean indicating if user is on mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
} 
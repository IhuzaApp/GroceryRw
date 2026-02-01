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
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
const DAY_SHORT: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

/**
 * Format operating_hours object to readable string (e.g. "Mon - Sat: 9am - 5pm").
 * Excludes closed days. Groups consecutive days with same hours.
 */
export function formatOperatingDays(operating_hours: Record<string, string> | null | undefined): string | null {
  if (!operating_hours || typeof operating_hours !== "object") return null;

  const openEntries = DAY_ORDER.filter(
    (d) => operating_hours[d] && String(operating_hours[d]).toLowerCase() !== "closed"
  ).map((d) => ({ day: d, hours: operating_hours[d] }));

  if (openEntries.length === 0) return null;

  const groups: { days: string[]; hours: string }[] = [];
  let current = { days: [openEntries[0].day], hours: openEntries[0].hours };

  for (let i = 1; i < openEntries.length; i++) {
    const idx = DAY_ORDER.indexOf(openEntries[i].day as typeof DAY_ORDER[number]);
    const prevIdx = DAY_ORDER.indexOf(current.days[current.days.length - 1] as typeof DAY_ORDER[number]);
    const isConsecutive = idx === prevIdx + 1;
    const sameHours = openEntries[i].hours === current.hours;

    if (sameHours && isConsecutive) {
      current.days.push(openEntries[i].day);
    } else {
      groups.push(current);
      current = { days: [openEntries[i].day], hours: openEntries[i].hours };
    }
  }
  groups.push(current);

  return groups
    .map((g) => {
      const dayStr =
        g.days.length > 1
          ? `${DAY_SHORT[g.days[0]]} - ${DAY_SHORT[g.days[g.days.length - 1]]}`
          : DAY_SHORT[g.days[0]];
      return `${dayStr}: ${g.hours}`;
    })
    .join(", ");
}

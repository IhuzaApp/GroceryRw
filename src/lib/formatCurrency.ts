export function formatCurrency(
  value: number,
  showCurrency: boolean = true
): string {
  // Use a consistent format that doesn't depend on locale settings
  // This ensures server and client render the same output
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Force the same formatting on both server and client
  const formattedNumber = formatter.format(value);

  return showCurrency ? `RWF ${formattedNumber}` : formattedNumber;
}

/**
 * Format currency in a compact way, e.g., "3k RWF" for 3000
 * For values below 1000, shows the full value, e.g., "100 RWF"
 */
export function formatCompactCurrency(value: number): string {
  if (value === 0) return "0 RWF";

  if (value < 1000) {
    return `${value} RWF`;
  }

  // For values 1000 and above, show as 'k'
  const valueInK = Math.round(value / 100) / 10; // Round to 1 decimal place

  // Remove decimal if it's .0
  const displayValue = valueInK.toFixed(1).replace(/\.0$/, "");

  return `${displayValue}k RWF`;
}

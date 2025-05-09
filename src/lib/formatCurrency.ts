export function formatCurrency(value: number): string {
  // Use a consistent format that doesn't depend on locale settings
  // This ensures server and client render the same output
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Force the same formatting on both server and client
  const formattedNumber = formatter.format(value);
  
  return `RWF ${formattedNumber}`;
}

export function formatCurrency(value: number): string {
  // Format number with no fractional digits, then prefix the currency code
  const formattedNumber = new Intl.NumberFormat("rw-RW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `RWF ${formattedNumber}`;
}

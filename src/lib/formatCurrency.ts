export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(value);
} 
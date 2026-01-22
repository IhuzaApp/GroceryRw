import { useState, useEffect } from 'react';

export function useTaxRate() {
  const [taxRate, setTaxRate] = useState<number>(0.18); // Default to 18%
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/queries/system-configuration', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.config && data.config.tax) {
          // Convert percentage string to decimal (e.g., "18" -> 0.18)
          const rate = parseFloat(data.config.tax) / 100;
          setTaxRate(isNaN(rate) ? 0.18 : rate);
        } else {
          // Use default if not found
          setTaxRate(0.18);
        }
      } catch (err) {
        console.error('Error fetching tax rate:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep default tax rate on error
        setTaxRate(0.18);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxRate();
  }, []);

  return { taxRate, loading, error };
}
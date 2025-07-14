// Cache for system configuration
let systemConfigCache: { currency: string } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch system configuration
async function getSystemConfiguration() {
  const now = Date.now();

  // Return cached config if still valid
  if (systemConfigCache && now - cacheTimestamp < CACHE_DURATION) {
    return systemConfigCache;
  }

  try {
    const response = await fetch("/api/queries/system-configuration");
    const data = await response.json();

    if (data.success && data.config) {
      systemConfigCache = {
        currency: data.config.currency || "RWF", // Default to RWF if not configured
      };
      cacheTimestamp = now;
      return systemConfigCache;
    }
  } catch (error) {
    console.warn(
      "Failed to fetch system configuration, using default currency:",
      error
    );
  }

  // Return default if fetch fails
  return { currency: "RWF" };
}

// Dynamic currency formatter
export const formatCurrency = async (amount: string | number) => {
  const config = await getSystemConfiguration();
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

// Synchronous version for immediate use (uses cached config or default)
export const formatCurrencySync = (amount: string | number) => {
  const config = systemConfigCache || { currency: "RWF" };
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

// Legacy function for backward compatibility
export const formatRWF = (amount: string | number) => {
  return formatCurrencySync(amount);
};

// Function to get just the currency symbol
export const getCurrencySymbol = () => {
  const config = systemConfigCache || { currency: "RWF" };
  return config.currency;
};

// Function to refresh the cache
export const refreshCurrencyCache = () => {
  systemConfigCache = null;
  cacheTimestamp = 0;
};

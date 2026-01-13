import Redis from "ioredis";

// ============================================================================
// REDIS CLIENT FOR LOCATION & ONLINE STATUS
// ============================================================================
// Purpose: Store volatile, high-frequency data
// - Shopper GPS locations (TTL: 30-45s)
// - Online status (TTL-based)
// - Temporary state
//
// Database (Postgres/Hasura) remains source of truth for:
// - Orders, order_offers, assignments
// ============================================================================

let redis: Redis | null = null;
let hasLoggedError = false; // Track if we've already logged an error

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Initialize Redis client
export const getRedisClient = (): Redis | null => {
  if (redis) {
    return redis;
  }

  try {
    // IORedis accepts connection string or config object
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts to avoid spam
        if (times > 3) {
          if (!hasLoggedError) {
            console.warn("⚠️ Redis connection failed after 3 attempts. Running in degraded mode.");
            hasLoggedError = true;
          }
          return null; // Stop retrying
        }
        const delay = Math.min(times * 1000, 3000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      lazyConnect: true,
      enableOfflineQueue: false, // Don't queue commands when offline
      tls: REDIS_URL.includes('cloud.redislabs.com') 
        ? { rejectUnauthorized: false } // Enable TLS for Redis Cloud
        : undefined,
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected successfully");
      hasLoggedError = false; // Reset flag on successful connection
    });

    redis.on("error", (err) => {
      // Only log once to avoid spam
      if (!hasLoggedError) {
        console.warn("⚠️ Redis unavailable:", err.message);
        console.warn("   System will work in degraded mode (no location tracking)");
        hasLoggedError = true;
      }
    });

    redis.on("close", () => {
      // Silent - don't spam logs
    });

    // Connect immediately
    redis.connect().catch((err) => {
      console.error("❌ Failed to connect to Redis:", err.message);
      redis = null;
    });

    return redis;
  } catch (error) {
    console.error("❌ Failed to initialize Redis:", error);
    return null;
  }
};

// ============================================================================
// LOCATION STORAGE
// ============================================================================

export interface ShopperLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: number;
}

const LOCATION_KEY_PREFIX = "shopper:location:";
const LOCATION_TTL = 45; // 45 seconds - if not updated, shopper is offline

/**
 * Store shopper location (volatile, high-frequency)
 */
export const setShopperLocation = async (
  shopperId: string,
  location: ShopperLocation
): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, skipping location storage");
      return false;
    }

    const key = `${LOCATION_KEY_PREFIX}${shopperId}`;
    const value = JSON.stringify({
      ...location,
      updatedAt: Date.now(),
    });

    await client.setex(key, LOCATION_TTL, value);
    return true;
  } catch (error) {
    console.error("❌ Error storing location in Redis:", error);
    return false;
  }
};

/**
 * Get shopper location (returns null if TTL expired = offline)
 */
export const getShopperLocation = async (
  shopperId: string
): Promise<ShopperLocation | null> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return null;
    }

    const key = `${LOCATION_KEY_PREFIX}${shopperId}`;
    const value = await client.get(key);

    if (!value) {
      return null; // TTL expired or never set
    }

    return JSON.parse(value) as ShopperLocation;
  } catch (error) {
    console.error("❌ Error getting location from Redis:", error);
    return null;
  }
};

/**
 * Get multiple shopper locations (bulk operation)
 */
export const getMultipleShopperLocations = async (
  shopperIds: string[]
): Promise<Map<string, ShopperLocation>> => {
  const locations = new Map<string, ShopperLocation>();

  try {
    const client = getRedisClient();
    if (!client || shopperIds.length === 0) {
      return locations;
    }

    const keys = shopperIds.map((id) => `${LOCATION_KEY_PREFIX}${id}`);
    const values = await client.mget(...keys);

    values.forEach((value, index) => {
      if (value) {
        try {
          const location = JSON.parse(value) as ShopperLocation;
          locations.set(shopperIds[index], location);
        } catch (error) {
          console.error(
            `Error parsing location for shopper ${shopperIds[index]}`
          );
        }
      }
    });

    return locations;
  } catch (error) {
    console.error("❌ Error getting multiple locations from Redis:", error);
    return locations;
  }
};

/**
 * Check if shopper is online (has fresh location)
 */
export const isShopperOnline = async (
  shopperId: string
): Promise<boolean> => {
  const location = await getShopperLocation(shopperId);
  if (!location) {
    return false;
  }

  // Check if location is fresh (within last 30 seconds)
  const ageSeconds = (Date.now() - location.updatedAt) / 1000;
  return ageSeconds < 30;
};

/**
 * Get all online shoppers (shoppers with fresh locations)
 */
export const getOnlineShoppers = async (): Promise<string[]> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return [];
    }

    const pattern = `${LOCATION_KEY_PREFIX}*`;
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      return [];
    }

    // Extract shopper IDs from keys
    const shopperIds = keys.map((key) =>
      key.replace(LOCATION_KEY_PREFIX, "")
    );

    // Filter to only those with fresh locations
    const onlineShoppers: string[] = [];
    for (const shopperId of shopperIds) {
      if (await isShopperOnline(shopperId)) {
        onlineShoppers.push(shopperId);
      }
    }

    return onlineShoppers;
  } catch (error) {
    console.error("❌ Error getting online shoppers:", error);
    return [];
  }
};

/**
 * Remove shopper location (e.g., when they go offline)
 */
export const removeShopperLocation = async (
  shopperId: string
): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    const key = `${LOCATION_KEY_PREFIX}${shopperId}`;
    await client.del(key);
    return true;
  } catch (error) {
    console.error("❌ Error removing location from Redis:", error);
    return false;
  }
};

// ============================================================================
// OFFER SKIP LOGGING (for debugging & fairness audits)
// ============================================================================

const SKIP_LOG_PREFIX = "offer:skip:";
const SKIP_LOG_TTL = 86400; // 24 hours

export interface OfferSkipLog {
  orderId: string;
  shopperId: string;
  reason: string;
  distance?: number;
  round?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Log when a shopper is skipped for an offer
 */
export const logOfferSkip = async (log: OfferSkipLog): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client) {
      // Fallback to console logging if Redis unavailable
      console.log("📝 OFFER_SKIP:", JSON.stringify(log));
      return;
    }

    const key = `${SKIP_LOG_PREFIX}${log.orderId}:${log.shopperId}:${Date.now()}`;
    const value = JSON.stringify({
      ...log,
      timestamp: Date.now(),
    });

    await client.setex(key, SKIP_LOG_TTL, value);
  } catch (error) {
    console.error("❌ Error logging skip:", error);
    // Fallback to console
    console.log("📝 OFFER_SKIP (fallback):", JSON.stringify(log));
  }
};

/**
 * Get skip logs for an order (for debugging)
 */
export const getOrderSkipLogs = async (
  orderId: string
): Promise<OfferSkipLog[]> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return [];
    }

    const pattern = `${SKIP_LOG_PREFIX}${orderId}:*`;
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      return [];
    }

    const values = await client.mget(...keys);
    const logs: OfferSkipLog[] = [];

    values.forEach((value) => {
      if (value) {
        try {
          logs.push(JSON.parse(value) as OfferSkipLog);
        } catch (error) {
          console.error("Error parsing skip log");
        }
      }
    });

    return logs.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error("❌ Error getting skip logs:", error);
    return [];
  }
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const checkRedisHealth = async (): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return { connected: false, error: "Client not initialized" };
    }

    const start = Date.now();
    await client.ping();
    const latency = Date.now() - start;

    return { connected: true, latency };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Export singleton
export default getRedisClient;

import { useEffect, useRef } from "react";

/**
 * Custom hook to manage Screen Wake Lock API
 * Prevents the screen from turning off when the shopper is active
 * 
 * @param enabled - Whether the wake lock should be active
 */
export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Check if Wake Lock API is supported
    if (!("wakeLock" in navigator)) {
      // Wake Lock API not supported - silently fail
      // This is expected on some browsers/devices
      return;
    }

    const acquireWakeLock = async () => {
      try {
        // Request wake lock
        const wakeLock = await (navigator as any).wakeLock.request("screen");
        wakeLockRef.current = wakeLock;

        // Handle wake lock release (e.g., when user switches tabs or locks screen)
        wakeLock.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      } catch (err) {
        // Wake lock request failed - this can happen if:
        // - User denied permission
        // - Device doesn't support wake lock
        // - Wake lock is already active
        // Silently handle - this is not critical for app functionality
        wakeLockRef.current = null;
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          // Wake lock was already released
          wakeLockRef.current = null;
        }
      }
    };

    if (enabled) {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }

    // Cleanup on unmount or when enabled changes
    return () => {
      releaseWakeLock();
    };
  }, [enabled]);

  // Re-acquire wake lock if it was released (e.g., user switched tabs and came back)
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (!("wakeLock" in navigator)) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        try {
          const wakeLock = await (navigator as any).wakeLock.request("screen");
          wakeLockRef.current = wakeLock;

          wakeLock.addEventListener("release", () => {
            wakeLockRef.current = null;
          });
        } catch (err) {
          // Silently handle errors
          wakeLockRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);
}

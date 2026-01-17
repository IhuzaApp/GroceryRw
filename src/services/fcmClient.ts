import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
  idbAddNotification,
  idbClearNotifications,
  idbGetAllNotifications,
  type StoredNotification,
} from "./fcmNotificationStore";

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is valid
const hasValidFirebaseConfig = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Initialize Firebase with proper guards
let app;
try {
  if (!hasValidFirebaseConfig()) {
    app = null;
  } else {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
} catch (error) {
  app = null;
}
const db = app ? getFirestore(app) : null;

// Initialize messaging only in browser environment
let messaging: any = null;
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
let isRegisteringServiceWorker = false;
let registrationPromise: Promise<ServiceWorkerRegistration | null> | null =
  null;

if (typeof window !== "undefined" && app) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
  }
}

// ---- Global FCM singleton (prevents duplicate listeners across multiple hooks/components) ----
type FCMMessageCallback = (payload: any) => void;
const fcmMessageSubscribers = new Set<FCMMessageCallback>();
let fcmStartedForUserId: string | null = null;
let fcmStartPromise: Promise<boolean> | null = null;
let fcmUnsubscribeCore: (() => void) | null = null;

const dispatchToSubscribers = (payload: any) => {
  // Copy into array to avoid mutation issues during iteration
  const callbacks = Array.from(fcmMessageSubscribers);
  for (const cb of callbacks) {
    try {
      cb(payload);
    } catch (e) {
      // Never let a consumer break global dispatch
    }
  }
};

const stopFCMCore = () => {
  try {
    fcmUnsubscribeCore?.();
  } catch {
    // ignore
  }
  fcmUnsubscribeCore = null;
  fcmStartedForUserId = null;
};

const ensureFCMCoreStarted = async (userId: string): Promise<boolean> => {
  // If already running for this user, we're good.
  if (fcmUnsubscribeCore && fcmStartedForUserId === userId) return true;

  // If running for a different user, stop and restart.
  if (fcmUnsubscribeCore && fcmStartedForUserId && fcmStartedForUserId !== userId) {
    stopFCMCore();
  }

  // If a start is already in-flight, await it.
  if (fcmStartPromise) return fcmStartPromise;

  fcmStartPromise = (async () => {
    const token = await getFCMToken();
    if (!token) return false;

    await saveFCMTokenToServer(userId, token);

    const unsubscribeListener = setupFCMListener(dispatchToSubscribers);
    // Pull in any notifications received while the app was closed/backgrounded
    await syncStoredNotificationsToLocalStorage();
    // Bridge SW->page messages for instant in-app updates
    const unsubscribeBridge = setupServiceWorkerFCMBridge(dispatchToSubscribers);

    fcmUnsubscribeCore = () => {
      try {
        unsubscribeBridge();
      } catch {
        // ignore
      }
      unsubscribeListener();
    };
    fcmStartedForUserId = userId;
    return true;
  })()
    .catch((error) => {
      return false;
    })
    .finally(() => {
      fcmStartPromise = null;
    });

  const ok = await fcmStartPromise;
  if (!ok) stopFCMCore();
  return ok;
};

export interface FCMTokenData {
  userId: string;
  token: string;
  platform: "web" | "android" | "ios";
  createdAt: Date;
  lastUsed: Date;
}

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!("Notification" in window)) {
      return false;
    }

    // Check if in incognito mode (Chrome)
    if (window.navigator.userAgent.includes("Chrome")) {
      try {
        // Try to access indexedDB - it's restricted in incognito mode
        await new Promise((resolve, reject) => {
          const request = indexedDB.open("test");
          request.onerror = () => reject("IndexedDB not available");
          request.onsuccess = () => {
            request.result.close();
            resolve(true);
          };
        });
      } catch (error) {
        return false;
      }
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    return false;
  }
};

/**
 * Register service worker once and reuse (SINGLETON PATTERN)
 */
const getServiceWorkerRegistration =
  async (): Promise<ServiceWorkerRegistration | null> => {
    // If already registered, return cached registration
    if (serviceWorkerRegistration) {
      return serviceWorkerRegistration;
    }

    // If currently registering, wait for that promise
    if (isRegisteringServiceWorker && registrationPromise) {
      return registrationPromise;
    }

    // Start new registration
    if ("serviceWorker" in navigator) {
      isRegisteringServiceWorker = true;
      registrationPromise = (async () => {
        try {
          // Use dynamic SW so it can embed Firebase config from env vars.
          // (public/firebase-messaging-sw.js cannot read env and was configured as {}.)
          const registration = await navigator.serviceWorker.register(
            "/api/fcm/firebase-messaging-sw",
            {
              scope: "/",
            }
          );
          await navigator.serviceWorker.ready;
          serviceWorkerRegistration = registration;
          return registration;
        } catch (error) {
          console.error("Service worker registration failed:", error);
          return null;
        } finally {
          isRegisteringServiceWorker = false;
        }
      })();

      return registrationPromise;
    }

    return null;
  };

/**
 * Get FCM token for the current user
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      return null;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    // Use singleton service worker registration
    const swRegistration = await getServiceWorkerRegistration();
    if (!swRegistration) {
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BHlNUbElLjZwdCrqi9LxcPStpMhVtwpf1HRRUJA-iP1eqiXERJWSibJCiPwLJuOBOjRPT70RJL5n64EZxJgQfr4",
    });

    if (!token) {
      return null;
    }

    return token;
  } catch (error) {
    // Silent fail with debug info
    return null;
  }
};

/**
 * Save FCM token to server
 */
export const saveFCMTokenToServer = async (
  userId: string,
  token: string,
  platform: "web" | "android" | "ios" = "web"
): Promise<void> => {
  try {
    const response = await fetch("/api/fcm/save-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        token,
        platform,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save token: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Remove FCM token from server
 */
export const removeFCMTokenFromServer = async (
  token: string
): Promise<void> => {
  try {
    const response = await fetch("/api/fcm/remove-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove token: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Set up FCM message listener
 */
export const setupFCMListener = (
  onMessageReceived: (payload: any) => void
): (() => void) => {
  try {
    if (!messaging) {
      return () => {};
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      // Show notification using service worker (Chrome requires this)
      if (payload.notification && Notification.permission === "granted") {
        const notificationType = payload.data?.type || "message";
        const notificationTitle =
          payload.notification.title || "New Notification";
        const notificationBody = payload.notification.body;

        // Method 1: Try direct Notification API first (works in Safari, sometimes Chrome)
        try {
          const directNotif = new Notification(notificationTitle, {
            body: notificationBody,
            icon: "/assets/logos/PlasIcon.png",
            tag: `fcm-${notificationType}-${Date.now()}`,
            requireInteraction: true,
            silent: false,
            vibrate: [200, 100, 200],
            data: payload.data,
          });

          directNotif.onclick = () => {
            window.focus();
            if (
              notificationType === "new_order" ||
              notificationType === "batch_orders"
            ) {
              window.location.href = "/Plasa/active-batches";
            }
            directNotif.close();
          };
        } catch (directError) {
          // Silent fail, service worker method will handle it
        }

        // Method 2: Also try service worker method (Chrome prefers this)
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready
            .then((registration) => {
              const notificationOptions = {
                body: notificationBody,
                icon: "/assets/logos/PlasIcon.png",
                badge: "/assets/logos/PlasIcon.png",
                tag: `fcm-sw-${notificationType}-${Date.now()}`,
                requireInteraction: true,
                silent: false,
                vibrate: [200, 100, 200],
                data: payload.data,
                renotify: true,
                timestamp: Date.now(),
                actions: [
                  { action: "view", title: "View" },
                  { action: "close", title: "Close" },
                ],
              };

              return registration.showNotification(
                notificationTitle,
                notificationOptions
              );
            })
            .catch((error) => {
            });
        }
      }

      onMessageReceived(payload);
    });

    return unsubscribe;
  } catch (error) {
    return () => {};
  }
};

/**
 * Sync any SW-stored notifications (IndexedDB) into localStorage
 * so the existing NotificationCenter (localStorage-based) can display them.
 */
export async function syncStoredNotificationsToLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("indexedDB" in window)) return;
  try {
    const idbItems = await idbGetAllNotifications();
    if (!idbItems.length) return;

    const existing = JSON.parse(
      localStorage.getItem("fcm_notification_history") || "[]"
    ) as StoredNotification[];

    // Merge by timestamp (keyPath), keep newest first, cap at 50
    const mergedMap = new Map<number, StoredNotification>();
    for (const n of existing) {
      if (typeof n?.timestamp === "number") mergedMap.set(n.timestamp, n);
    }
    for (const n of idbItems) {
      if (typeof n?.timestamp === "number") mergedMap.set(n.timestamp, n);
    }

    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );
    localStorage.setItem(
      "fcm_notification_history",
      JSON.stringify(merged.slice(0, 50))
    );

    // Clear IDB once synced so we don't re-merge forever
    await idbClearNotifications();
  } catch (e) {
    // non-fatal
  }
}

/**
 * Listen for SW-posted background messages to update in-app history instantly.
 */
export function setupServiceWorkerFCMBridge(
  onMessageReceived: (payload: any) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  if (!("serviceWorker" in navigator)) return () => {};

  const handler = async (event: MessageEvent) => {
    if (!event?.data || event.data.type !== "FCM_BACKGROUND_MESSAGE") return;
    const payload = event.data.payload;
    try {
      // Also persist to IDB in the page context as a fallback
      const type = payload?.data?.type || "unknown";
      const entry: StoredNotification = {
        title:
          payload?.notification?.title ||
          payload?.data?.title ||
          "New Notification",
        body:
          payload?.notification?.body ||
          payload?.data?.body ||
          payload?.data?.message ||
          "",
        timestamp: Date.now(),
        type,
        read: false,
        ...(payload?.data || {}),
      };
      await idbAddNotification(entry);
      // Keep localStorage in sync so NotificationCenter badge updates quickly
      await syncStoredNotificationsToLocalStorage();
    } catch (e) {
      // ignore
    }

    onMessageReceived(payload);
  };

  navigator.serviceWorker.addEventListener("message", handler);
  return () => navigator.serviceWorker.removeEventListener("message", handler);
}

/**
 * Initialize FCM for a user
 */
export const initializeFCM = async (
  userId: string,
  onMessageReceived: (payload: any) => void
): Promise<(() => void) | null> => {
  try {
    // Subscribe first so early messages during init still reach this consumer
    fcmMessageSubscribers.add(onMessageReceived);

    const ok = await ensureFCMCoreStarted(userId);
    if (!ok) {
      fcmMessageSubscribers.delete(onMessageReceived);
      // Silent fail - FCM is optional, app works fine without it
      return null;
    }

    // Return an unsubscribe that only removes this subscriber.
    return () => {
      fcmMessageSubscribers.delete(onMessageReceived);
      // If no one is listening anymore, stop the core listener.
      if (fcmMessageSubscribers.size === 0) {
        stopFCMCore();
      }
    };
  } catch (error) {
    // Silent fail - FCM is optional
    return null;
  }
};

/**
 * Clean up FCM token when user logs out
 */
export const cleanupFCM = async (token: string): Promise<void> => {
  try {
    await removeFCMTokenFromServer(token);
  } catch (error) {
    // Cleanup failed silently
  }
};

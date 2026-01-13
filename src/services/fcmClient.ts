import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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
    console.debug(
      "📱 FCM: Firebase config incomplete (FCM features will be disabled). This is normal if you haven't set up Firebase yet."
    );
    app = null;
  } else {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    console.debug("📱 FCM: Firebase app initialized");
  }
} catch (error) {
  console.debug("📱 FCM: Firebase initialization failed (non-critical):", error);
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
    console.debug("📱 FCM: Messaging initialized");
  } catch (error) {
    console.debug(
      "📱 FCM: Messaging not supported in this browser (this is normal for Safari, incognito mode, etc.)"
    );
  }
}

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
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
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
      console.debug("📱 FCM: Messaging not initialized");
      return null;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.debug(
        "📱 FCM: No notification permission (this is normal if user declined or browser doesn't support)"
      );
      return null;
    }

    // Use singleton service worker registration
    const swRegistration = await getServiceWorkerRegistration();
    if (!swRegistration) {
      console.debug("📱 FCM: Service worker not available");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BHlNUbElLjZwdCrqi9LxcPStpMhVtwpf1HRRUJA-iP1eqiXERJWSibJCiPwLJuOBOjRPT70RJL5n64EZxJgQfr4",
    });

    if (!token) {
      console.debug("📱 FCM: Failed to get token from Firebase");
      return null;
    }

    console.log("✅ FCM: Token obtained successfully");
    return token;
  } catch (error) {
    // Silent fail with debug info
    console.debug("📱 FCM: Error getting token (non-critical):", error);
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
      console.error("Messaging not initialized");
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
              console.error("Failed to show notification:", error);
            });
        }
      }

      onMessageReceived(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up FCM listener:", error);
    return () => {};
  }
};

/**
 * Initialize FCM for a user
 */
export const initializeFCM = async (
  userId: string,
  onMessageReceived: (payload: any) => void
): Promise<(() => void) | null> => {
  try {
    const token = await getFCMToken();

    if (!token) {
      // Silent fail - FCM is optional, app works fine without it
      console.warn(
        "⚠️ FCM not available. This is normal if:",
        "\n- Browser doesn't support push notifications (Safari on iOS, incognito mode)",
        "\n- Notification permission was denied",
        "\n- Service worker failed to register",
        "\n- Firebase credentials are missing",
        "\n\nThe app will continue to work with API polling for notifications."
      );
      return null;
    }

    await saveFCMTokenToServer(userId, token);
    const unsubscribe = setupFCMListener(onMessageReceived);

    console.log("✅ FCM initialized successfully");
    return unsubscribe;
  } catch (error) {
    // Silent fail - FCM is optional
    console.warn("⚠️ FCM initialization failed (non-critical):", error);
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

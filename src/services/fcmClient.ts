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

// Initialize Firebase with proper guards
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.warn("Firebase initialization failed:", error);
  app = null;
}
const db = app ? getFirestore(app) : null;

// Initialize messaging only in browser environment
let messaging: any = null;
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn("Firebase Messaging not supported in this browser:", error);
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
 * Get FCM token for the current user
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    console.log("🔑 [getFCMToken] Starting token retrieval...");
    
    if (!messaging) {
      console.warn("⚠️ [getFCMToken] Firebase Messaging not initialized");
      return null;
    }

    console.log("🔐 [getFCMToken] Requesting notification permission...");
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn("⚠️ [getFCMToken] Notification permission denied or unavailable");
      return null;
    }
    console.log("✅ [getFCMToken] Notification permission granted");

    // Register service worker first
    if ("serviceWorker" in navigator) {
      try {
        console.log("📝 [getFCMToken] Registering service worker...");
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("✅ [getFCMToken] Service worker registered:", registration.scope);
      } catch (error) {
        console.error("❌ [getFCMToken] Service worker registration failed:", error);
      }
    } else {
      console.warn("⚠️ [getFCMToken] Service workers not supported in this browser");
    }

    console.log("🎟️ [getFCMToken] Getting FCM token from Firebase...");
    const token = await getToken(messaging, {
      vapidKey:
        "BHlNUbElLjZwdCrqi9LxcPStpMhVtwpf1HRRUJA-iP1eqiXERJWSibJCiPwLJuOBOjRPT70RJL5n64EZxJgQfr4",
    });

    if (token) {
      console.log("✅ [getFCMToken] Token obtained successfully:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ [getFCMToken] No token returned from Firebase");
    }

    return token;
  } catch (error) {
    console.error("❌ [getFCMToken] Error getting token:", error);
    // Handle specific FCM errors more gracefully
    if (error instanceof Error) {
      if (
        error.name === "AbortError" &&
        error.message.includes("permission denied")
      ) {
        console.warn("⚠️ [getFCMToken] Permission denied error");
        return null;
      }
      if (error.message.includes("unsupported-browser")) {
        console.warn("⚠️ [getFCMToken] Unsupported browser");
        return null;
      }
    }
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
    console.log("👂 [setupFCMListener] Setting up message listener...");
    
    if (!messaging) {
      console.warn("⚠️ [setupFCMListener] No messaging instance available");
      return () => {};
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📨 [setupFCMListener] Message received in foreground:", payload);
      console.log("  - Title:", payload.notification?.title);
      console.log("  - Body:", payload.notification?.body);
      console.log("  - Data:", payload.data);
      
      // Also show a browser notification manually for foreground messages
      if (payload.notification && "Notification" in window && Notification.permission === "granted") {
        console.log("🔔 [setupFCMListener] Showing browser notification...");
        const notification = new Notification(payload.notification.title || "New Notification", {
          body: payload.notification.body,
          icon: "/assets/logos/PlasIcon.png",
          badge: "/assets/logos/PlasIcon.png",
          data: payload.data,
          requireInteraction: true, // Keep notification visible until user dismisses
          tag: `fcm-${Date.now()}`, // Unique tag for each notification
          vibrate: [200, 100, 200], // Vibration pattern
        });
        
        // Keep notification open for at least 10 seconds
        setTimeout(() => {
          // Notification will auto-close after 10 seconds if user hasn't interacted
          if (notification) {
            console.log("🔔 Notification still visible after 10s");
          }
        }, 10000);
      }
      
      onMessageReceived(payload);
    });

    console.log("✅ [setupFCMListener] Message listener set up successfully");
    return unsubscribe;
  } catch (error) {
    console.error("❌ [setupFCMListener] Error setting up listener:", error);
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
    console.log("🔧 [FCM Client] Initializing FCM for user:", userId);
    
    // Get FCM token
    console.log("🔑 [FCM Client] Getting FCM token...");
    const token = await getFCMToken();
    
    if (!token) {
      console.warn("⚠️ [FCM Client] No FCM token obtained. Possible reasons:");
      console.warn("  - Notification permission not granted");
      console.warn("  - Service worker not registered");
      console.warn("  - Browser doesn't support FCM");
      return null;
    }

    console.log("✅ [FCM Client] FCM token obtained:", token.substring(0, 20) + "...");

    // Save token to server
    console.log("💾 [FCM Client] Saving token to server...");
    await saveFCMTokenToServer(userId, token);
    console.log("✅ [FCM Client] Token saved to server successfully");

    // Set up message listener
    console.log("👂 [FCM Client] Setting up message listener...");
    const unsubscribe = setupFCMListener(onMessageReceived);
    console.log("✅ [FCM Client] Message listener set up successfully");

    return unsubscribe;
  } catch (error) {
    console.error("❌ [FCM Client] Error initializing FCM:", error);
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

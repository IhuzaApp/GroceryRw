import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Firebase config - using hardcoded values to avoid env issues
const firebaseConfig = {
  apiKey: "AIzaSyA-w5VgsITsGws1DEBoFl3SrVgn_62H_nU",
  authDomain: "bokiee-2e726.firebaseapp.com",
  projectId: "bokiee-2e726",
  storageBucket: "bokiee-2e726.firebasestorage.app",
  messagingSenderId: "421990441361",
  appId: "1:421990441361:web:475e3c34284122e0157a30",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

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
    if (!messaging) {
      return null;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    // Register service worker first
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch (error) {
        // Service worker registration failed
      }
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BHlNUbElLjZwdCrqi9LxcPStpMhVtwpf1HRRUJA-iP1eqiXERJWSibJCiPwLJuOBOjRPT70RJL5n64EZxJgQfr4",
    });

    return token;
  } catch (error) {
    // Handle specific FCM errors more gracefully
    if (error instanceof Error) {
      if (
        error.name === "AbortError" &&
        error.message.includes("permission denied")
      ) {
        return null;
      }
      if (error.message.includes("unsupported-browser")) {
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
    if (!messaging) {
      return () => {};
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      onMessageReceived(payload);
    });

    return unsubscribe;
  } catch (error) {
    return () => {};
  }
};

/**
 * Initialize FCM for a user
 */
export const initializeFCM = async (
  userId: string,
  onMessageReceived: (payload: any) => void
): Promise<() => void> => {
  try {
    // Get FCM token
    const token = await getFCMToken();
    if (!token) {
      return () => {};
    }

    // Save token to server
    await saveFCMTokenToServer(userId, token);

    // Set up message listener
    const unsubscribe = setupFCMListener(onMessageReceived);

    return unsubscribe;
  } catch (error) {
    return () => {};
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

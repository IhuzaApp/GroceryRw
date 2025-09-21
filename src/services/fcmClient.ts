import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config - using hardcoded values to avoid env issues
const firebaseConfig = {
  apiKey: "AIzaSyA-w5VgsITsGws1DEBoFl3SrVgn_62H_nU",
  authDomain: "bokiee-2e726.firebaseapp.com",
  projectId: "bokiee-2e726",
  storageBucket: "bokiee-2e726.firebasestorage.app",
  messagingSenderId: "421990441361",
  appId: "1:421990441361:web:475e3c34284122e0157a30"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Initialize messaging only in browser environment
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging not supported in this browser:', error);
  }
}

export interface FCMTokenData {
  userId: string;
  token: string;
  platform: 'web' | 'android' | 'ios';
  createdAt: Date;
  lastUsed: Date;
}

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    console.log('🔍 [FCM Client] Requesting notification permission');
    
    if (!('Notification' in window)) {
      console.log('❌ [FCM Client] This browser does not support notifications');
      return false;
    }

    // Check if in incognito mode (Chrome)
    if (window.navigator.userAgent.includes('Chrome')) {
      try {
        // Try to access indexedDB - it's restricted in incognito mode
        await new Promise((resolve, reject) => {
          const request = indexedDB.open('test');
          request.onerror = () => reject('IndexedDB not available');
          request.onsuccess = () => {
            request.result.close();
            resolve(true);
          };
        });
      } catch (error) {
        console.warn('⚠️ [FCM Client] Detected incognito mode - push notifications not supported');
        console.warn('⚠️ [FCM Client] Please use a regular browser window to test notifications');
        return false;
      }
    }

    if (Notification.permission === 'granted') {
      console.log('✅ [FCM Client] Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ [FCM Client] Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    console.log('🔍 [FCM Client] Permission result:', permission);
    
    return permission === 'granted';
  } catch (error) {
    console.error('❌ [FCM Client] Error requesting permission:', error);
    return false;
  }
};

/**
 * Get FCM token for the current user
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    console.log('🔍 [FCM Client] Getting FCM token');
    
    if (!messaging) {
      console.log('❌ [FCM Client] Messaging not available (SSR or unsupported browser)');
      return null;
    }
    
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('❌ [FCM Client] No notification permission');
      return null;
    }

    // Register service worker first
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ [FCM Client] Service worker registered:', registration);
      } catch (error) {
        console.error('❌ [FCM Client] Service worker registration failed:', error);
      }
    }

    const token = await getToken(messaging, {
      vapidKey: "BHlNUbElLjZwdCrqi9LxcPStpMhVtwpf1HRRUJA-iP1eqiXERJWSibJCiPwLJuOBOjRPT70RJL5n64EZxJgQfr4",
    });

    if (token) {
      console.log('✅ [FCM Client] FCM token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('❌ [FCM Client] No registration token available');
      return null;
    }
  } catch (error) {
    // Handle specific FCM errors more gracefully
    if (error instanceof Error) {
      if (error.name === 'AbortError' && error.message.includes('permission denied')) {
        console.warn('⚠️ [FCM Client] FCM registration failed - permission denied. This is normal if notifications are blocked.');
        return null;
      }
      if (error.message.includes('unsupported-browser')) {
        console.warn('⚠️ [FCM Client] FCM not supported in this browser');
        return null;
      }
    }
    console.error('❌ [FCM Client] Error getting FCM token:', error);
    return null;
  }
};

/**
 * Save FCM token to server
 */
export const saveFCMTokenToServer = async (
  userId: string,
  token: string,
  platform: 'web' | 'android' | 'ios' = 'web'
): Promise<void> => {
  try {
    console.log('🔍 [FCM Client] Saving token to server:', { userId, token, platform });
    
    const response = await fetch('/api/fcm/save-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    console.log('✅ [FCM Client] Token saved to server successfully');
  } catch (error) {
    console.error('❌ [FCM Client] Error saving token to server:', error);
    throw error;
  }
};

/**
 * Remove FCM token from server
 */
export const removeFCMTokenFromServer = async (token: string): Promise<void> => {
  try {
    console.log('🔍 [FCM Client] Removing token from server:', token);
    
    const response = await fetch('/api/fcm/remove-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove token: ${response.statusText}`);
    }

    console.log('✅ [FCM Client] Token removed from server successfully');
  } catch (error) {
    console.error('❌ [FCM Client] Error removing token from server:', error);
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
    console.log('🔍 [FCM Client] Setting up FCM listener');
    
    if (!messaging) {
      console.log('❌ [FCM Client] Messaging not available (SSR or unsupported browser)');
      return () => {};
    }
    
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('🔔 [FCM Client] Message received:', payload);
      onMessageReceived(payload);
    });

    console.log('✅ [FCM Client] FCM listener set up successfully');
    return unsubscribe;
  } catch (error) {
    console.error('❌ [FCM Client] Error setting up FCM listener:', error);
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
    console.log('🔍 [FCM Client] Initializing FCM for user:', userId);
    
    // Get FCM token
    const token = await getFCMToken();
    if (!token) {
      console.log('❌ [FCM Client] No FCM token available');
      return () => {};
    }

    // Save token to server
    await saveFCMTokenToServer(userId, token);

    // Set up message listener
    const unsubscribe = setupFCMListener(onMessageReceived);

    console.log('✅ [FCM Client] FCM initialized successfully');
    return unsubscribe;
  } catch (error) {
    console.error('❌ [FCM Client] Error initializing FCM:', error);
    return () => {};
  }
};

/**
 * Clean up FCM token when user logs out
 */
export const cleanupFCM = async (token: string): Promise<void> => {
  try {
    console.log('🔍 [FCM Client] Cleaning up FCM token');
    await removeFCMTokenFromServer(token);
    console.log('✅ [FCM Client] FCM cleanup completed');
  } catch (error) {
    console.error('❌ [FCM Client] Error cleaning up FCM:', error);
  }
};


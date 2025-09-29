import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInWithCustomToken } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase with proper guards to prevent duplicate apps
// Only initialize on client side to prevent server-side conflicts
let app = null;
if (typeof window !== "undefined") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
    app = null;
  }
}

// Initialize Firestore
export const db = app ? getFirestore(app) : null;

// Initialize Storage
export const storage = app ? getStorage(app) : null;

// Initialize Firebase Auth
export const auth = app ? getAuth(app) : null;

// Function to authenticate with Firebase using a custom token
export const authenticateWithFirebase = async (customToken: string) => {
  try {
    if (!auth) {
      console.warn("Firebase Auth not initialized");
      return;
    }
    await signInWithCustomToken(auth, customToken);
    console.log("Successfully authenticated with Firebase");
  } catch (error) {
    console.error("Error authenticating with Firebase:", error);
  }
};

// Export the app instance for use in other modules
export { app };
export default app;

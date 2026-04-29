import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getAI, GoogleAIBackend } from "firebase/ai";

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
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.warn("Firebase initialization failed:", error);
  app = null;
}

// Initialize Firestore
const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "(default)";
export const db = app ? getFirestore(app, databaseId) : null;

// Initialize Storage
export const storage = app ? getStorage(app) : null;

// Initialize Firebase Auth
export const auth = app ? getAuth(app) : null;

// Initialize Gemini Developer AI backend
export const ai = app ? getAI(app, { backend: new GoogleAIBackend() }) : null;

// Function to authenticate with Firebase using a custom token
export const authenticateWithFirebase = async (customToken: string) => {
  try {
    if (!auth) {
      return;
    }
    await signInWithCustomToken(auth, customToken);
    console.log("Successfully authenticated with Firebase");
  } catch (error) {
    console.error("Error authenticating with Firebase:", error);
  }
};

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload
 * @param path The path in storage (e.g., 'pets/buddy-main.jpg')
 * @returns The download URL of the uploaded file
 */
export const uploadToFirebase = async (
  file: File,
  path: string
): Promise<string> => {
  if (!storage) {
    throw new Error("Firebase Storage not initialized");
  }

  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    throw error;
  }
};

export default app;

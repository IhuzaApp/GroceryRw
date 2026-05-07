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
  const isConfigValid =
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.appId;
  if (!isConfigValid) {
    console.error(
      "Firebase config is incomplete. Check environment variables."
    );
    console.log("Config keys status:", {
      apiKey: !!firebaseConfig.apiKey,
      projectId: !!firebaseConfig.projectId,
      appId: !!firebaseConfig.appId,
    });
  }
  app =
    getApps().length === 0
      ? isConfigValid
        ? initializeApp(firebaseConfig)
        : null
      : getApps()[0];
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

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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

/**
 * Deletes a file from Firebase Storage.
 * @param urlOrPath The download URL or full path of the file to delete
 */
export const deleteFromFirebase = async (urlOrPath: string): Promise<void> => {
  if (!storage) {
    throw new Error("Firebase Storage not initialized");
  }

  try {
    // If it's a URL, we need to extract the path or use refFromURL if available
    // But ref(storage, url) often works for download URLs in many Firebase versions
    const fileRef = ref(storage, urlOrPath);
    await deleteObject(fileRef);
    console.log("Successfully deleted file from Firebase Storage");
  } catch (error) {
    console.error("Error deleting from Firebase:", error);
    // We don't necessarily want to throw here if the file already doesn't exist
  }
};

export default app;

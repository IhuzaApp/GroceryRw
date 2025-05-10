import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInWithCustomToken } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-w5VgsITsGws1DEBoFl3SrVgn_62H_nU",
  authDomain: "bokiee-2e726.firebaseapp.com",
  projectId: "bokiee-2e726",
  storageBucket: "bokiee-2e726.firebasestorage.app",
  messagingSenderId: "421990441361",
  appId: "1:421990441361:web:475e3c34284122e0157a30",
  measurementId: "G-SLDEDK550H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Function to authenticate with Firebase using a custom token
export const authenticateWithFirebase = async (customToken: string) => {
  try {
    await signInWithCustomToken(auth, customToken);
    console.log("Successfully authenticated with Firebase");
  } catch (error) {
    console.error("Error authenticating with Firebase:", error);
  }
};

export default app;

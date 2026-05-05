import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Check if Firebase credentials are available
const hasFirebaseCredentials = () => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
};

let adminApp: App | null = null;
let storage: Storage | null = null;
let db: Firestore | null = null;

if (hasFirebaseCredentials()) {
  try {
    if (getApps().length === 0) {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (privateKey) {
        privateKey = privateKey.trim();
        privateKey = privateKey.replace(/^['"]+|['"]+$/g, "");
        privateKey = privateKey.replace(/\\n/g, "\n");

        if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
          privateKey = "-----BEGIN PRIVATE KEY-----\n" + privateKey;
        }
        if (!privateKey.includes("-----END PRIVATE KEY-----")) {
          privateKey = privateKey.trim() + "\n-----END PRIVATE KEY-----\n";
        }
      }

      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
        storageBucket: `${projectId}.firebasestorage.app`, // Standard bucket name
      });
    } else {
      adminApp = getApps()[0];
    }

    storage = getStorage(adminApp);
    db = getFirestore(adminApp);
  } catch (error) {
    console.error("❌ [Firebase Admin] Initialization failed:", error);
  }
} else {
  console.warn(
    "⚠️ [Firebase Admin] Credentials missing. Admin features disabled."
  );
}

export { adminApp, storage, db };

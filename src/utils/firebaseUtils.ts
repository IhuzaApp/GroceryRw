import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Utility to convert a data URL (Base64) to a Blob
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Utility to upload a File or DataURL to Firebase Storage
 */
export async function uploadToFirebase(
  fileOrDataURL: File | Blob | string,
  path: string
): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage not initialized");
  }

  let blob: Blob | File;
  if (typeof fileOrDataURL === "string") {
    if (fileOrDataURL.startsWith("data:")) {
      blob = dataURLtoBlob(fileOrDataURL);
    } else {
      // It's already a URL or something else, return as is
      return fileOrDataURL;
    }
  } else {
    blob = fileOrDataURL;
  }

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

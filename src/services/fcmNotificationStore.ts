export type StoredNotification = {
  title: string;
  body: string;
  timestamp: number;
  type: string;
  read: boolean;
  orderId?: string;
  conversationId?: string;
  senderName?: string;
  // allow any extra payload data
  [k: string]: any;
};

const DB_NAME = "fcm_notifications_db";
const DB_VERSION = 1;
const STORE_NAME = "notifications";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "timestamp" });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function idbAddNotification(n: StoredNotification): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).put(n);
  });
  db.close();
}

export async function idbGetAllNotifications(): Promise<StoredNotification[]> {
  const db = await openDb();
  const items = await new Promise<StoredNotification[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve((req.result || []) as StoredNotification[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  // newest first
  return items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export async function idbClearNotifications(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  db.close();
}


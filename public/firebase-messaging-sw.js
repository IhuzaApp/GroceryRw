// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase
const firebaseConfig = {};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || payload.data?.title || "New Message";
  const notificationBody =
    payload.notification?.body ||
    payload.data?.body ||
    payload.data?.message ||
    "You have a new message";
  const notificationOptions = {
    body: notificationBody,
    icon: "/assets/logos/PlasIcon.png",
    badge: "/assets/logos/PlasIcon.png",
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: "open",
        title: "Open Chat",
        icon: "/assets/logos/PlasIcon.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/assets/logos/PlasIcon.png",
      },
    ],
  };

  // Persist a copy for in-app NotificationCenter via IndexedDB (SW can't access localStorage)
  const persistPromise = (async () => {
    try {
      const dbOpen = indexedDB.open("fcm_notifications_db", 1);
      const db = await new Promise((resolve, reject) => {
        dbOpen.onerror = () => reject(dbOpen.error);
        dbOpen.onupgradeneeded = () => {
          const _db = dbOpen.result;
          if (!_db.objectStoreNames.contains("notifications")) {
            _db.createObjectStore("notifications", { keyPath: "timestamp" });
          }
        };
        dbOpen.onsuccess = () => resolve(dbOpen.result);
      });

      const type = payload.data?.type || "unknown";
      const entry = {
        title: notificationTitle,
        body: notificationBody,
        timestamp: Date.now(),
        type,
        read: false,
        ...(payload.data || {}),
      };

      await new Promise((resolve, reject) => {
        const tx = db.transaction("notifications", "readwrite");
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
        tx.objectStore("notifications").put(entry);
      });
      db.close();
    } catch (e) {
      // non-fatal
    }
  })();

  const notifyPromise = self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

  // Also try to push the payload to any open tabs for instant UI update
  const broadcastPromise = (async () => {
    try {
      const clientList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientList) {
        client.postMessage({ type: "FCM_BACKGROUND_MESSAGE", payload });
      }
    } catch (e) {
      // non-fatal
    }
  })();

  return Promise.all([persistPromise, broadcastPromise, notifyPromise]);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    // Get the orderId from the notification data
    const orderId = event.notification.data?.orderId;
    const conversationId = event.notification.data?.conversationId;

    // Open the chat page
    const urlToOpen = orderId ? `/Messages/${orderId}` : "/Messages";

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && "focus" in client) {
              return client.focus();
            }
          }

          // If no existing window, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  // Notification closed
});

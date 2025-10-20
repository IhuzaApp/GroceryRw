const fs = require("fs");
const path = require("path");

// Read environment variables
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA-w5VgsITsGws1DEBoFl3SrVgn_62H_nU",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "bokiee-2e726.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bokiee-2e726",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "bokiee-2e726.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "421990441361",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:421990441361:web:475e3c34284122e0157a30",
};

// Generate service worker content
const swContent = `// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase
const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
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

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    // Get the orderId from the notification data
    const orderId = event.notification.data?.orderId;
    const conversationId = event.notification.data?.conversationId;

    // Open the chat page
    const urlToOpen = orderId ? \`/Messages/\${orderId}\` : "/Messages";

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
`;

// Write the service worker file
const swPath = path.join(__dirname, "..", "public", "firebase-messaging-sw.js");
fs.writeFileSync(swPath, swContent);

console.log("Service worker generated successfully with environment variables");

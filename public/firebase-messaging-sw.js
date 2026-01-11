// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase
// TODO: Replace these with your actual Firebase config values from .env.local
// Service workers cannot access process.env, so these must be hardcoded
const firebaseConfig = {
  apiKey: "AIzaSyDNFJL4UdFpwW2N0wbUVQQkJw1aM2M2M2M", // Replace with your actual API key
  authDomain: "your-project.firebaseapp.com", // Replace with your actual auth domain
  projectId: "your-project-id", // Replace with your actual project ID
  storageBucket: "your-project.appspot.com", // Replace with your actual storage bucket
  messagingSenderId: "123456789012", // Replace with your actual sender ID
  appId: "1:123456789012:web:abc123def456", // Replace with your actual app ID
  measurementId: "G-XXXXXXXXXX", // Replace with your actual measurement ID (optional)
};

console.log("🔧 [Service Worker] Initializing Firebase...");
firebase.initializeApp(firebaseConfig);
console.log("✅ [Service Worker] Firebase initialized");

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

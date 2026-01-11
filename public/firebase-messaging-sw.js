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

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationType = payload.data?.type || "message";
  let notificationTitle = payload.notification?.title || "New Message";
  let notificationBody = payload.notification?.body || "You have a new message";
  
  // Customize notification based on type
  let actions = [];
  if (notificationType === "test") {
    actions = [
      {
        action: "close",
        title: "Got it!",
        icon: "/assets/logos/PlasIcon.png",
      },
    ];
  } else if (notificationType === "chat_message") {
    actions = [
      {
        action: "open",
        title: "Open Chat",
        icon: "/assets/logos/PlasIcon.png",
      },
      {
        action: "close",
        title: "Dismiss",
        icon: "/assets/logos/PlasIcon.png",
      },
    ];
  } else if (notificationType === "new_order" || notificationType === "batch_orders") {
    actions = [
      {
        action: "open",
        title: "View Order",
        icon: "/assets/logos/PlasIcon.png",
      },
      {
        action: "close",
        title: "Dismiss",
        icon: "/assets/logos/PlasIcon.png",
      },
    ];
  }
  
  const notificationOptions = {
    body: notificationBody,
    icon: "/assets/logos/PlasIcon.png",
    badge: "/assets/logos/PlasIcon.png",
    data: payload.data,
    requireInteraction: false, // Changed to false for better system behavior
    silent: false, // CRITICAL: false = sound ON, true = sound OFF
    vibrate: [200, 100, 200, 100, 200],
    tag: `fcm-${notificationType}-${Date.now()}`, // Always unique
    renotify: true, // CRITICAL: Allows sound on every notification
    actions: actions,
  };

  console.log("🔔 [Service Worker] Notification options:", {
    silent: notificationOptions.silent,
    renotify: notificationOptions.renotify,
    requireInteraction: notificationOptions.requireInteraction,
  });
  
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification clicked, action:", event.action);
  event.notification.close();

  if (event.action === "close") return;
  if (event.action === "view") {
    // View action clicked
  }

  if (event.action === "open" || !event.action) {
    const notificationType = event.notification.data?.type;
    const orderId = event.notification.data?.orderId;

    let urlToOpen = "/Plasa/dashboard";
    
    if (notificationType === "test") {
      urlToOpen = "/Plasa/dashboard";
    } else if (notificationType === "chat_message" && orderId) {
      urlToOpen = `/Messages/${orderId}`;
    } else if (notificationType === "new_order" || notificationType === "batch_orders") {
      urlToOpen = "/Plasa/active-batches";
    } else if (orderId) {
      urlToOpen = `/Messages/${orderId}`;
    }

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && "focus" in client) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

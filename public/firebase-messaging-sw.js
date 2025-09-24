// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-w5VgsITsGws1DEBoFl3SrVgn_62H_nU",
  authDomain: "bokiee-2e726.firebaseapp.com",
  projectId: "bokiee-2e726",
  storageBucket: "bokiee-2e726.firebasestorage.app",
  messagingSenderId: "421990441361",
  appId: "1:421990441361:web:475e3c34284122e0157a30",
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Received background message:', payload);
  
  // Handle batch notifications
  if (payload.data?.type === 'batch_notification') {
    const notificationTitle = payload.notification?.title || "🚀 New Batch Available!";
    const notificationBody = payload.notification?.body || "You have a new batch opportunity";
    
    // Extract batch-specific data
    const batchData = payload.data || {};
    const { orderId, OrderID, distance, units, earnings, type, notification_id, background_notification } = batchData;
    
    // Use orderId or OrderID (for compatibility)
    const actualOrderId = orderId || OrderID;
    
    // Check if this is a background notification (no click actions needed)
    const isBackgroundNotification = background_notification === "true";
    
    const notificationOptions = {
      body: notificationBody,
      icon: "/assets/logos/PlasIcon.png",
      badge: "/assets/logos/PlasIcon.png",
      data: {
        ...batchData,
        orderId: actualOrderId,
        timestamp: Date.now()
      },
      requireInteraction: !isBackgroundNotification, // Don't require interaction for background notifications
      tag: `batch-${actualOrderId}-${notification_id || Date.now()}`, // Use unique tag to prevent duplicate notifications
      // Only show actions for foreground notifications
      ...(!isBackgroundNotification && {
        actions: [
          {
            action: "accept",
            title: "Accept Batch",
            icon: "/assets/logos/PlasIcon.png",
          },
          {
            action: "view",
            title: "View Details",
            icon: "/assets/logos/PlasIcon.png",
          },
          {
            action: "dismiss",
            title: "Dismiss",
            icon: "/assets/logos/PlasIcon.png",
          }
        ],
      }),
      // Add visual indicators for different notification types
      ...(type === 'warning' && {
        badge: "/assets/logos/PlasIcon.png",
        requireInteraction: true
      })
    };

    console.log('[FCM SW] Showing batch notification:', notificationTitle, { isBackgroundNotification });
    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  }
  // Handle chat notifications
  else if (payload.data?.type === 'chat_message') {
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

    console.log('[FCM SW] Showing chat notification:', notificationTitle);
    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  }
  // Handle other notifications
  else {
    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new notification",
      icon: "/assets/logos/PlasIcon.png",
      badge: "/assets/logos/PlasIcon.png",
      data: payload.data,
      requireInteraction: true,
    };

    console.log('[FCM SW] Showing general notification:', notificationTitle);
    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;
  const { type, orderId, OrderID, conversationId } = notificationData;

  console.log('[FCM SW] Notification clicked:', { action, type, notificationData });

  // Handle batch notifications
  if (type === 'batch_notification') {
    // Use orderId or OrderID (for compatibility)
    const actualOrderId = orderId || OrderID;
    
    // Check if this is a background notification
    const isBackgroundNotification = notificationData?.background_notification === "true";
    
    let urlToOpen = "/Plasa/active-batches"; // Default to active batches page

    if (action === "accept" || action === "view" || !action) {
      // Navigate to specific batch details or accept the batch
      if (actualOrderId) {
        urlToOpen = `/Plasa/active-batches/batch/${actualOrderId}`;
      } else {
        urlToOpen = "/Plasa/active-batches";
      }
    } else if (action === "dismiss") {
      // Just close the notification, don't navigate
      return;
    }

    console.log('[FCM SW] Opening batch URL:', urlToOpen, { isBackgroundNotification });

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
  // Handle chat notifications
  else if (type === 'chat_message') {
    if (action === "open" || !action) {
      // Get the orderId from the notification data
      const orderId = notificationData?.orderId;

      // Open the chat page
      const urlToOpen = orderId ? `/Messages/${orderId}` : "/Messages";

      console.log('[FCM SW] Opening chat URL:', urlToOpen);

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
  }
  // Handle other notifications
  else {
    // Default behavior for other notification types
    const urlToOpen = "/";

    console.log('[FCM SW] Opening default URL:', urlToOpen);

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
  console.log('[FCM SW] Notification closed:', event.notification.tag);
});

// Handle push events (if needed for additional processing)
self.addEventListener("push", (event) => {
  console.log('[FCM SW] Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('[FCM SW] Push data:', data);
  }
});

// Service worker installation
self.addEventListener("install", (event) => {
  console.log('[FCM SW] Service worker installed');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener("activate", (event) => {
  console.log('[FCM SW] Service worker activated');
  event.waitUntil(self.clients.claim());
});

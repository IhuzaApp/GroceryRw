// Service Worker for Push Notifications
console.log("🔔 [SW] Service Worker loaded");

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("🔔 [SW] Push event received:", event);

  let notificationData = {
    title: "New Message",
    body: "You have a new message",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {
      url: "/Messages",
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        icon: pushData.icon || notificationData.icon,
        badge: pushData.badge || notificationData.badge,
        data: pushData.data || notificationData.data,
      };
    } catch (error) {
      console.error("❌ [SW] Error parsing push data:", error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    actions: [
      {
        action: "open",
        title: "Open Chat",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/icon-192x192.png",
      },
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
    tag: "chat-notification",
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 [SW] Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Default action or 'open' action
  const urlToOpen = event.notification.data?.url || "/Messages";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open with the target URL
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

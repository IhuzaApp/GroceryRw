// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-w5VgsITsGws1DEBoFl3SrVgn_62H_nU",
  authDomain: "bokiee-2e726.firebaseapp.com",
  projectId: "bokiee-2e726",
  storageBucket: "bokiee-2e726.firebasestorage.app",
  messagingSenderId: "421990441361",
  appId: "1:421990441361:web:475e3c34284122e0157a30"
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 [Service Worker] Received background message:', payload);
  console.log('🔔 [Service Worker] Notification permission:', Notification.permission);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/favicon.ico', // Use favicon as fallback
    badge: '/favicon.ico', // Use favicon as fallback
    data: payload.data,
    requireInteraction: true, // Keep notification visible until user interacts
    actions: [
      {
        action: 'open',
        title: 'Open Chat',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  console.log('🔔 [Service Worker] Showing notification:', notificationTitle, notificationOptions);
  
  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log('✅ [Service Worker] Notification shown successfully');
    })
    .catch((error) => {
      console.error('❌ [Service Worker] Failed to show notification:', error);
    });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [Service Worker] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Get the orderId from the notification data
    const orderId = event.notification.data?.orderId;
    const conversationId = event.notification.data?.conversationId;
    
    // Open the chat page
    const urlToOpen = orderId 
      ? `/Messages/${orderId}` 
      : '/Messages';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
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
self.addEventListener('notificationclose', (event) => {
  console.log('🔔 [Service Worker] Notification closed:', event);
});


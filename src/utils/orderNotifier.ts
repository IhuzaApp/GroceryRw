const NOTIFICATION_SOUND_URL = '/notification.mp3'; // You'll need to add this sound file to your public folder
let notificationSound: HTMLAudioElement;

// Initialize the audio element
if (typeof window !== 'undefined') {
  notificationSound = new Audio(NOTIFICATION_SOUND_URL);
}

let checkInterval: NodeJS.Timeout | null = null;

export const startOrderNotifications = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  // Initial check
  checkNewOrders();

  // Set up periodic checks every 3 minutes
  checkInterval = setInterval(checkNewOrders, 3 * 60 * 1000);
};

export const stopOrderNotifications = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

const checkNewOrders = async () => {
  try {
    const response = await fetch('/api/queries/check-new-orders');
    const data = await response.json();

    if (data.success && data.notifications?.length > 0) {
      // Play sound if specified
      if (data.play_sound && notificationSound) {
        notificationSound.play().catch(error => {
          console.error('Error playing notification sound:', error);
        });
      }

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        data.notifications.forEach((notification: any) => {
          new Notification('New Orders Available!', {
            body: notification.message,
            icon: '/app-icon.png', // Add your app icon to public folder
          });
        });
      }

      // Dispatch custom event for any components that want to handle notifications
      window.dispatchEvent(new CustomEvent('newOrders', {
        detail: data.notifications
      }));
    }
  } catch (error) {
    console.error('Error checking for new orders:', error);
  }
}; 
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Message, toaster, Notification as ToastNotification, Button } from 'rsuite';

interface Order {
  id: string;
  shopName: string;
  distance: number;
  createdAt: string;
  // Add other order properties as needed
}

interface NotificationSystemProps {
  onNewOrder?: (order: any) => void;
  currentLocation?: { lat: number; lng: number } | null;
}

export default function NotificationSystem({ onNewOrder, currentLocation }: NotificationSystemProps) {
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationTime = useRef<number>(0);
  const lastOrderIds = useRef<Set<string>>(new Set());

  // Initialize audio immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        console.log('🔊 Initializing notification sound...');
        const audio = new Audio('/notifySound.mp3');
        
        // Set audio properties
        audio.preload = 'auto';
        audio.volume = 1.0;
        audio.autoplay = false; // Prevent autoplay but keep it ready
        
        // Add event listeners for audio loading
        audio.addEventListener('loadeddata', () => {
          console.log('✅ Notification sound loaded successfully');
          setAudioLoaded(true);
          
          // Try to play and immediately pause to enable audio
          audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            console.log('✅ Audio system enabled');
          }).catch(error => {
            console.warn('⚠️ Initial audio enable failed:', error);
          });
        });

        audio.addEventListener('error', (e) => {
          console.error('❌ Error loading notification sound:', e);
          setAudioLoaded(false);
        });

        // Store the audio element
        audioRef.current = audio;
        
        // Try to load the audio
        audio.load();

        // Verify the audio file exists
        fetch('/notifySound.mp3')
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('✅ Notification sound file exists');
          })
          .catch(error => {
            console.error('❌ Could not find notification sound file:', error);
          });

      } catch (error) {
        console.error('❌ Error initializing notification sound:', error);
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (session?.user && currentLocation) {
      startNotificationSystem();
    }
    return () => stopNotificationSystem();
  }, [session, currentLocation]);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await window.Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          showToast('✅ Notifications Enabled', 'You will receive order alerts.', 'success');
        } else if (permission === 'denied') {
          showToast('❌ Browser Notifications Blocked', 'You will still receive in-app notifications.', 'info');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    toaster.push(
      <ToastNotification type={type} header={title} closable duration={4500}>
        <div className="whitespace-pre-line">
          {message}
        </div>
      </ToastNotification>,
      { placement: 'topEnd' }
    );
  };

  const playNotificationSound = async () => {
    console.log('🔊 Attempting to play notification sound...', {
      audioLoaded,
      audioExists: !!audioRef.current
    });

    try {
      if (!audioRef.current) {
        console.error('❌ Cannot play sound - Audio not initialized');
        return;
      }

      if (!audioLoaded) {
        console.warn('⚠️ Cannot play sound - Audio not loaded yet');
        return;
      }

      // Reset audio to start
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;

      console.log('▶️ Playing notification sound...');
      
      // Create multiple play attempts to ensure sound plays
      const attemptPlay = async (attempts = 3) => {
        try {
          await audioRef.current?.play();
          console.log('✅ Notification sound played successfully');
        } catch (error) {
          console.warn(`⚠️ Play attempt failed (${attempts} attempts left):`, error);
          if (attempts > 0) {
            setTimeout(() => attemptPlay(attempts - 1), 100);
          }
        }
      };

      attemptPlay();

    } catch (error) {
      console.error('❌ Unexpected error playing sound:', error);
    }
  };

  const showDesktopNotification = (title: string, message: string) => {
    if (window.Notification && window.Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: message,
        icon: '/app-icon.png',
        badge: '/app-icon.png',
        tag: 'grocery-notification',
        requireInteraction: true,
        silent: true, // We'll handle the sound separately
      };

      const notification = new window.Notification(title, options);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const checkForNewOrders = async () => {
    if (!currentLocation) return;

    const now = new Date();
    console.log(`🕒 Checking for pending orders at ${now.toLocaleTimeString()}`, {
      lastCheck: lastNotificationTime.current ? new Date(lastNotificationTime.current).toLocaleTimeString() : 'Never',
      timeSinceLastCheck: lastNotificationTime.current ? `${Math.round((now.getTime() - lastNotificationTime.current) / 1000)}s` : 'N/A'
    });

    try {
      const response = await fetch(`/api/shopper/availableOrders?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&maxTravelTime=15`);
      const orders = await response.json();

      // Always notify about pending orders
      if (orders.length > 0) {
        // Group orders by shop with proper typing
        const ordersByShop = orders.reduce((acc: { [key: string]: Order[] }, order: Order) => {
          if (!acc[order.shopName]) {
            acc[order.shopName] = [];
          }
          acc[order.shopName].push(order);
          return acc;
        }, {});

        console.log(`📦 Found ${orders.length} pending orders in ${Object.keys(ordersByShop).length} shops`);

        // Create notifications for each shop
        const notifications = (Object.entries(ordersByShop) as [string, Order[]][]).map(([shopName, shopOrders]) => {
          // Calculate how long orders have been pending
          const oldestOrder = shopOrders.reduce((oldest, current) => {
            const currentTime = new Date(current.createdAt).getTime();
            return currentTime < oldest ? currentTime : oldest;
          }, Date.now());
          
          const minutesPending = Math.floor((now.getTime() - oldestOrder) / 60000);
          
          return {
            title: `🔔 Pending Orders at ${shopName}!`,
            message: `${shopOrders.length} order${shopOrders.length > 1 ? 's' : ''} still pending - ${shopOrders[0].distance}km away${minutesPending > 0 ? ` (Waiting ${minutesPending}min)` : ''}`,
            priority: minutesPending > 30 ? 'high' : 'normal',
            orders: shopOrders
          };
        });

        // Only play sound and show notifications if enough time has passed
        const timeSinceLastNotification = now.getTime() - lastNotificationTime.current;
        if (timeSinceLastNotification >= 60000) { // Only notify every 60 seconds
          console.log('🔔 Showing notifications for pending orders');
          
          // Play sound and show notifications
          await playNotificationSound();
          
          notifications.forEach(notification => {
            showToast(notification.title, notification.message, notification.priority === 'high' ? 'warning' : 'info');
            
            if (window.Notification?.permission === 'granted') {
              showDesktopNotification(notification.title, notification.message);
            }
          });

          // Update last notification time
          lastNotificationTime.current = now.getTime();
        } else {
          console.log(`⏳ Skipping notifications - ${Math.floor((60000 - timeSinceLastNotification) / 1000)}s until next notification`);
        }

        // Call the callback if provided
        if (onNewOrder) {
          onNewOrder(orders);
        }
      } else {
        console.log('✅ No pending orders found');
      }
    } catch (error) {
      console.error('Error checking for pending orders:', error);
    }
  };

  const startNotificationSystem = () => {
    if (!session?.user?.id || !currentLocation) return;

    // Clear existing interval if any
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
    }

    // Reset notification state
    lastNotificationTime.current = 0;

    console.log('🔄 Starting notification system...');
    console.log('⏰ Will check for pending orders every 60 seconds');

    // Initial check
    checkForNewOrders();

    // Set up interval for checking
    checkInterval.current = setInterval(() => {
      const now = new Date();
      console.log(`⏰ Interval triggered at ${now.toLocaleTimeString()}`);
      checkForNewOrders();
    }, 60000); // Check every 60 seconds

    setIsListening(true);
  };

  const stopNotificationSystem = () => {
    console.log('🛑 Stopping notification system');
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
      checkInterval.current = null;
    }
    setIsListening(false);
    lastOrderIds.current.clear();
  };

  // Add a log when the component mounts/unmounts
  useEffect(() => {
    console.log('📱 NotificationSystem component mounted');
    return () => {
      console.log('📱 NotificationSystem component unmounting');
    };
  }, []);

  // Add logging for session and location changes
  useEffect(() => {
    if (session?.user && currentLocation) {
      console.log('🔑 User logged in and location available, starting notification system');
      startNotificationSystem();
    } else {
      console.log('⚠️ Missing requirements for notification system:', {
        hasUser: !!session?.user,
        hasLocation: !!currentLocation
      });
    }
    return () => stopNotificationSystem();
  }, [session, currentLocation]);

  // The component doesn't render anything visible
  return null;
} 
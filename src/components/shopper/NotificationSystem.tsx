import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Message, toaster, Notification as ToastNotification, Button } from 'rsuite';
import { logger } from '../../utils/logger';

interface Order {
  id: string;
  shopName: string;
  distance: number;
  createdAt: string;
  customerAddress: string;
  // Add other order properties as needed
}

interface BatchAssignment {
  shopperId: string;
  orderId: string;
  assignedAt: number;
}

interface ShopperSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface NotificationSystemProps {
  onNewOrder?: (order: any) => void;
  currentLocation?: { lat: number; lng: number } | null;
  activeShoppers?: Array<{ id: string; name: string }>;
  onAcceptBatch?: (orderId: string) => void;
  onViewBatchDetails?: (orderId: string) => void;  // Add callback for viewing details
}

export default function NotificationSystem({ 
  onNewOrder, 
  currentLocation, 
  activeShoppers = [],
  onAcceptBatch,
  onViewBatchDetails
}: NotificationSystemProps) {
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationTime = useRef<number>(0);
  const batchAssignments = useRef<BatchAssignment[]>([]);
  const lastOrderIds = useRef<Set<string>>(new Set());

  // Initialize audio immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        logger.info('Initializing notification sound...', 'NotificationSystem');
        const audio = new Audio('/notifySound.mp3');
        
        // Set audio properties
        audio.preload = 'auto';
        audio.volume = 1.0;
        audio.autoplay = false;
        
        audio.addEventListener('loadeddata', () => {
          logger.info('Notification sound loaded successfully', 'NotificationSystem');
          setAudioLoaded(true);
          
          audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            logger.info('Audio system enabled', 'NotificationSystem');
          }).catch(error => {
            logger.warn('Initial audio enable failed', 'NotificationSystem', error);
          });
        });

        audio.addEventListener('error', (e) => {
          logger.error('Error loading notification sound', 'NotificationSystem', e);
          setAudioLoaded(false);
        });

        audioRef.current = audio;
        audio.load();

        fetch('/notifySound.mp3')
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            logger.info('Notification sound file exists', 'NotificationSystem');
          })
          .catch(error => {
            logger.error('Could not find notification sound file', 'NotificationSystem', error);
          });

      } catch (error) {
        logger.error('Error initializing notification sound', 'NotificationSystem', error);
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
        
        // Create dummy order objects for permission notifications
        const dummyOrder: Order = {
          id: 'permission',
          shopName: '',
          distance: 0,
          createdAt: new Date().toISOString(),
          customerAddress: permission === 'granted' ? 'You will receive order alerts.' : 'You will still receive in-app notifications.'
        };
        
        if (permission === 'granted') {
          showToast(dummyOrder, 'success');
        } else if (permission === 'denied') {
          showToast(dummyOrder, 'info');
        }
      } catch (error) {
        logger.error('Error requesting notification permission', 'NotificationSystem', error);
      }
    }
  };

  // Helper to format order ID with date
  const formatOrderId = (orderId: string, createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}-${orderId}`;
  };

  const showToast = (order: Order, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    toaster.push(
      <ToastNotification type={type} header="New Batch!" closable duration={60000}>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-col gap-1 text-gray-600">
            <div>{order.customerAddress}</div>
            <div>{order.shopName} ({order.distance}km)</div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button appearance="primary" size="sm" onClick={() => onAcceptBatch?.(order.id)}>
              Accept Batch
            </Button>
            <Button 
              appearance="subtle" 
              size="sm" 
              onClick={() => {
                if (onViewBatchDetails) {
                  onViewBatchDetails(order.id);
                  logger.info('Opening batch details', 'NotificationSystem', { orderId: order.id });
                } else {
                  logger.warn('onViewBatchDetails callback not provided', 'NotificationSystem');
                }
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </ToastNotification>,
      { placement: 'topEnd' }
    );
  };

  const playNotificationSound = async () => {
    logger.info('Attempting to play notification sound...', 'NotificationSystem', {
      audioLoaded,
      audioExists: !!audioRef.current
    });

    try {
      if (!audioRef.current) {
        logger.error('Cannot play sound - Audio not initialized', 'NotificationSystem');
        return;
      }

      if (!audioLoaded) {
        logger.warn('Cannot play sound - Audio not loaded yet', 'NotificationSystem');
        return;
      }

      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;

      logger.info('Playing notification sound...', 'NotificationSystem');
      
      const attemptPlay = async (attempts = 3) => {
        try {
          await audioRef.current?.play();
          logger.info('Notification sound played successfully', 'NotificationSystem');
        } catch (error) {
          logger.warn(`Play attempt failed (${attempts} attempts left)`, 'NotificationSystem', error);
          if (attempts > 0) {
            setTimeout(() => attemptPlay(attempts - 1), 100);
          }
        }
      };

      attemptPlay();

    } catch (error) {
      logger.error('Unexpected error playing sound', 'NotificationSystem', error);
    }
  };

  const showDesktopNotification = (order: Order) => {
    if (window.Notification && window.Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: `${order.customerAddress}\n${order.shopName} (${order.distance}km)`,
        icon: '/app-icon.png',
        badge: '/app-icon.png',
        tag: 'grocery-notification',
        requireInteraction: true,
        silent: true, // We'll handle the sound separately
      };

      const notification = new window.Notification('New Batch!', options);

      notification.onclick = () => {
        window.focus();
        if (onViewBatchDetails) {
          onViewBatchDetails(order.id);
          logger.info('Opening batch details from notification click', 'NotificationSystem', { orderId: order.id });
        }
        notification.close();
      };
    }
  };

  // Check if current time is within shopper's schedule
  const isWithinSchedule = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/shopper/schedule');
      const data = await response.json();
      
      if (!data.schedule || data.schedule.length === 0) {
        logger.info('No schedule found for shopper', 'NotificationSystem');
        return false;
      }

      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

      const todaySchedule = data.schedule.find((s: ShopperSchedule) => s.day_of_week === currentDay);
      
      if (!todaySchedule || !todaySchedule.is_available) {
        logger.info('No schedule or not available for today', 'NotificationSystem');
        return false;
      }

      const isTimeWithinRange = currentTime >= todaySchedule.start_time && 
                               currentTime <= todaySchedule.end_time;

      logger.info('Schedule check:', {
        currentDay,
        currentTime,
        scheduleStart: todaySchedule.start_time,
        scheduleEnd: todaySchedule.end_time,
        isWithinRange: isTimeWithinRange
      });

      return isTimeWithinRange;
    } catch (error) {
      logger.error('Error checking schedule:', error);
      return false;
    }
  };

  // Check if shopper has any active orders
  const hasActiveOrders = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/shopper/activeOrders');
      const data = await response.json();
      
      const hasActive = data.orders && data.orders.length > 0;
      logger.info('Active orders check:', { hasActive, count: data.orders?.length || 0 });
      
      return hasActive;
    } catch (error) {
      logger.error('Error checking active orders:', error);
      return true; // Assume has active orders on error to prevent notifications
    }
  };

  // Check if shopper status is active based on their availability schedule
  const isShopperActive = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/shopper/schedule');
      const data = await response.json();
      
      if (!data.schedule || data.schedule.length === 0) {
        logger.info('No schedule found for shopper', 'NotificationSystem');
        return false;
      }

      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

      const todaySchedule = data.schedule.find((s: ShopperSchedule) => s.day_of_week === currentDay);
      
      if (!todaySchedule) {
        logger.info('No schedule for today', 'NotificationSystem');
        return false;
      }

      if (!todaySchedule.is_available) {
        logger.info('Shopper is not available today', 'NotificationSystem');
        return false;
      }

      const isTimeWithinRange = currentTime >= todaySchedule.start_time && 
                               currentTime <= todaySchedule.end_time;

      logger.info('Schedule check result', 'NotificationSystem', {
        currentDay,
        currentTime,
        scheduleStart: todaySchedule.start_time,
        scheduleEnd: todaySchedule.end_time,
        isWithinRange: isTimeWithinRange
      });

      return isTimeWithinRange;
    } catch (error) {
      logger.error('Error checking shopper availability', 'NotificationSystem', error);
      return false;
    }
  };

  const checkForNewOrders = async () => {
    if (!currentLocation || !session?.user?.id) return;

    const now = new Date();
    const currentTime = now.getTime();

    if (currentTime - lastNotificationTime.current < 60000) {
      logger.info(`Skipping notification check - ${Math.floor((60000 - (currentTime - lastNotificationTime.current)) / 1000)}s until next check`, 'NotificationSystem');
      return;
    }

    const [withinSchedule, noActiveOrders, isActive] = await Promise.all([
      isWithinSchedule(),
      !(await hasActiveOrders()),
      isShopperActive()
    ]);

    if (!withinSchedule) {
      logger.info('Outside scheduled hours, skipping notification check', 'NotificationSystem');
      return;
    }

    if (!noActiveOrders) {
      logger.info('Shopper has active orders, skipping notification check', 'NotificationSystem');
      return;
    }

    if (!isActive) {
      logger.info('Shopper is not active, skipping notification check', 'NotificationSystem');
      return;
    }

    logger.info('All conditions met, checking for pending orders', 'NotificationSystem');

    try {
      const response = await fetch(`/api/shopper/availableOrders?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&maxTravelTime=15`);
      const orders: Order[] = await response.json();

      if (orders.length > 0) {
        logger.info(`Found ${orders.length} pending orders`, 'NotificationSystem');

        // Clean up expired assignments
        batchAssignments.current = batchAssignments.current.filter(
          assignment => currentTime - assignment.assignedAt < 60000
        );

        // Sort and filter orders
        const sortedOrders = [...orders].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const assignedOrderIds = new Set(batchAssignments.current.map(a => a.orderId));
        const availableOrders = sortedOrders.filter(order => !assignedOrderIds.has(order.id));

        if (availableOrders.length > 0) {
          const currentUserAssignment = batchAssignments.current.find(
            assignment => assignment.shopperId === session.user.id
          );

          if (!currentUserAssignment) {
            const nextOrder = availableOrders[0];
            
            const newAssignment: BatchAssignment = {
              shopperId: session.user.id,
              orderId: nextOrder.id,
              assignedAt: currentTime
            };
            batchAssignments.current.push(newAssignment);

            await playNotificationSound();
            showToast(nextOrder);
            showDesktopNotification(nextOrder);

            lastNotificationTime.current = currentTime;
            logger.info(`Showing notification for batch from ${nextOrder.shopName}`, 'NotificationSystem', nextOrder);
          } else {
            logger.info('User already has an active batch assignment, skipping notification', 'NotificationSystem');
          }
        }

        if (onNewOrder) {
          onNewOrder(orders);
        }
      } else {
        logger.info('No pending orders found', 'NotificationSystem');
      }
    } catch (error) {
      logger.error('Error checking for pending orders', 'NotificationSystem', error);
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

    logger.info('🔄 Starting notification system...');
    logger.info('⏰ Will check for pending orders every 60 seconds');

    // Initial check
    checkForNewOrders();

    // Set up interval for checking
    checkInterval.current = setInterval(() => {
      const now = new Date();
      logger.info(`⏰ Interval triggered at ${now.toLocaleTimeString()}`);
      checkForNewOrders();
    }, 60000); // Check every 60 seconds

    setIsListening(true);
  };

  const stopNotificationSystem = () => {
    logger.info('🛑 Stopping notification system');
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
      checkInterval.current = null;
    }
    setIsListening(false);
    lastOrderIds.current.clear();
  };

  // Add a log when the component mounts/unmounts
  useEffect(() => {
    logger.info('📱 NotificationSystem component mounted');
    return () => {
      logger.info('📱 NotificationSystem component unmounting');
    };
  }, []);

  // Add logging for session and location changes
  useEffect(() => {
    if (session?.user && currentLocation) {
      logger.info('🔑 User logged in and location available, starting notification system');
      startNotificationSystem();
    } else {
      logger.info('⚠️ Missing requirements for notification system:', {
        hasUser: !!session?.user,
        hasLocation: !!currentLocation
      });
    }
    return () => stopNotificationSystem();
  }, [session, currentLocation]);

  // The component doesn't render anything visible
  return null;
} 
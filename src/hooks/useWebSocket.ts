import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { websocketManager } from "../utils/websocketManager";

interface WebSocketHook {
  isConnected: boolean;
  sendLocation: (location: { lat: number; lng: number }) => void;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
}

export const useWebSocket = (): WebSocketHook => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Connect using the manager
    websocketManager.connect(session.user.id).then((connected) => {
      setIsConnected(connected);
    });

    // Set up event listeners
    const handleRegistered = (data: any) => {
      // Shopper registered - no logging needed
    };

    const handleNewOrder = (data: any) => {
      window.dispatchEvent(
        new CustomEvent("websocket-new-order", { detail: data })
      );
    };

    const handleBatchOrders = (data: any) => {
      window.dispatchEvent(
        new CustomEvent("websocket-batch-orders", { detail: data })
      );
    };

    const handleOrderExpired = (data: any) => {
      window.dispatchEvent(
        new CustomEvent("websocket-order-expired", { detail: data })
      );
    };

    const handleOrderAccepted = (data: any) => {
      window.dispatchEvent(
        new CustomEvent("websocket-order-accepted", { detail: data })
      );
    };

    const handleOrderRejected = (data: any) => {
      window.dispatchEvent(
        new CustomEvent("websocket-order-rejected", { detail: data })
      );
    };

    // Add event listeners
    websocketManager.on("registered", handleRegistered);
    websocketManager.on("new-order", handleNewOrder);
    websocketManager.on("batch-orders", handleBatchOrders);
    websocketManager.on("order-expired", handleOrderExpired);
    websocketManager.on("order-accepted", handleOrderAccepted);
    websocketManager.on("order-rejected", handleOrderRejected);

    // Update connection state periodically
    const interval = setInterval(() => {
      setIsConnected(websocketManager.isConnected());
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      websocketManager.off("registered", handleRegistered);
      websocketManager.off("new-order", handleNewOrder);
      websocketManager.off("batch-orders", handleBatchOrders);
      websocketManager.off("order-expired", handleOrderExpired);
      websocketManager.off("order-accepted", handleOrderAccepted);
      websocketManager.off("order-rejected", handleOrderRejected);
    };
  }, [session?.user?.id]);

  // Send location update
  const sendLocation = (location: { lat: number; lng: number }) => {
    if (session?.user?.id) {
      websocketManager.sendLocation(location, session.user.id);
    }
  };

  // Accept order
  const acceptOrder = (orderId: string) => {
    if (session?.user?.id) {
      websocketManager.acceptOrder(orderId, session.user.id);
    }
  };

  // Reject order
  const rejectOrder = (orderId: string) => {
    if (session?.user?.id) {
      websocketManager.rejectOrder(orderId, session.user.id);
    }
  };

  return {
    isConnected,
    sendLocation,
    acceptOrder,
    rejectOrder,
  };
};

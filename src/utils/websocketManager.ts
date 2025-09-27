import { io, Socket } from "socket.io-client";
import { logger } from "./logger";

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: Socket | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 2000;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  connect(userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      if (this.isConnecting) {
        resolve(false);
        return;
      }

      this.isConnecting = true;

      this.socket = io(
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://your-domain.com"
          : "http://localhost:3000",
        {
          path: "/api/websocket",
          transports: ["polling", "websocket"],
          timeout: 10000,
          forceNew: false,
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts,
          autoConnect: true,
        }
      );

      this.socket.on("connect", () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Register shopper
        this.socket?.emit("shopper-register", {
          userId,
          location: null,
        });

        resolve(true);
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnecting = false;

        if (reason !== "io client disconnect") {
          this.reconnectAttempts++;
        }
      });

      this.socket.on("connect_error", (error) => {
        this.isConnecting = false;
        resolve(false);
      });

      this.socket.on("registered", (data) => {
        this.emit("registered", data);
      });

      this.socket.on("new-order", (data) => {
        this.emit("new-order", data);
      });

      this.socket.on("batch-orders", (data) => {
        this.emit("batch-orders", data);
      });

      this.socket.on("order-expired", (data) => {
        this.emit("order-expired", data);
      });

      this.socket.on("order-accepted", (data) => {
        this.emit("order-accepted", data);
      });

      this.socket.on("order-rejected", (data) => {
        this.emit("order-rejected", data);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.socket?.connected) {
          this.isConnecting = false;
          resolve(false);
        }
      }, 10000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  sendLocation(location: { lat: number; lng: number }, userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("location-update", { userId, location });
    }
  }

  acceptOrder(orderId: string, userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("accept-order", { orderId, userId });
    }
  }

  rejectOrder(orderId: string, userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("reject-order", { orderId, userId });
    }
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const websocketManager = WebSocketManager.getInstance();

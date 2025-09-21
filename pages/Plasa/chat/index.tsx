"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { Button, Loader, Panel, Placeholder, Avatar } from "rsuite";
import { formatCurrency } from "../../../src/lib/formatCurrency";
import { AuthGuard } from "../../../src/components/AuthGuard";
import ShopperLayout from "@components/shopper/ShopperLayout";
import ShopperChatDrawer from "@components/chat/ShopperChatDrawer";

// Define message interface
interface Message {
  id: string;
  text?: string;
  message?: string;
  senderId: string;
  senderType: "customer" | "shopper";
  recipientId: string;
  timestamp: any;
  read: boolean;
}

// Define conversation interface
interface Conversation {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  order?: {
    id: string;
    OrderID: string;
    total: number;
    status: string;
    delivery_address: string;
    orderedBy?: {
      name: string;
      profile_picture?: string;
    };
    user?: {
      name: string;
      profile_picture?: string;
    };
  };
}

// Helper to display timestamps as relative time ago
function timeAgo(timestamp: any) {
  if (!timestamp) return "";

  const now = new Date().getTime();
  const date =
    timestamp instanceof Timestamp
      ? timestamp.toDate().getTime()
      : new Date(timestamp).getTime();

  const diff = now - date;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
}

// Helper to format order ID with leading zeros
function formatOrderID(id?: string | string[] | number): string {
  if (Array.isArray(id)) {
    id = id[0];
  }
  if (typeof id === "number") {
    id = id.toString();
  }
  if (!id || id === "undefined" || id === "null") return "N/A";
  
  // Convert to string and pad with leading zeros
  const idStr = id.toString();
  
  // If it's a UUID (long string), take the last 6 characters
  if (idStr.length > 6) {
    return `#${idStr.slice(-6).toUpperCase()}`;
  }
  
  // If it's a number, pad with leading zeros to make it 4 digits
  if (/^\d+$/.test(idStr)) {
    return `#${idStr.padStart(4, '0')}`;
  }
  
  // If it's already short, just add the # prefix
  return `#${idStr.toUpperCase()}`;
}

export default function ShopperChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch conversations for the current shopper
  useEffect(() => {
    if (!session?.user?.id) return;

    let unsubscribe: Unsubscribe | null = null;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query conversations where the current user is the shopper
        // Using a simpler query to avoid Firebase index requirements
        const conversationsRef = collection(db, "chat_conversations");
        const q = query(
          conversationsRef,
          where("shopperId", "==", session.user.id)
        );

        unsubscribe = onSnapshot(q, 
          async (snapshot) => {
            const conversationsList: Conversation[] = [];

            for (const doc of snapshot.docs) {
              const data = doc.data();
              
              // Fetch order details for each conversation
              let orderData = null;
              try {
                const orderResponse = await fetch(`/api/shopper/orderDetails?id=${data.orderId}`);
                if (orderResponse.ok) {
                  const orderResult = await orderResponse.json();
                  orderData = orderResult.order;
                }
              } catch (error) {
                console.error("Error fetching order details:", error);
              }


            conversationsList.push({
              id: doc.id,
              orderId: data.orderId,
              customerId: data.customerId,
              customerName: orderData?.orderedBy?.name || orderData?.user?.name || data.customerName || "Customer",
              customerAvatar: orderData?.orderedBy?.profile_picture || orderData?.user?.profile_picture || data.customerAvatar,
              lastMessage: data.lastMessage || "No messages yet",
              lastMessageTime: data.lastMessageTime,
              unreadCount: data.unreadCount || 0,
              order: orderData,
            });
            }

            // Sort conversations by lastMessageTime on the client side
            conversationsList.sort((a, b) => {
              const timeA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate() : new Date(a.lastMessageTime || 0);
              const timeB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate() : new Date(b.lastMessageTime || 0);
              return timeB.getTime() - timeA.getTime();
            });

            setConversations(conversationsList);
            setLoading(false);
          },
          (error) => {
            console.error("Firebase query error:", error);
            setError("Failed to load conversations. Please try again.");
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setError("Failed to load conversations");
        setLoading(false);
      }
    };

    fetchConversations();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [session?.user?.id]);

  // Handle conversation click
  const handleConversationClick = (conversation: Conversation) => {
    if (isMobile) {
      // On mobile, navigate to the individual chat page
      router.push(`/Plasa/chat/${conversation.orderId}`);
    } else {
      // On desktop, open the drawer
      setSelectedConversation(conversation);
      setIsDrawerOpen(true);
    }
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedConversation(null);
  };

  if (status === "loading" || loading) {
    return (
      <ShopperLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader content="Loading conversations..." />
        </div>
      </ShopperLayout>
    );
  }

  if (error) {
    return (
      <ShopperLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Error Loading Conversations
            </h3>
            <p className="mb-4 text-gray-500 dark:text-gray-400">{error}</p>
            <Button
              appearance="primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chat Conversations
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your conversations with customers
          </p>
        </div>

        {conversations.length === 0 ? (
          <Panel
            className="text-center"
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            }}
          >
            <Placeholder.Graph
              style={{ height: 200 }}
              active
              className="mb-4"
            />
            <Placeholder.Paragraph rows={2} />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              No conversations yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You'll see your chat conversations with customers here once you start working on orders.
            </p>
          </Panel>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar
                      src={conversation.customerAvatar}
                      alt={conversation.customerName}
                      circle
                      size="lg"
                    />
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {conversation.customerName}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {timeAgo(conversation.lastMessageTime)}
                        </span>
                        {conversation.order && (
                          <span className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            conversation.order.status === 'delivered' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : conversation.order.status === 'on_the_way'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : conversation.order.status === 'at_customer'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : conversation.order.status === 'pending'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {conversation.order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Order {formatOrderID(conversation.order?.OrderID || conversation.order?.id || conversation.orderId)}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Chat Drawer */}
      {selectedConversation && (
        <ShopperChatDrawer
          orderId={selectedConversation.orderId}
          customer={{
            id: selectedConversation.customerId,
            name: selectedConversation.customerName,
            avatar: selectedConversation.customerAvatar || '/placeholder.svg?height=80&width=80',
            phone: undefined, // We don't have phone in conversation data
          }}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
        />
      )}
    </ShopperLayout>
  );
}

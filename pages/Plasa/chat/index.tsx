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
import { useTheme } from "../../../src/context/ThemeContext";

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
    return `#${idStr.padStart(4, "0")}`;
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
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
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

        unsubscribe = onSnapshot(
          q,
          async (snapshot) => {
            const conversationsList: Conversation[] = [];

            for (const doc of snapshot.docs) {
              const data = doc.data();

              // Fetch order details for each conversation
              let orderData = null;
              try {
                const orderResponse = await fetch(
                  `/api/shopper/orderDetails?id=${data.orderId}`
                );
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
                customerName:
                  orderData?.orderedBy?.name ||
                  orderData?.user?.name ||
                  data.customerName ||
                  "Customer",
                customerAvatar:
                  orderData?.orderedBy?.profile_picture ||
                  orderData?.user?.profile_picture ||
                  data.customerAvatar ||
                  "/images/userProfile.png",
                lastMessage: data.lastMessage || "No messages yet",
                lastMessageTime: data.lastMessageTime,
                unreadCount: data.unreadCount || 0,
                order: orderData,
              });
            }

            // Sort conversations by lastMessageTime on the client side
            conversationsList.sort((a, b) => {
              const timeA = a.lastMessageTime?.toDate
                ? a.lastMessageTime.toDate()
                : new Date(a.lastMessageTime || 0);
              const timeB = b.lastMessageTime?.toDate
                ? b.lastMessageTime.toDate()
                : new Date(b.lastMessageTime || 0);
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
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Messaging Hub
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 opacity-80">
              Syncing Secure Channel
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <div className="h-4 w-4 animate-pulse rounded-full bg-emerald-500" />
          </div>
        </div>

        {conversations.length === 0 ? (
          <div
            className={`rounded-[3rem] border-2 border-dashed p-20 text-center transition-all duration-500 ${
              isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"
            }`}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-emerald-500/10">
              <svg
                className="h-8 w-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight tracking-widest">
              No Signals Detected
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs font-bold uppercase tracking-[0.2em] opacity-30">
              Active conversations will materialize here once you engage with
              customer orders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {conversations.map((conversation) => {
              const orderStatus = conversation.order?.status || "pending";

              // Status Color Logic
              const statusConfig =
                {
                  delivered:
                    "from-emerald-500 to-teal-600 shadow-emerald-500/20",
                  on_the_way: "from-blue-500 to-indigo-600 shadow-blue-500/20",
                  at_customer:
                    "from-amber-500 to-orange-600 shadow-amber-500/20",
                  pending: "from-gray-500 to-slate-600 shadow-gray-500/20",
                }[orderStatus as keyof typeof statusConfig] ||
                "from-gray-500 to-slate-600 shadow-gray-500/20";

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`group relative flex w-full items-center gap-6 rounded-[2.5rem] border p-6 text-left transition-all duration-300 active:scale-[0.98] ${
                    isDark
                      ? "border-white/10 bg-white/5 hover:bg-white/10"
                      : "border-black/5 bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Backdrop Glow */}
                  <div
                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-[80px] transition-all duration-700 group-hover:opacity-20 ${statusConfig}`}
                  />

                  {/* Avatar Section */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={conversation.customerAvatar}
                      alt={conversation.customerName}
                      circle
                      size="lg"
                      className={`ring-2 ${
                        isDark ? "ring-white/10" : "ring-black/5"
                      }`}
                    />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-[var(--bg-primary)] bg-emerald-500 shadow-lg shadow-emerald-500/20">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg">
                        {conversation.unreadCount > 9
                          ? "9+"
                          : conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="truncate text-lg font-black tracking-tight">
                        {conversation.customerName}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        {timeAgo(conversation.lastMessageTime)}
                      </span>
                    </div>

                    <div className="mb-3 flex items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        Order{" "}
                        {formatOrderID(
                          conversation.order?.OrderID ||
                            conversation.order?.id ||
                            conversation.orderId
                        )}
                      </p>
                      <div className="h-1 w-1 rounded-full bg-black/10 dark:bg-white/10" />
                      <span
                        className={`rounded-full bg-gradient-to-br px-3 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-lg ${statusConfig}`}
                      >
                        {orderStatus.replace("_", " ")}
                      </span>
                    </div>

                    <p className="truncate text-sm font-medium leading-relaxed opacity-60">
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {/* Action Arrow */}
                  <div className="-translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isDark ? "bg-white/10" : "bg-black/5"
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
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
            avatar:
              selectedConversation.customerAvatar || "/images/userProfile.png",
            phone: undefined, // We don't have phone in conversation data
          }}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
        />
      )}
    </ShopperLayout>
  );
}

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import RootLayout from "@components/ui/layout";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Loader, Panel, Placeholder, Avatar, Input } from "rsuite";
import { formatCurrency } from "../../src/lib/formatCurrency";

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

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  if (!id) return "0000";
  const s = id.toString();
  return s.length >= 4 ? s : s.padStart(4, "0");
}

// Define conversation interface
interface Conversation {
  id: string;
  orderId: string;
  customerId: string;
  shopperId: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  order?: any;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Fetch conversations and their associated orders
  useEffect(() => {
    // Only fetch if user is authenticated
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;

      console.log("Fetching conversations for user:", userId);

      const fetchConversationsAndOrders = async () => {
        try {
          setLoading(true);

          // Get conversations where the current user is the customer
          const conversationsRef = collection(db, "chat_conversations");

          // Option 1: Remove the orderBy to avoid needing the composite index
          const q = query(
            conversationsRef,
            where("customerId", "==", userId)
            // orderBy removed to avoid needing the composite index
          );

          // Set up real-time listener for conversations
          const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
              console.log(
                "Conversations snapshot received, count:",
                snapshot.docs.length
              );

              // Get conversations and sort them in memory instead
              let conversationList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamp to regular Date if needed
                lastMessageTime:
                  doc.data().lastMessageTime instanceof Timestamp
                    ? doc.data().lastMessageTime.toDate()
                    : doc.data().lastMessageTime,
              })) as Conversation[];

              console.log("Conversations:", conversationList);

              // Sort conversations by lastMessageTime in memory
              conversationList.sort((a, b) => {
                const timeA = a.lastMessageTime
                  ? new Date(a.lastMessageTime).getTime()
                  : 0;
                const timeB = b.lastMessageTime
                  ? new Date(b.lastMessageTime).getTime()
                  : 0;
                return timeB - timeA; // descending order (newest first)
              });

              setConversations(conversationList);

              // Fetch order details for each conversation
              const orderIds = conversationList
                .map((conv) => conv.orderId)
                .filter(
                  (id) => id && typeof id === "string" && id.trim() !== ""
                );

              console.log("Order IDs to fetch:", orderIds);

              // Only fetch orders that we don't already have
              const ordersToFetch = orderIds.filter((id) => !orders[id]);

              if (ordersToFetch.length > 0) {
                console.log("Fetching orders:", ordersToFetch);

                const orderDetailsPromises = ordersToFetch.map(
                  async (orderId) => {
                    try {
                      // Validate UUID format before fetching
                      const uuidRegex =
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                      if (!uuidRegex.test(orderId)) {
                        console.error(`Invalid order ID format: ${orderId}`);
                        return {
                          orderId,
                          order: { error: true, message: "Invalid ID format" },
                        };
                      }

                      const res = await fetch(
                        `/api/queries/orderDetails?id=${orderId}`
                      );

                      // Check if response is ok before trying to parse JSON
                      if (!res.ok) {
                        console.error(
                          `Error fetching order ${orderId}: ${res.status} ${res.statusText}`
                        );
                        return {
                          orderId,
                          order: { error: true, status: res.status },
                        };
                      }

                      const data = await res.json();
                      console.log(`Order ${orderId} data:`, data.order);
                      return { orderId, order: data.order };
                    } catch (error) {
                      console.error(`Error fetching order ${orderId}:`, error);
                      return { orderId, order: { error: true } };
                    }
                  }
                );

                const orderResults = await Promise.all(orderDetailsPromises);
                console.log("Order results:", orderResults);

                // Create a new orders object to avoid mutation
                const newOrders = { ...orders };
                let hasValidOrders = false;

                orderResults.forEach(({ orderId, order }) => {
                  // Store the order data or error placeholder
                  newOrders[orderId] = order || { error: true };
                  if (order && !order.error) {
                    hasValidOrders = true;
                  }
                });

                // Only update state if we have valid orders to prevent unnecessary re-renders
                if (hasValidOrders || Object.keys(orders).length === 0) {
                  setOrders(newOrders);
                }
              }

              setLoading(false);
            },
            (error) => {
              // Handle Firestore listener errors
              console.error("Firestore listener error:", error);
              setLoading(false);
            }
          );

          return unsubscribe;
        } catch (error) {
          console.error("Error fetching conversations:", error);
          setLoading(false);
          return undefined;
        }
      };

      const unsubscribePromise = fetchConversationsAndOrders();
      return () => {
        unsubscribePromise.then((unsubscribe) => {
          if (unsubscribe) {
            unsubscribe();
          }
        });
      };
    }
  }, [session, status]);

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conversation) => {
      // Apply search filter
      if (searchQuery) {
        const order = orders[conversation.orderId];
        const shopName = order?.shop?.name?.toLowerCase() || "";
        const orderNumber = formatOrderID(
          order?.OrderID || conversation.orderId
        ).toLowerCase();
        const messageText = conversation.lastMessage?.toLowerCase() || "";

        const searchLower = searchQuery.toLowerCase();
        return (
          shopName.includes(searchLower) ||
          orderNumber.includes(searchLower) ||
          messageText.includes(searchLower)
        );
      }

      // Apply unread filter
      if (showUnreadOnly) {
        return conversation.unreadCount > 0;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;

      // Sort by time
      if (sortOrder === "newest") {
        return timeB - timeA; // newest first
      } else {
        return timeA - timeB; // oldest first
      }
    });

  // Redirect to chat page for a specific order
  const handleChatClick = (orderId: string) => {
    router.push(`/Messages/${orderId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="max-w-1xl ">
            <h1 className="mb-6 text-2xl font-bold">Messages</h1>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <Placeholder.Paragraph rows={3} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render authentication required
  if (status !== "authenticated") {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-2xl font-bold">Messages</h1>
            <div className="rounded-lg bg-blue-50 p-6 text-center">
              <h2 className="mb-4 text-xl font-semibold text-blue-700">
                Sign in Required
              </h2>
              <p className="mb-6 text-blue-600">
                Please sign in to view your messages.
              </p>
              <Link href="/login" passHref>
                <Button appearance="primary" color="blue">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render empty state
  if (conversations.length === 0) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-2xl font-bold">Messages</h1>
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">
                No Active Conversations
              </h2>
              <p className="mb-6 text-gray-600">
                You don't have any active orders with shoppers to chat with.
              </p>
              <Link href="/CurrentPendingOrders" passHref>
                <Button appearance="primary" color="green">
                  View Your Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render conversations with new UI
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="max-w-1xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Messages</h2>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <Input
                type="text"
                placeholder="Search messages..."
                className="w-64 pl-10"
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex justify-between border-b border-gray-200 p-4">
              <div className="flex space-x-4">
                <Button
                  appearance={!showUnreadOnly ? "primary" : "ghost"}
                  color={!showUnreadOnly ? "green" : undefined}
                  size="sm"
                  onClick={() => setShowUnreadOnly(false)}
                >
                  All Messages
                </Button>
                <Button
                  appearance={showUnreadOnly ? "primary" : "ghost"}
                  color={showUnreadOnly ? "green" : undefined}
                  size="sm"
                  onClick={() => setShowUnreadOnly(true)}
                >
                  Unread
                </Button>
              </div>
              <div>
                <select
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "newest" | "oldest")
                  }
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="oldest">Sort by: Oldest</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No messages match your current filters</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const order = orders[conversation.orderId];
                  const hasUnread = conversation.unreadCount > 0;
                  const hasError = order?.error;

                  return (
                    <Link
                      key={conversation.id}
                      href={`/Messages/${conversation.orderId}`}
                      className="block p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 ${
                            hasError ? "opacity-70" : ""
                          }`}
                        >
                          {order?.shop?.name?.substring(0, 2).toUpperCase() ||
                            "SH"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between">
                            <h3 className="flex items-center font-medium">
                              <span>
                                {hasError
                                  ? "Shop"
                                  : order?.shop?.name || "Shop"}
                              </span>
                              {hasUnread && (
                                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                  New
                                </span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {timeAgo(conversation.lastMessageTime)}
                            </span>
                          </div>

                          <p className="text-sm font-medium">
                            {hasError ? (
                              <span>
                                Order {conversation.orderId.substring(0, 8)}...
                              </span>
                            ) : (
                              <>
                                Order #
                                {formatOrderID(
                                  order?.OrderID || conversation.orderId
                                )}
                              </>
                            )}
                          </p>

                          <p className="truncate text-sm text-gray-600">
                            {conversation.lastMessage || "No messages yet"}
                          </p>

                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            {order && !hasError && (
                              <>
                                <span
                                  className={`
                                  rounded-full px-2 py-0.5
                                  ${
                                    order.status === "shopping"
                                      ? "bg-orange-100 text-orange-800"
                                      : order.status === "on_the_way"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "delivered"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                `}
                                >
                                  {order.status === "shopping"
                                    ? "Shopping"
                                    : order.status === "packing"
                                    ? "Packing"
                                    : order.status === "on_the_way"
                                    ? "On the way"
                                    : order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)}
                                </span>
                                <span className="mx-2">•</span>
                                <span>{formatCurrency(order.total || 0)}</span>
                              </>
                            )}
                            {hasError && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-800">
                                Order details unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {filteredConversations.length > 10 && (
              <div className="border-t border-gray-200 p-4 text-center">
                <Button appearance="ghost" size="sm">
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

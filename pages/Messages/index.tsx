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
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Loader, Panel, Placeholder, Avatar, Input } from "rsuite";
import { formatCurrency } from "../../src/lib/formatCurrency";
import ChatDrawer from '../../src/components/chat/ChatDrawer';
import { isMobileDevice } from '../../src/lib/formatters';

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
  image?: string;
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

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

  // Handle chat click
  const handleChatClick = async (orderId: string) => {
    if (isMobileDevice()) {
      router.push(`/Messages/${orderId}`);
    } else {
      try {
        // Get conversation ID and shopper data
        const conversationsRef = collection(db, "chat_conversations");
        const q = query(conversationsRef, where("orderId", "==", orderId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const conversationDoc = querySnapshot.docs[0];
          const conversationData = conversationDoc.data();
          setConversationId(conversationDoc.id);

          // Get shopper data
          const shopperRef = doc(db, "users", conversationData.shopperId);
          const shopperDoc = await getDoc(shopperRef);
          const shopperData = shopperDoc.data();

          // Set order with shopper data
          const order = orders[orderId];
          setSelectedOrder({
            ...order,
            shopper: {
              id: conversationData.shopperId,
              name: shopperData?.name || "Shopper",
              avatar: shopperData?.avatar || null,
            }
          });
          setIsDrawerOpen(true);
        }
      } catch (error) {
        console.error("Error getting conversation:", error);
      }
    }
  };

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;

    console.log("Setting up message listener for conversation:", conversationId);

    // Set up listener for messages in this conversation
    const messagesRef = collection(
      db,
      "chat_conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Messages snapshot received, count:", snapshot.docs.length);

        const messagesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to regular Date if needed
          timestamp:
            doc.data().timestamp instanceof Timestamp
              ? doc.data().timestamp.toDate()
              : doc.data().timestamp,
        })) as Message[];

        console.log("Processed messages:", messagesList);
        setMessages(messagesList);

        // Mark messages as read if they were sent to the current user
        messagesList.forEach(async (message) => {
          if (message.senderType === "shopper" && !message.read) {
            const messageRef = doc(
              db,
              "chat_conversations",
              conversationId,
              "messages",
              message.id
            );
            await updateDoc(messageRef, { read: true });

            // Update unread count in conversation
            const convRef = doc(db, "chat_conversations", conversationId);
            await updateDoc(convRef, {
              unreadCount: 0,
            });
          }
        });
      },
      (error) => {
        console.error("Error in messages listener:", error);
      }
    );

    return () => unsubscribe();
  }, [conversationId, session?.user?.id]);

  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id || !conversationId || !selectedOrder?.shopper?.id) {
      console.log("Cannot send message, missing data:", {
        hasMessage: !!newMessage.trim(),
        hasUser: !!session?.user?.id,
        hasConversation: !!conversationId,
        hasShopperId: !!selectedOrder?.shopper?.id,
      });
      return;
    }

    try {
      setIsSending(true);

      // Add new message to Firestore
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        message: newMessage.trim(), // Also include message field for compatibility
        senderId: session.user.id,
        senderName: session.user.name || "Customer",
        senderType: "customer",
        recipientId: selectedOrder.shopper.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation with last message
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 1, // Increment unread count for shopper
      });

      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
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
                You don&apos;t have any active orders with shoppers to chat
                with.
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
      <div className="min-h-screen bg-gray-50 p-4 transition-colors duration-200 dark:bg-gray-900 md:ml-16">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center text-gray-700 transition hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-5 w-5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Messages
              </h1>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="max-w-sm rounded-lg border-gray-200 bg-white text-gray-900 transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <Button
              appearance={showUnreadOnly ? "primary" : "ghost"}
              color="green"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="dark:text-gray-300"
            >
              Unread Only
            </Button>
            <Button
              appearance="ghost"
              onClick={() =>
                setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
              }
              className="dark:text-gray-300"
            >
              Sort: {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </Button>
          </div>

          {/* Conversations List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg bg-white p-4 shadow-md transition-colors duration-200 dark:bg-gray-800"
                >
                  <div className="mb-2 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-md transition-colors duration-200 dark:bg-gray-800">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                No Messages
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have any messages yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => {
                const order = orders[conversation.orderId] || {};
                return (
                  <div
                    key={conversation.id}
                    className={`cursor-pointer rounded-lg bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg dark:bg-gray-800 ${
                      conversation.unreadCount > 0
                        ? "border-l-4 border-green-500 dark:border-green-600"
                        : ""
                    }`}
                    onClick={() => handleChatClick(conversation.orderId)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                          Order #
                          {formatOrderID(
                            order?.OrderID || conversation.orderId
                          )}
                          {order?.shop?.name && (
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              - {order.shop.name}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {timeAgo(conversation.lastMessageTime)}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="mt-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white dark:bg-green-600">
                            {conversation.unreadCount} new
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Drawer for Desktop */}
      {selectedOrder && (
        <ChatDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          order={selectedOrder}
          shopper={selectedOrder.shopper}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          isSending={isSending}
          currentUserId={session?.user?.id}
        />
      )}
    </RootLayout>
  );
}

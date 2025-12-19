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
import CustomerChatDrawer from "../../src/components/chat/CustomerChatDrawer";
import { isMobileDevice } from "../../src/lib/formatters";
import { AuthGuard } from "../../src/components/AuthGuard";
import DesktopMessagePage from "../../src/components/messages/DesktopMessagePage";

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

function MessagesPage() {
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
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(
    undefined
  );

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch conversations and their associated orders
  useEffect(() => {
    // Only fetch if user is authenticated
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      console.log(
        "🔍 [User Messages] Fetching conversations for user:",
        userId
      );

      const fetchConversationsAndOrders = async () => {
        try {
          setLoading(true);

          // Get conversations where the current user is either the customer or shopper
          const conversationsRef = collection(db, "chat_conversations");

          // Query for conversations where user is either customer or shopper
          const q = query(
            conversationsRef,
            where("customerId", "==", userId)
            // Note: We might need to also query for shopperId, but for now let's focus on customerId
          );

          console.log("🔍 [User Messages] Query setup:", {
            collection: "chat_conversations",
            filter: "customerId == " + userId,
          });

          // Temporary: Check ALL conversations in Firebase
          const allConversationsRef = collection(db, "chat_conversations");
          const allConversationsQuery = query(allConversationsRef);
          const allConversationsSnapshot = await getDocs(allConversationsQuery);
          console.log(
            "🔍 [User Messages] ALL conversations in Firebase:",
            allConversationsSnapshot.docs.map((doc) => ({
              id: doc.id,
              data: doc.data(),
            }))
          );

          // Set up real-time listener for conversations
          const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
              console.log(
                "🔍 [User Messages] Conversations snapshot received, count:",
                snapshot.docs.length
              );
              console.log(
                "🔍 [User Messages] Snapshot docs:",
                snapshot.docs.map((doc) => ({
                  id: doc.id,
                  data: doc.data(),
                }))
              );

              // Check if any conversations have the current user as customerId
              const userConversations = snapshot.docs.filter(
                (doc) => doc.data().customerId === userId
              );
              console.log(
                "🔍 [User Messages] Conversations for current user:",
                userConversations.length
              );
              console.log("🔍 [User Messages] User ID being searched:", userId);

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

              console.log(
                "🔍 [User Messages] Processed conversations:",
                conversationList
              );

              // Log detailed conversation info
              conversationList.forEach((conv, index) => {
                console.log(`🔍 [User Messages] Conversation ${index + 1}:`, {
                  id: conv.id,
                  orderId: conv.orderId,
                  customerId: conv.customerId,
                  shopperId: conv.shopperId,
                  lastMessage: conv.lastMessage,
                  lastMessageTime: conv.lastMessageTime,
                  unreadCount: conv.unreadCount,
                });
              });

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

              console.log(
                "🔍 [User Messages] Sorted conversations:",
                conversationList
              );

              // Check if the specific conversation from shopper side exists
              const shopperConversationId = "9pHJiDPXzspA7V6P5Mrp";
              const foundConversation = conversationList.find(
                (conv) => conv.id === shopperConversationId
              );
              if (foundConversation) {
                console.log(
                  "🔍 [User Messages] ✅ Found shopper conversation:",
                  foundConversation
                );
              } else {
                console.log(
                  "🔍 [User Messages] ❌ Shopper conversation NOT found. Looking for ID:",
                  shopperConversationId
                );
                console.log(
                  "🔍 [User Messages] Available conversation IDs:",
                  conversationList.map((conv) => conv.id)
                );
              }

              setConversations(conversationList);

              // Fetch order details for each conversation
              const orderIds = conversationList
                .map((conv) => conv.orderId)
                .filter(
                  (id) => id && typeof id === "string" && id.trim() !== ""
                );

              // Only fetch orders that we don't already have
              const ordersToFetch = orderIds.filter((id) => !orders[id]);

              if (ordersToFetch.length > 0) {
                const orderDetailsPromises = ordersToFetch.map(
                  async (orderId) => {
                    try {
                      // Validate UUID format before fetching
                      const uuidRegex =
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                      if (!uuidRegex.test(orderId)) {
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
                        return {
                          orderId,
                          order: { error: true, status: res.status },
                        };
                      }

                      const data = await res.json();
                      return { orderId, order: data.order };
                    } catch (error) {
                      return { orderId, order: { error: true } };
                    }
                  }
                );

                const orderResults = await Promise.all(orderDetailsPromises);

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
              setLoading(false);
            }
          );

          return unsubscribe;
        } catch (error) {
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
  }, [status, session?.user?.id, orders]);

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
    if (isMobile) {
      router.push(`/Messages/${orderId}`);
    } else {
      setSelectedOrderId(orderId);
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
          let order = orders[orderId];

          // If order doesn't have assignedTo data, fetch fresh data
          if (!order?.assignedTo) {
            try {
              const res = await fetch(
                `/api/queries/orderDetails?id=${orderId}`
              );
              if (res.ok) {
                const data = await res.json();
                order = data.order;
              }
            } catch (error) {
              console.error("Error fetching fresh order data:", error);
            }
          }

          const shopperObject = {
            id: conversationData.shopperId,
            name: shopperData?.name || order?.assignedTo?.name || "Shopper",
            avatar:
              shopperData?.avatar ||
              order?.assignedTo?.profile_picture ||
              "/images/ProfileImage.png",
            phone: shopperData?.phone || order?.assignedTo?.phone,
          };

          setSelectedOrder({
            ...order,
            shopper: shopperObject,
          });
          setIsDrawerOpen(true);
        }
      } catch (error) {
        console.error("Error getting conversation:", error);
      }
    }
  };

  // Handle conversation select for desktop
  const handleConversationSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;

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
        const messagesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to regular Date if needed
          timestamp:
            doc.data().timestamp instanceof Timestamp
              ? doc.data().timestamp.toDate()
              : doc.data().timestamp,
        })) as Message[];

        console.log(
          "🔍 [Messages] Received messages:",
          messagesList.length,
          "messages"
        );
        console.log("🔍 [Messages] Messages data:", messagesList);
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
        // Keep this error log for debugging purposes
        console.error("Error in messages listener:", error);
      }
    );

    return () => unsubscribe();
  }, [conversationId, session?.user?.id]);

  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (
      !newMessage.trim() ||
      !session?.user?.id ||
      !conversationId ||
      !selectedOrder?.shopper?.id
    ) {
      return;
    }

    try {
      setIsSending(true);

      console.log("🔍 [User Messages] Sending message:", {
        conversationId,
        text: newMessage.trim(),
        senderId: session.user.id,
        senderType: "customer",
        recipientId: selectedOrder.shopper.id,
      });

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

      console.log("🔍 [User Messages] Message sent successfully");

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
      // Keep this error log for debugging purposes
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <RootLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader content="Loading conversations..." />
        </div>
      </RootLayout>
    );
  }

  // Render authentication required
  if (status !== "authenticated") {
    return (
      <RootLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Authentication Required
            </h3>
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              Please sign in to view your messages.
            </p>
            <Link href="/login" passHref>
              <Button appearance="primary">Sign In</Button>
            </Link>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render empty state
  if (conversations.length === 0) {
    return (
      <RootLayout>
        <div className="mx-auto max-w-7xl p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your conversations with shoppers
            </p>
          </div>
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
              You'll see your chat conversations with shoppers here once you
              place orders.
            </p>
            <div className="mt-4">
              <Link href="/CurrentPendingOrders" passHref>
                <Button appearance="primary" color="green">
                  View Your Orders
                </Button>
              </Link>
            </div>
          </Panel>
        </div>
      </RootLayout>
    );
  }

  // Render desktop view with new component
  if (!isMobile) {
    return (
      <AuthGuard requireAuth={true}>
        <RootLayout>
          <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-100px)] md:ml-16">
            <div className="container mx-auto max-w-8xl h-full">
              <DesktopMessagePage
                conversations={conversations}
                orders={orders}
                loading={loading}
                onConversationSelect={handleConversationSelect}
                selectedOrderId={selectedOrderId}
              />
            </div>
          </div>
        </RootLayout>
      </AuthGuard>
    );
  }

  // Render conversations with new UI (Mobile or when no conversations)
  return (
    <AuthGuard requireAuth={true}>
      <RootLayout>
        <div className="mx-auto max-w-7xl p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your conversations with shoppers
            </p>
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
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
              <Loader content="Loading conversations..." />
            </div>
          ) : conversations.length === 0 ? (
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
                You'll see your chat conversations with shoppers here once you
                place orders.
              </p>
            </Panel>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => {
                const order = orders[conversation.orderId] || {};
                const shopperName =
                  order?.assignedTo?.name || order?.shopper?.name || "Shopper";
                const shopperAvatar =
                  order?.assignedTo?.profile_picture ||
                  order?.shopper?.avatar ||
                  "/images/ProfileImage.png";

                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleChatClick(conversation.orderId)}
                    className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar
                          src={shopperAvatar}
                          alt={shopperName}
                          circle
                          size="lg"
                        />
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {conversation.unreadCount > 9
                              ? "9+"
                              : conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {shopperName}
                          </h3>
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {timeAgo(conversation.lastMessageTime)}
                            </span>
                            {order && (
                              <span
                                className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : order.status === "on_the_way"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : order.status === "at_customer"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : order.status === "pending"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                              >
                                {order.status
                                  ?.replace("_", " ")
                                  .toUpperCase() || "PENDING"}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Order{" "}
                          {formatOrderID(
                            order?.OrderID || order?.id || conversation.orderId
                          )}
                          {order?.shop?.name && (
                            <span className="ml-2">- {order.shop.name}</span>
                          )}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Chat Drawer for Desktop */}
        {selectedOrder && selectedOrder.shopper && (
          <CustomerChatDrawer
            orderId={selectedOrder.id}
            shopper={{
              id: selectedOrder.shopper.id,
              name: selectedOrder.shopper.name,
              avatar: selectedOrder.shopper.avatar,
              phone: selectedOrder.shopper.phone,
            }}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        )}
      </RootLayout>
    </AuthGuard>
  );
}

export default MessagesPage;

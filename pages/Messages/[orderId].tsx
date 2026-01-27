import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Avatar,
  Button,
  Input,
  Loader,
  Panel,
  Dropdown,
  IconButton,
} from "rsuite";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { formatCurrency } from "../../src/lib/formatCurrency";
import { AuthGuard } from "../../src/components/AuthGuard";
import CustomerChatDrawer from "../../src/components/chat/CustomerChatDrawer";
import soundNotification from "../../src/utils/soundNotification";

// Helper to format date for messages
function formatMessageDate(timestamp: any) {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
}

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

// Define message interface
interface Message {
  id: string;
  text?: string; // Customer message format
  message?: string; // Shopper message format (for compatibility)
  senderId: string;
  senderType: "customer" | "shopper";
  recipientId: string;
  timestamp: any;
  read: boolean;
}

// Message component
interface MessageProps {
  message: Message;
  isCurrentUser: boolean;
  senderName: string;
}

const Message: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  senderName,
}) => {
  const messageContent = message.text || message.message || "";

  return (
    <div
      className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      {!isCurrentUser && <Avatar color="blue" circle size="xs" />}
      <div
        className={`max-w-[85%] ${
          isCurrentUser
            ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
            : "bg-blue-100 text-gray-900 dark:bg-blue-900 dark:text-blue-100"
        } rounded-[20px] p-3`}
      >
        {!isCurrentUser && (
          <div className="mb-1 flex gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            {senderName}{" "}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatMessageDate(message.timestamp)}
            </span>
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm">{messageContent}</div>
      </div>
      {isCurrentUser && <Avatar color="green" circle size="xs" />}
    </div>
  );
};

// Chat page component
function ChatPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shopper, setShopper] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Fetch order details
  useEffect(() => {
    if (orderId && status === "authenticated") {
      const fetchOrder = async () => {
        try {
          const res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
          const data = await res.json();

          if (data.order) {
            setOrder(data.order);

            // Fetch shopper details if available
            // The shopper ID might be in assignedTo.id or shopper_id
            const shopperId =
              data.order.assignedTo?.id || data.order.shopper_id;
            if (shopperId) {
              const employeeId = data.order.assignedTo?.shopper?.Employment_id;
              const fullName = data.order.assignedTo?.shopper?.full_name || 
                data.order.assignedTo?.name || 
                "Shopper";
              const displayName = employeeId ? `00${employeeId} ${fullName}` : fullName;
              
              setShopper({
                id: shopperId,
                name: displayName,
                fullName: fullName,
                employeeId: employeeId,
                avatar:
                  data.order.assignedTo?.shopper?.profile_photo ||
                  data.order.assignedTo?.profile_picture ||
                  "/images/ProfileImage.png",
                phone: data.order.assignedTo?.phone,
                email: data.order.assignedTo?.email,
              });

              // Get or create conversation immediately if we have shopper ID
              if (session?.user?.id) {
                getOrCreateConversation(shopperId, data.order.orderedBy?.id);
              }
            } else {
              console.error("No shopper assigned to this order");
            }
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          setError("Error fetching order. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [orderId, status, session?.user?.id]);

  // Get or create conversation
  const getOrCreateConversation = async (
    shopperId: string,
    customerId?: string
  ) => {
    if (!orderId || !session?.user?.id) return;

    // Use the actual customer ID from orderedBy, or fallback to session user ID
    const actualCustomerId = customerId || session.user.id;

    try {
      // Check if conversation exists
      const conversationsRef = collection(db, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderId));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Conversation exists
        const conversationDoc = querySnapshot.docs[0];
        setConversationId(conversationDoc.id);
      } else {
        // Create new conversation
        const newConversation = {
          orderId,
          customerId: actualCustomerId,
          shopperId: shopperId,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        };

        const docRef = await addDoc(conversationsRef, newConversation);
        setConversationId(docRef.id);
      }
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      setError("Error getting/creating conversation. Please try again later.");
    }
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

        // Check for new unread messages from shopper and play sound
        const previousMessageCount = messages.length;
        const newMessages = messagesList.slice(previousMessageCount);
        const newUnreadShopperMessages = newMessages.filter(
          (message) =>
            message.senderType === "shopper" &&
            message.senderId !== session?.user?.id &&
            !message.read
        );

        if (newUnreadShopperMessages.length > 0) {
          soundNotification.play();
        }

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

        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);
      },
      (error) => {
        console.error("Error in messages listener:", error);
        setError("Error in messages listener. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, [conversationId, session?.user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !newMessage.trim() ||
      !session?.user?.id ||
      !conversationId ||
      !shopper?.id
    ) {
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
        text: newMessage.trim(), // Use text field for customer messages
        message: newMessage.trim(), // Also include message field for compatibility
        senderId: session.user.id,
        senderName: session.user.name || "Customer",
        senderType: "customer",
        recipientId: shopper.id,
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

      // Send FCM notification to the shopper
      try {
        const response = await fetch("/api/fcm/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: shopper.id,
            senderName: session.user.name || "Customer",
            message: newMessage.trim(),
            orderId: orderId,
            conversationId: conversationId,
          }),
        });

        if (response.ok) {
          // FCM notification sent successfully
        } else {
          // FCM notification failed (non-critical)
        }
      } catch (fcmError) {
        console.error(
          "⚠️ [Customer Chat] FCM notification error (non-critical):",
          fcmError
        );
      }

      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Error sending message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      {isMobile ? (
        // Mobile: Full-screen chat interface
        <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
          {shopper ? (
            <>
              {/* Mobile Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Link
                    href="/Messages"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={shopper.avatar}
                      alt={shopper.name}
                      circle
                      size="sm"
                    />
                    <div>
                      <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                        {shopper.name}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Order #{formatOrderID(order?.OrderID)}
                      </p>
                    </div>
                  </div>
                </div>
                {shopper.phone && (
                  <button
                    onClick={() => window.open(`tel:${shopper.phone}`, "_self")}
                    className="rounded-full bg-green-500 p-2 text-white hover:bg-green-600"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1 .45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Mobile Messages */}
              <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-2 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-4xl">💬</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Start chatting with your shopper
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderId === session?.user?.id}
                      senderName={
                        message.senderType === "shopper" ? shopper.name : "You"
                      }
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Mobile Input */}
              <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end space-x-3"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:bg-gray-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="flex-shrink-0 rounded-full bg-green-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
                  >
                    {isSending ? (
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src="/assets/logos/PlasIcon.png"
                    alt="Plas Logo"
                    className="h-16 w-16 animate-pulse"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Loading...
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Setting up your chat
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Desktop: Sidebar layout with drawer
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {shopper ? (
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/Messages"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={shopper.avatar}
                        alt={shopper.name}
                        circle
                        size="sm"
                      />
                      <div>
                        <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                          {shopper.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Order #{formatOrderID(order?.OrderID)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="flex-1 overflow-y-auto bg-white px-4 py-3 dark:bg-gray-800">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Order Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {order?.status?.charAt(0).toUpperCase() +
                          order?.status?.slice(1)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(order?.total)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Delivery Address
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {order?.delivery_address}
                      </p>
                    </div>
                    {shopper && (
                      <div>
                        <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Shopper Details
                        </h3>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                          <div className="flex items-start gap-3">
                            <Avatar
                              src={shopper.avatar}
                              alt={shopper.name}
                              circle
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              {shopper.employeeId && (
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                  00{shopper.employeeId}
                                </span>
                              )}
                              <h4 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                {shopper.fullName || shopper.name}
                              </h4>
                              {shopper.email && (
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                  {shopper.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition-all hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              Contact
                            </button>
                            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-all hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              Report
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <img
                      src="/assets/logos/PlasIcon.png"
                      alt="Plas Logo"
                      className="h-16 w-16 animate-pulse"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      Loading...
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Setting up your chat
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Drawer - Desktop Only */}
          {shopper && (
            <CustomerChatDrawer
              orderId={orderId as string}
              shopper={{
                id: shopper.id,
                name: shopper.name,
                avatar: shopper.avatar,
                phone: shopper.phone,
              }}
              isOpen={true}
              onClose={() => router.push("/Messages")}
            />
          )}
        </div>
      )}
    </AuthGuard>
  );
}

// Add this to tell Next.js to use a custom layout
ChatPage.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};

export default ChatPage;

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button, Avatar, Loader } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import ShopperLayout from "@components/shopper/ShopperLayout";
import {
  formatMessageDate,
  formatMessageTime,
} from "../../../src/lib/formatters";
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import { useChat } from "../../../src/context/ChatContext";
import { AuthGuard } from "../../../src/components/AuthGuard";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { formatCurrency } from "../../../src/lib/formatCurrency";
import soundNotification from "../../../src/utils/soundNotification";
import {
  containsBlockedPii,
  getBlockedMessage,
  sanitizeMessageForDisplay,
} from "../../../src/lib/chatPiiBlock";
import { useChatTypingIndicator } from "../../../src/hooks/useChatTypingIndicator";

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

// Pending (optimistic) message before Firebase confirms
interface PendingMessage {
  tempId: string;
  text: string;
  senderId: string;
  senderType: "customer" | "shopper";
  timestamp: Date;
}

// Helper to format order ID
function formatOrderID(id?: string | string[] | number): string {
  if (Array.isArray(id)) {
    id = id[0];
  }
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

function ChatPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user } = useAuth();
  const { theme } = useTheme();
  const { closeChat } = useChat();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<{
    id: string;
    name: string;
    avatar: string;
    lastSeen: string;
  } | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [piiError, setPiiError] = useState<string | null>(null);

  const { otherTypingName, reportTyping, clearTyping } = useChatTypingIndicator({
    conversationId,
    currentUserId: user?.id ?? "",
    currentUserName: user?.name ?? "Shopper",
    enabled: !!conversationId && !!user?.id,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat and fetch customer data
  useEffect(() => {
    if (!orderId || !user?.id) return;

    const fetchOrderAndCustomer = async () => {
      setIsLoading(true);
      try {
        // Single API for regular, reel, and restaurant orders; fallback to business orders
        let res = await fetch(`/api/shopper/orderDetails?id=${orderId}`);
        let data = await res.json();

        // If 404, try business order API (e.g. when opening Message from a business order on mobile)
        if (res.status === 404) {
          res = await fetch(
            `/api/queries/business-order-details?id=${orderId}&forShopper=1`
          );
          data = await res.json();
        }

        if (data.order) {
          setOrder(data.order);
          const o = data.order;

          // Customer: orderedBy (regular/restaurant/business), user (reel), or fallbacks
          const orderedBy = o.orderedBy || o.user;
          const customerId = orderedBy?.id || o.customerId || o.user?.id;
          const customerName = orderedBy?.name || o.customerName || "Customer";

          const customerDataToSet = {
            id: customerId,
            name: customerName,
            avatar: orderedBy?.profile_picture || "/images/userProfile.png",
            lastSeen: "Online now",
          };

          setCustomerData(customerDataToSet);
          if (customerId) {
            await getOrCreateConversation(o.id, customerId);
          }
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderAndCustomer();
  }, [orderId, user?.id]);

  // Get or create conversation
  const getOrCreateConversation = async (
    orderIdStr: string,
    customerId: string
  ) => {
    try {
      // Check if conversation exists
      const conversationsRef = collection(db, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderIdStr));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Conversation exists
        const conversationDoc = querySnapshot.docs[0];
        setConversationId(conversationDoc.id);
      } else {
        // Create new conversation
        const newConversation = {
          orderId: orderIdStr,
          customerId,
          shopperId: user?.id,
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
    }
  };

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

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    // Set up listener for messages in this conversation
    const messagesRef = collection(
      db,
      "chat_conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to regular Date if needed
        timestamp:
          doc.data().timestamp instanceof Timestamp
            ? doc.data().timestamp.toDate()
            : doc.data().timestamp,
      })) as Message[];

      // Remove pending messages that are now confirmed in Firebase
      setPendingMessages((prev) =>
        prev.filter(
          (p) =>
            !messagesList.some(
              (m) =>
                m.senderId === p.senderId &&
                (m.text === p.text || m.message === p.text)
            )
        )
      );

      // Check for new unread messages from customer and play sound
      const previousMessageCount = messages.length;
      const newMessages = messagesList.slice(previousMessageCount);
      const newUnreadCustomerMessages = newMessages.filter(
        (msg) =>
          msg.senderType === "customer" &&
          msg.senderId !== user?.id &&
          !msg.read
      );

      if (newUnreadCustomerMessages.length > 0) {
        console.log(
          "🔊 [Shopper Chat] New unread message from customer, playing notification sound"
        );
        soundNotification.play();
      }

      setMessages(messagesList);

      // Mark messages as read if they were sent to the current user
      messagesList.forEach(async (msg) => {
        if (msg.senderType === "customer" && !msg.read) {
          const messageRef = doc(
            db,
            "chat_conversations",
            conversationId,
            "messages",
            msg.id
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
    });

    return () => unsubscribe();
  }, [conversationId, user?.id]);

  // Scroll to bottom when messages or pending change
  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Combined list for display: server messages + pending (optimistic), sorted by time
  const displayMessages = React.useMemo(() => {
    const pendingAsDisplay: (Message | PendingMessage)[] = pendingMessages.map(
      (p) => ({
        ...p,
        id: p.tempId,
        timestamp: p.timestamp,
      })
    );
    const combined = [...messages, ...pendingAsDisplay];
    combined.sort((a, b) => {
      const tA =
        a.timestamp instanceof Date
          ? a.timestamp.getTime()
          : a.timestamp?.getTime?.() ?? 0;
      const tB =
        b.timestamp instanceof Date
          ? b.timestamp.getTime()
          : b.timestamp?.getTime?.() ?? 0;
      return tA - tB;
    });
    return combined;
  }, [messages, pendingMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!message.trim() || !user?.id || !conversationId || !customerData?.id) {
      return;
    }

    const text = message.trim();
    const piiCheck = containsBlockedPii(text);
    if (piiCheck.blocked && piiCheck.reason) {
      setPiiError(getBlockedMessage(piiCheck.reason));
      return;
    }
    setPiiError(null);

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Optimistic: add to UI immediately with "Sending..." status
    setPendingMessages((prev) => [
      ...prev,
      {
        tempId,
        text,
        senderId: user.id,
        senderType: "shopper",
        timestamp: new Date(),
      },
    ]);
    setMessage("");
    scrollToBottom();

    try {
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text,
        message: text,
        senderId: user.id,
        senderName: user.name || "Shopper",
        senderType: "shopper",
        recipientId: customerData.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
      });

      try {
        await fetch("/api/fcm/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: customerData.id,
            senderName: user.name || "Shopper",
            message: text,
            orderId: orderId,
            conversationId: conversationId,
          }),
        });
      } catch {
        // FCM non-critical
      }
    } catch (error) {
      console.error("❌ [Shopper Chat] Error sending message:", error);
      setPendingMessages((prev) => prev.filter((p) => p.tempId !== tempId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group display messages by date for better display
  const groupMessagesByDate = (list: (Message | PendingMessage)[]) => {
    const groups: { date: string; messages: (Message | PendingMessage)[] }[] =
      [];
    let currentDate = "";
    let currentGroup: (Message | PendingMessage)[] = [];

    list.forEach((msg) => {
      const messageDate = formatMessageDate(msg.timestamp);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDate(displayMessages);

  if (!customerData && isLoading) {
    return (
      <ShopperLayout>
        <div
          className={`flex h-[calc(100vh-200px)] items-center justify-center ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <Loader content="Loading chat..." />
        </div>
      </ShopperLayout>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {isLoading ? (
        <div className="flex h-full flex-col bg-white dark:bg-gray-900">
          {/* Professional Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <Link href="/Plasa" className="flex items-center">
                <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
                </div>
                <div>
                  <div className="mb-1 h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                </div>
              </div>
            </div>
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-900">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Loading chat...
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Please wait while we load the conversation
                </p>
              </div>
            </div>
          </div>

          {/* Professional Message Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-end space-x-3">
              <div className="flex-shrink-0 rounded-full p-2 text-gray-300 dark:text-gray-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="w-full rounded-full border border-gray-200 bg-gray-100 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                </div>
              </div>
              <div className="flex-shrink-0 rounded-full bg-gray-300 p-3 text-gray-400 dark:bg-gray-600">
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
              </div>
            </div>
          </div>
        </div>
      ) : !customerData ? (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-md bg-red-50 p-4">
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="mt-2 text-red-700">Error fetching customer data</p>
            <Button
              appearance="primary"
              color="red"
              className="mt-4"
              onClick={() => router.push("/Plasa")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      ) : !user ? (
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg bg-blue-50 p-6 text-center">
            <h2 className="mb-4 text-xl font-semibold text-blue-700">
              Sign in Required
            </h2>
            <p className="mb-6 text-blue-600">
              Please sign in to view messages.
            </p>
            <Link href="/login" passHref>
              <Button appearance="primary" color="blue">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col bg-white dark:bg-gray-900">
          {/* Professional Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => {
                  closeChat();
                  const id =
                    typeof orderId === "string"
                      ? orderId
                      : Array.isArray(orderId)
                      ? orderId[0]
                      : "";
                  if (id) router.replace(`/Plasa/active-batches/batch/${id}`);
                }}
                aria-label="Back to batch"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={customerData?.avatar || "/images/userProfile.png"}
                    alt={customerData?.name || "Customer"}
                    className="h-10 w-10 rounded-full border-2 border-gray-200 object-cover dark:border-gray-600"
                  />
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {customerData?.name || "Customer"}
                    </h2>
                    {order?.orderType &&
                      order.orderType !== "regular" &&
                      order.orderType !== "combined" && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.orderType === "reel"
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                              : order.orderType === "restaurant"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : order.orderType === "business"
                              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {order.orderType === "reel"
                            ? "Reel order"
                            : order.orderType === "restaurant"
                            ? "Restaurant order"
                            : order.orderType === "business"
                            ? "Business order"
                            : order.orderType}
                        </span>
                      )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order?.address?.street && order?.address?.city
                      ? `${order.address.street}, ${order.address.city}`
                      : order?.customerAddress
                      ? order.customerAddress
                      : order?.deliveryAddress
                      ? order.deliveryAddress
                      : "Address not available"}
                  </p>
                </div>
              </div>
            </div>
            <Link href={`/Plasa/orders/${orderId}`}>
              <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </button>
            </Link>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-900">
            {displayMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start the conversation with your customer
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {otherTypingName && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm dark:bg-gray-800 dark:text-white">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {otherTypingName} is typing
                      </span>
                      <span className="typing-dots ml-1 inline-flex gap-0.5">
                        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-500 [animation-delay:0ms]" />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-500 [animation-delay:150ms]" />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-500 [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                )}
                {displayMessages.map((msg) => {
                  const isShopper = msg.senderType === "shopper";
                  const isPending =
                    "tempId" in msg &&
                    (msg as PendingMessage).tempId.startsWith("temp-");
                  const statusLabel: "Sending..." | "Sent" | null = isShopper
                    ? isPending
                      ? "Sending..."
                      : "Sent"
                    : null;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isShopper ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="flex max-w-[75%] flex-col items-end">
                        {!isShopper && (
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {customerData?.name || "Customer"}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatMessageTime(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            isShopper
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {sanitizeMessageForDisplay(
                              ("text" in msg
                                ? msg.text
                                : (msg as Message).text ||
                                  (msg as Message).message) ?? ""
                            )}
                          </p>
                          {isShopper && (
                            <div className="mt-1 flex items-center justify-end space-x-1">
                              <span className="text-xs text-green-100">
                                {formatMessageTime(msg.timestamp)}
                              </span>
                              {!isPending && (
                                <svg
                                  className="h-3 w-3 text-green-100"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                        {isShopper && statusLabel && (
                          <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {statusLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* PII block error */}
          {piiError && (
            <div className="border-t border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/30">
              <p className="text-xs text-red-600 dark:text-red-400">{piiError}</p>
            </div>
          )}
          {/* Professional Message Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <form
              onSubmit={handleSendMessage}
              className="flex items-end space-x-3"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    reportTyping();
                  }}
                  onBlur={clearTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:bg-gray-600"
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim()}
                className="flex-shrink-0 rounded-full bg-green-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
              >
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
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;

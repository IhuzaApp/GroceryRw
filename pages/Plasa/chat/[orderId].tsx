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
import { useShopperProfile } from "../../../src/hooks/useShopperProfile";
import { useTheme } from "../../../src/context/ThemeContext";
import { useChat } from "../../../src/context/ChatContext";

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

import { ShopperChatSkeleton } from "../../../src/components/chat/ShopperChatSkeleton";
import { ShopperChatHeader } from "../../../src/components/chat/ShopperChatHeader";
import { ShopperChatMessage } from "../../../src/components/chat/ShopperChatMessage";
import { ShopperChatSidebar } from "../../../src/components/chat/ShopperChatSidebar";
import { ShopperChatInput } from "../../../src/components/chat/ShopperChatInput";

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
  const { shopper } = useShopperProfile();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
    phone?: string;
  } | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [piiError, setPiiError] = useState<string | null>(null);

  const { otherTypingName, reportTyping, clearTyping } = useChatTypingIndicator(
    {
      conversationId,
      currentUserId: user?.id ?? "",
      currentUserName: user?.name ?? "Shopper",
      enabled: !!conversationId && !!user?.id,
    }
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            phone: orderedBy?.phone || o.customerPhone,
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
  }, [orderId, user?.id, shopper?.id]);

  // Get or create conversation
  const getOrCreateConversation = async (
    orderIdStr: string,
    customerId: string
  ) => {
    try {
      if (!db) return;
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
        // Use shopper.id if available, fallback to user.id
        const shopperId = shopper?.id || user?.id;

        const newConversation = {
          orderId: orderIdStr,
          customerId,
          shopperId,
          shopperUserId: user?.id,
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

    if (!db) return;

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
          msg.senderId !== (shopper?.id || user?.id) &&
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
        if (msg.senderType === "customer" && !msg.read && db) {
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
    const pendingAsDisplay = pendingMessages.map(
      (p) => ({
        ...p,
        id: p.tempId,
        timestamp: p.timestamp,
      })
    );
    const combined = [...messages, ...pendingAsDisplay] as any[];
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
    const senderId = shopper?.id || user.id!;

    setPendingMessages((prev) => [
      ...prev,
      {
        tempId,
        text,
        senderId,
        senderType: "shopper",
        timestamp: new Date(),
      },
    ]);
    setMessage("");
    scrollToBottom();

    try {
      if (!db) return;
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      const senderId = shopper?.id || user.id;

      await addDoc(messagesRef, {
        text,
        message: text,
        senderId,
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
      console.error("\u274c [Shopper Chat] Error sending message:", error);
      setPendingMessages((prev) => prev.filter((p) => p.tempId !== tempId));
    }
  };

  if (!customerData && isLoading) {
    return <ShopperChatSkeleton isDark={isDark} />;
  }

  if (!customerData && !isLoading) {
    return (
      <ShopperLayout>
        <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
             <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-xl font-black uppercase tracking-widest">Conversation not found</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xs">We couldn't find the order details for this conversation. It may have been archived or deleted.</p>
          <button 
            onClick={() => router.replace('/Plasa/chat')}
            className="mt-8 rounded-full bg-black px-8 py-3 text-sm font-bold text-white transition-transform active:scale-95 dark:bg-white dark:text-black"
          >
            Back to Chats
          </button>
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div className="flex h-full w-full overflow-hidden bg-[var(--bg-primary)]">
        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col bg-gray-50 dark:bg-black/40">
          <ShopperChatHeader
            orderId={orderId as string}
            customerData={customerData}
            isMobile={isMobile}
          />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scroll-smooth p-6">
            <div className="mx-auto max-w-4xl space-y-8">
              {displayMessages.map((msg, idx) => {
                const isMe =
                  msg.senderId === (shopper?.id || user?.id);
                const isPending = "tempId" in msg && (msg as PendingMessage).tempId.startsWith("temp-");
                const isRead = !isPending && (msg as Message).read;
                
                const showDate = idx === 0 || formatMessageDate(msg.timestamp) !== formatMessageDate(displayMessages[idx-1].timestamp);

                return (
                  <ShopperChatMessage
                    key={msg.id}
                    msg={msg}
                    isDark={isDark}
                    isMe={isMe}
                    isPending={isPending}
                    isRead={isRead}
                    showDate={showDate}
                  />
                );
              })}
              {otherTypingName && (
                <div className="flex justify-start">
                   <div className="flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 dark:bg-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{otherTypingName} is typing</span>
                      <span className="flex gap-0.5"><span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500" /><span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" /><span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" /></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <ShopperChatInput
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            reportTyping={reportTyping}
            clearTyping={clearTyping}
            piiError={piiError}
          />
        </div>

        <ShopperChatSidebar
          orderId={orderId as string}
          order={order}
          customerData={customerData}
          formatOrderID={formatOrderID}
        />
      </div>
    </ShopperLayout>
  );
}

export default ChatPage;

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
        senderId: user.id!,
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

  // Premium Skeleton Loader
  const ChatSkeleton = () => (
    <div className={`flex h-screen w-screen flex-col ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
      <div className={`flex items-center gap-4 border-b px-6 py-4 ${isDark ? "border-white/10" : "border-black/5"}`}>
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        </div>
      </div>
      <div className="flex-1 space-y-8 p-6">
        <div className="flex items-end gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-16 w-48 animate-pulse rounded-2xl rounded-bl-none bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="flex flex-row-reverse items-end gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-20 w-64 animate-pulse rounded-2xl rounded-br-none bg-emerald-500/10" />
        </div>
        <div className="flex items-end gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 w-40 animate-pulse rounded-2xl rounded-bl-none bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <div className="p-6">
        <div className="h-14 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );

  if (!customerData && isLoading) {
    return <ChatSkeleton />;
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-white/50 p-4 backdrop-blur-md dark:border-white/5 dark:bg-black/50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/Plasa/chat")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 transition-all active:scale-90 dark:bg-white/5"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <div className="flex items-center gap-3">
                <Avatar
                  src={customerData?.profile_picture || customerData?.avatar}
                  circle
                  size={isMobile ? "sm" : "md"}
                  className="ring-2 ring-emerald-500/20"
                />
                <div>
                  <h2 className="text-sm font-black tracking-tight md:text-base">
                    {customerData?.name || "Customer"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                      Active Now
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link href={`/Plasa/orders/${orderId}`}>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 transition-transform active:scale-90 dark:bg-white/5" title="Order Details">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </Link>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scroll-smooth p-6">
            <div className="mx-auto max-w-4xl space-y-8">
              {displayMessages.map((msg, idx) => {
                const isMe = msg.senderType === "shopper";
                const isPending = "tempId" in msg && (msg as PendingMessage).tempId.startsWith("temp-");
                const isRead = !isPending && (msg as Message).read;
                
                const showDate = idx === 0 || formatMessageDate(msg.timestamp) !== formatMessageDate(displayMessages[idx-1].timestamp);

                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex items-center gap-4 py-4">
                        <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">{formatMessageDate(msg.timestamp)}</span>
                        <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`group relative max-w-[80%] rounded-3xl px-5 py-3 shadow-sm transition-all duration-300 md:max-w-[60%] ${
                        isMe
                          ? "rounded-br-none bg-emerald-500 text-white shadow-emerald-500/20"
                          : isDark
                          ? "rounded-bl-none border border-white/5 bg-white/5 text-gray-100 backdrop-blur-md"
                          : "rounded-bl-none border border-black/5 bg-white text-gray-900"
                      }`}>
                        <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                          {sanitizeMessageForDisplay(("text" in msg ? msg.text : (msg as Message).text || (msg as Message).message) ?? "")}
                        </div>
                        <div className={`mt-1.5 flex items-center gap-2 opacity-40 transition-opacity group-hover:opacity-100 ${isMe ? "justify-end text-white" : ""}`}>
                          {isMe && (
                            <span className="text-[8px] font-black uppercase tracking-tighter">
                              {isPending ? "Sending..." : isRead ? "Read" : "Sent"}
                            </span>
                          )}
                          <span className="text-[8px] font-black">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
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

          {/* Input Area */}
          <div className="p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
              <form
                onSubmit={handleSendMessage}
                className="relative flex items-center gap-3"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      reportTyping();
                    }}
                    onBlur={clearTyping}
                    placeholder="Type a message..."
                    className="w-full rounded-[2rem] bg-white px-6 py-4 text-sm font-medium outline-none shadow-sm transition-all focus:shadow-md dark:bg-white/5 dark:focus:bg-white/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                >
                  <svg className="h-6 w-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
              {piiError && (
                <p className="mt-3 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                  {piiError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Order Details (Desktop only) */}
        {!isMobile && (
          <div className="hidden w-80 flex-col border-l border-gray-100 bg-white dark:border-gray-800 dark:bg-black/20 xl:flex">
             <div className="p-6">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-30 mb-8">Order Summary</h2>
                
                {/* Status Card */}
                <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-white/5 mb-8">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Current Status</span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                   </div>
                   <h3 className="text-xl font-black mb-1">#{formatOrderID(orderId)}</h3>
                   <p className="text-xs opacity-50 font-bold">{formatCurrency(order?.Total_Amount || 0)} • {order?.Order_Items?.length || 0} items</p>
                </div>

                {/* Details Sections */}
                <div className="space-y-8">
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">Customer Info</h4>
                      <div className="flex items-center gap-4">
                         <Avatar src={customerData?.profile_picture || customerData?.avatar} circle size="md" className="ring-2 ring-emerald-500/10" />
                         <div>
                            <p className="text-sm font-black">{customerData?.name || "Customer"}</p>
                            <p className="text-[10px] font-bold opacity-40">{customerData?.phone || "No phone provided"}</p>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">Delivery To</h4>
                      <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                         <p className="text-xs leading-relaxed font-medium opacity-60">{order?.delivery_address || "No address specified"}</p>
                      </div>
                   </div>

                   <Link href={`/Plasa/orders/${orderId}`}>
                      <button className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                         Manage Order
                      </button>
                   </Link>
                </div>
             </div>
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}

export default ChatPage;

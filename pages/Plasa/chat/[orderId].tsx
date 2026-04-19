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
        <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center mb-4">
             <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 opacity-80">Establishing Secure Channel</p>
        </div>
      </ShopperLayout>
    );
  }

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col transition-all duration-500 ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
      {/* Premium Floating Header */}
      <div className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b backdrop-blur-3xl transition-all duration-300 ${
        isDark ? "bg-black/40 border-white/10" : "bg-white/40 border-black/5"
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const id = typeof orderId === "string" ? orderId : Array.isArray(orderId) ? orderId[0] : "";
              if (id) router.replace(`/Plasa/active-batches/batch/${id}`);
            }}
            className={`group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
              isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                src={customerData?.avatar || "/images/userProfile.png"}
                alt={customerData?.name || "Customer"}
                circle
                size="md"
                className={`ring-2 ${isDark ? "ring-emerald-500/20" : "ring-emerald-600/20"}`}
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-primary)] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              </span>
            </div>
            
            <div>
              <h2 className="text-base font-black tracking-tight leading-none uppercase tracking-widest">{customerData?.name || "Customer"}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-80">Order #{formatOrderID(orderId)}</p>
              </div>
            </div>
          </div>
        </div>

        <Link href={`/Plasa/orders/${orderId}`}>
          <button className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${
            isDark ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" : "bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-900"
          }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19V5l12 7-12 7z" />
            </svg>
          </button>
        </Link>
      </div>


      {/* Messages Stream */}
      <div className={`flex-1 overflow-y-auto px-6 py-6 space-y-8 scroll-smooth ${isDark ? "bg-black/20" : "bg-white/10"}`}>
        {messageGroups.map((group, groupIndex) => (
          <div key={group.date} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">{group.date}</span>
              <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
            </div>

            {group.messages.map((msg) => {
              const isShopper = msg.senderType === "shopper";
              const isPending = "tempId" in msg && (msg as PendingMessage).tempId.startsWith("temp-");
              const content = sanitizeMessageForDisplay(("text" in msg ? msg.text : (msg as Message).text || (msg as Message).message) ?? "");

              return (
                <div key={msg.id} className={`flex items-end gap-2.5 ${isShopper ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0 mb-1">
                    <Avatar
                      src={isShopper ? (user?.profile_picture || "/images/userProfile.png") : (customerData?.avatar || "/images/userProfile.png")}
                      circle
                      size="sm"
                      className={`ring-2 ${isShopper ? "ring-emerald-500/20" : "ring-gray-400/20"}`}
                    />
                  </div>

                  <div className={`flex max-w-[85%] flex-col ${isShopper ? "items-end" : "items-start"}`}>
                    <div className={`relative overflow-hidden rounded-[1.5rem] px-4 py-3 shadow-lg transition-all duration-300 ${
                      isShopper
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-none shadow-emerald-500/20"
                        : isDark
                        ? "bg-white/5 border border-white/5 text-gray-100 rounded-bl-none backdrop-blur-md"
                        : "bg-white border border-black/5 text-gray-900 rounded-bl-none shadow-sm shadow-black/5"
                    }`}>
                      <div className="whitespace-pre-wrap text-sm font-medium leading-[1.6]">
                        {content}
                      </div>
                    </div>
                    
                    <div className="mt-1.5 flex items-center gap-2 px-1 opacity-40">
                       {isShopper && (
                         <span className="text-[10px] font-bold uppercase tracking-tighter">
                           {isPending ? "Sending..." : "Sent"}
                         </span>
                       )}
                       <span className="text-[9px] font-bold">
                         {formatMessageTime(msg.timestamp)}
                       </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {otherTypingName && (
          <div className="flex justify-start">
            <div className={`rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-3 ${
              isDark ? "bg-white/5 text-gray-300" : "bg-black/5 text-gray-600"
            } backdrop-blur-md`}>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                {otherTypingName} is typing
              </span>
              <span className="typing-dots flex gap-0.5">
                <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-10" />
      </div>

      {/* Floating Aura Input */}
      <div className={`p-6 border-t backdrop-blur-xl transition-all duration-300 ${
        isDark ? "bg-black/40 border-white/10" : "bg-white/40 border-black/5"
      }`}>
        <form
          onSubmit={handleSendMessage}
          className={`group relative flex items-center gap-2 rounded-[2rem] p-1.5 transition-all duration-300 ${
            isDark ? "bg-white/5 focus-within:bg-white/10" : "bg-black/5 focus-within:bg-black/10"
          }`}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              reportTyping();
            }}
            onBlur={clearTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="flex-shrink-0 rounded-full bg-emerald-600 p-3 text-white shadow-lg transition-all duration-300 hover:bg-emerald-500 hover:scale-110 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-45 transform">
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        
        {piiError && (
          <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-2.5 border border-red-500/20 animate-pulse">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{piiError}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
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
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import soundNotification from "../../utils/soundNotification";
import {
  containsBlockedPii,
  getBlockedMessage,
  sanitizeMessageForDisplay,
} from "../../lib/chatPiiBlock";
import { useTheme } from "../../context/ThemeContext";
import { useShopperProfile } from "../../hooks/useShopperProfile";
import { useChatTypingIndicator } from "../../hooks/useChatTypingIndicator";

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

// Pending (optimistic) message before Firebase confirms
interface PendingMessage {
  tempId: string;
  text: string;
  senderId: string;
  senderType: "customer" | "shopper";
  timestamp: Date;
}

// Message component for shoppers
interface MessageProps {
  message: Message | PendingMessage;
  isCurrentUser: boolean;
  customerName: string;
  shopperImage?: string;
  statusLabel?: "Sending..." | "Sent" | null;
}

const ShopperMessage: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  customerName,
  shopperImage,
  statusLabel,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const rawContent =
    "text" in message
      ? message.text
      : (message as Message).text || (message as Message).message || "";
  const messageContent = sanitizeMessageForDisplay(rawContent);

  return (
    <div
      className={`mb-6 flex items-end gap-3 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="flex-shrink-0 mb-1">
        <Avatar
          src={isCurrentUser ? shopperImage : "/images/userProfile.png"}
          alt={isCurrentUser ? "Me" : customerName}
          circle
          size="sm"
          className={`ring-2 ${
            isCurrentUser
              ? "ring-emerald-500/20"
              : "ring-gray-400/20"
          }`}
        >
          {isCurrentUser ? "ME" : customerName[0].toUpperCase()}
        </Avatar>
      </div>

      <div
        className={`flex max-w-[85%] flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-[1.5rem] px-5 py-3.5 shadow-xl transition-all duration-300 ${
            isCurrentUser
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-none shadow-emerald-500/20"
              : isDark
              ? "bg-white/5 border border-white/5 text-gray-100 rounded-bl-none backdrop-blur-md"
              : "bg-white border border-black/5 text-gray-900 rounded-bl-none shadow-sm shadow-black/5"
          }`}
        >
          {!isCurrentUser && (
            <div
              className={`mb-1.5 text-[9px] font-black uppercase tracking-[0.2em] ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              {customerName}
            </div>
          )}
          <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
            {messageContent}
          </div>
        </div>
        
        <div className="mt-2 flex items-center gap-2 px-1 opacity-40">
           {isCurrentUser && statusLabel && (
             <span className="text-[9px] font-black uppercase tracking-tighter">
               {statusLabel}
             </span>
           )}
           <span className="text-[9px] font-black uppercase tracking-widest">
             {message.timestamp && formatMessageTime(message.timestamp)}
           </span>
        </div>
      </div>
    </div>
  );
};

// Shopper Chat Drawer Props
interface ShopperChatDrawerProps {
  orderId: string;
  customer: {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ShopperChatDrawer: React.FC<ShopperChatDrawerProps> = ({
  orderId,
  customer,
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();
  const { profileImage: databaseProfileImage } = useShopperProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { otherTypingName, reportTyping, clearTyping } = useChatTypingIndicator(
    {
      conversationId,
      currentUserId: session?.user?.id ?? "",
      currentUserName: session?.user?.name ?? "Shopper",
      enabled: !!conversationId && !!session?.user?.id && isOpen,
    }
  );

  useEffect(() => {
    if (!isOpen) clearTyping();
  }, [isOpen, clearTyping]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get or create conversation
  const getOrCreateConversation = async () => {
    if (!orderId || !session?.user?.id || !customer?.id) return;

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
          customerId: customer.id,
          shopperId: session.user.id,
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

        // Remove pending messages that are now confirmed in Firebase (same text + senderId)
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
          (message) =>
            message.senderType === "customer" &&
            message.senderId !== session?.user?.id &&
            !message.read
        );

        if (newUnreadCustomerMessages.length > 0) {
          soundNotification.play();
        }

        setMessages(messagesList);

        // Mark messages as read if they were sent to the current user (shopper)
        messagesList.forEach(async (message) => {
          if (message.senderType === "customer" && !message.read) {
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

  // Scroll to bottom when messages or pending change
  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingMessages]);

  // Initialize conversation when drawer opens
  useEffect(() => {
    if (isOpen && orderId && customer?.id) {
      getOrCreateConversation();
    }
  }, [isOpen, orderId, customer?.id]);

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

  // Handle sending a new message (optimistic: show immediately with "Sending...", then "Sent" when confirmed)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !newMessage.trim() ||
      !session?.user?.id ||
      !conversationId ||
      !customer?.id
    ) {
      return;
    }

    const text = newMessage.trim();
    const piiCheck = containsBlockedPii(text);
    if (piiCheck.blocked && piiCheck.reason) {
      setError(getBlockedMessage(piiCheck.reason));
      return;
    }
    setError(null);

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Optimistic: add to UI immediately with "Sending..." status
    setPendingMessages((prev) => [
      ...prev,
      {
        tempId,
        text,
        senderId: session.user.id,
        senderType: "shopper",
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");
    scrollToBottom();

    try {
      // Add new message to Firestore
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text,
        message: text,
        senderId: session.user.id,
        senderName: session.user.name || "Shopper",
        senderType: "shopper",
        recipientId: customer.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation with last message
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadCount: 1, // Increment unread count for customer
      });

      // Send FCM notification to the customer
      try {
        await fetch("/api/fcm/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: customer.id,
            senderName: session.user.name || "Shopper",
            message: text,
            orderId: orderId,
            conversationId: conversationId,
          }),
        });
      } catch {
        // FCM non-critical
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error sending message. Please try again later.");
      setPendingMessages((prev) => prev.filter((p) => p.tempId !== tempId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed right-0 top-16 z-[1000] hidden flex-col overflow-hidden rounded-l-[2.5rem] border-0 transition-all duration-500 ease-in-out shadow-2xl md:flex md:h-[calc(100vh-4rem)] md:w-[42rem] ${
        isDark 
          ? "bg-[#0A0A0A]/80 border-l border-white/10" 
          : "bg-white/80 border-l border-black/5"
      } backdrop-blur-3xl`}
    >
      {/* Header */}
      <div className={`flex flex-shrink-0 items-center justify-between px-6 py-5 border-b ${
        isDark ? "border-white/10" : "border-black/5"
      }`}>
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            onClick={onClose}
            className={`flex-shrink-0 rounded-full p-2 transition-all hover:scale-110 active:scale-90 ${
              isDark ? "bg-white/5 text-gray-400 hover:text-white" : "bg-black/5 text-gray-500 hover:text-gray-900"
            }`}
            aria-label="Close chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative flex-shrink-0">
            <Avatar
              src={customer.avatar}
              alt={customer.name}
              circle
              size="md"
              className={`ring-2 ${isDark ? "ring-emerald-500/20" : "ring-emerald-600/20"}`}
            />
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-primary)] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              title="Online"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75"></span>
            </span>
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-black tracking-tight text-[var(--text-primary)] uppercase tracking-widest">
              {customer.name}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 opacity-80">
              Customer
            </p>
          </div>
        </div>
        
        {customer.phone && (
          <a
            href={`tel:${customer.phone}`}
            className="flex-shrink-0 rounded-full bg-emerald-500/10 p-3 text-emerald-500 transition-all hover:bg-emerald-500 hover:text-white hover:scale-110 active:scale-90 shadow-inner"
            aria-label="Call customer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1 .45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={`flex-1 overflow-y-auto px-6 py-6 scroll-smooth ${isDark ? "bg-black/20" : "bg-white/10"}`}>
          {otherTypingName && (
            <div className="mb-6 flex justify-start">
              <div className={`rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 ${
                isDark ? "bg-white/5 text-gray-300" : "bg-black/5 text-gray-600"
              } backdrop-blur-md`}>
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {otherTypingName} is typing
                </span>
                <span className="typing-dots flex gap-1">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          
          {displayMessages.length === 0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center px-10">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-emerald-500/10 shadow-inner">
                  <svg className="h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-base font-black tracking-tight text-[var(--text-primary)] uppercase tracking-wide">Secure Channel</h4>
                <p className="mt-2 text-xs font-medium text-[var(--text-secondary)] opacity-60 leading-relaxed">
                  Start your conversation with {customer.name}. Messages are encrypted and safe.
                </p>
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map((message) => {
                const isCurrentUser = message.senderId === session?.user?.id;
                const isPending =
                  "tempId" in message && message.tempId.startsWith("temp-");
                const statusLabel: "Sending..." | "Sent" | null = isCurrentUser
                  ? isPending
                    ? "Sending..."
                    : "Sent"
                  : null;
                return (
                  <ShopperMessage
                    key={message.id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    customerName={customer.name}
                    shopperImage={databaseProfileImage || session?.user?.image || undefined}
                    statusLabel={statusLabel}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className={`flex-shrink-0 p-6 border-t ${
          isDark ? "border-white/10" : "border-black/5"
        }`}>
          <form
            onSubmit={handleSendMessage}
            className={`relative flex items-center gap-2 rounded-[1.5rem] p-1.5 transition-all duration-300 ${
              isDark ? "bg-white/5 focus-within:bg-white/10" : "bg-black/5 focus-within:bg-black/10"
            }`}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                reportTyping();
              }}
              onBlur={clearTyping}
              onKeyPress={handleKeyPress}
              placeholder="Message..."
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex-shrink-0 rounded-[1.2rem] bg-emerald-600 p-2.5 text-white shadow-lg transition-all duration-300 hover:bg-emerald-500 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
              aria-label="Send message"
            >
              <svg className="h-5 w-5 rotate-45 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          
          {error && (
            <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-2 border border-red-500/20">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopperChatDrawer;

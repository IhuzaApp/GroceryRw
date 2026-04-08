import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar, Input } from "rsuite";
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
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import soundNotification from "../../utils/soundNotification";
import {
  containsBlockedPii,
  getBlockedMessage,
  sanitizeMessageForDisplay,
} from "../../lib/chatPiiBlock";
import { useChatTypingIndicator } from "../../hooks/useChatTypingIndicator";
import { useTheme } from "../../context/ThemeContext";
import { ChatCollection } from "../../services/chatService";

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
  senderType: "customer" | "shopper" | "business";
  recipientId?: string;
  timestamp: any;
  read?: boolean;
}

// Pending (optimistic) message before Firebase confirms
interface PendingMessage {
  tempId: string;
  text: string;
  senderId: string;
  senderType: "customer" | "shopper" | "business";
  timestamp: Date;
}

// Message component for customers
interface MessageProps {
  message: Message | PendingMessage;
  isCurrentUser: boolean;
  counterpartName: string;
  statusLabel?: "Sending..." | "Sent" | null;
}

const CustomerMessage: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  counterpartName,
  statusLabel,
}) => {
  const rawContent =
    "text" in message
      ? message.text
      : (message as Message).text || (message as Message).message || "";
  const messageContent = sanitizeMessageForDisplay(rawContent ?? "");

  return (
    <div
      className={`mb-4 flex gap-3 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && (
        <div className="relative flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm ring-2 ring-emerald-500/20 dark:ring-emerald-400/10">
            <span className="text-sm font-bold uppercase text-white">
              {counterpartName.charAt(0)}
            </span>
          </div>
        </div>
      )}
      <div
        className={`flex max-w-[75%] flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all ${
            isCurrentUser
              ? "rounded-2xl rounded-br-none bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-emerald-500/20"
              : "rounded-2xl rounded-bl-none border border-emerald-500/10 bg-emerald-500/5 text-gray-900 shadow-none dark:text-gray-100"
          }`}
        >
          {!isCurrentUser && (
            <div className="mb-1 text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
              {counterpartName}
            </div>
          )}
          <div className="whitespace-pre-wrap font-medium">
            {messageContent}
          </div>
        </div>
        {isCurrentUser && statusLabel && (
          <span className="mt-1.5 text-[11px] font-bold tracking-wide text-gray-400 dark:text-gray-500">
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
};

// Customer Chat Drawer Props
interface CustomerChatDrawerProps {
  orderId?: string;
  conversationId?: string;
  collectionPath?: ChatCollection;
  counterpart: {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
    role?: "shopper" | "business" | "customer";
  };
  isOpen: boolean;
  onClose: () => void;
}

const CustomerChatDrawer: React.FC<CustomerChatDrawerProps> = ({
  orderId,
  conversationId: providedConversationId,
  collectionPath = "chat_conversations",
  counterpart,
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const { data: session } = useSession();
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
      currentUserName: session?.user?.name ?? "Customer",
      enabled: !!conversationId && !!session?.user?.id && isOpen,
    }
  );

  // Clear typing when drawer closes
  useEffect(() => {
    if (!isOpen) clearTyping();
  }, [isOpen, clearTyping]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get or create conversation (legacy fallback for orders)
  const getOrCreateConversation = async () => {
    if (
      (!orderId && !providedConversationId) ||
      !session?.user?.id ||
      !counterpart?.id ||
      collectionPath !== "chat_conversations" // Specialized collections handle creation elsewhere
    ) {
      if (providedConversationId) setConversationId(providedConversationId);
      return;
    }

    try {
      if (providedConversationId) {
        setConversationId(providedConversationId);
        return;
      }

      if (!db) return;
      const conversationsRef = collection(db!, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setConversationId(querySnapshot.docs[0].id);
      } else {
        const newConversation = {
          orderId: orderId || null,
          customerId: session.user.id,
          shopperId: counterpart.id,
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
    if (!db || !conversationId || !session?.user?.id) return;

    const messagesRef = collection(
      db,
      collectionPath,
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
          timestamp:
            doc.data().timestamp instanceof Timestamp
              ? doc.data().timestamp.toDate()
              : doc.data().timestamp,
        })) as Message[];

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

        // Sound notification for new incoming messages
        const previousMessageCount = messages.length;
        if (messagesList.length > previousMessageCount) {
          const lastMsg = messagesList[messagesList.length - 1];
          if (lastMsg.senderId !== session?.user?.id) {
            soundNotification.play();
          }
        }

        setMessages(messagesList);

        // Mark incoming messages as read
        snapshot.docs.forEach(async (d) => {
          const msg = d.data();
          if (msg.senderId !== session?.user?.id && !msg.read) {
            await updateDoc(d.ref, { read: true });
          }
        });

        // Reset unread count
        const convRef = doc(db!, collectionPath, conversationId);
        getDoc(convRef).then((snap) => {
          if (snap.exists() && snap.data().unreadCount > 0) {
            updateDoc(convRef, { unreadCount: 0 });
          }
        });

        setTimeout(scrollToBottom, 100);
      },
      (error) => {
        console.error("Error in messages listener:", error);
      }
    );

    return () => unsubscribe();
  }, [conversationId, session?.user?.id, collectionPath]);

  // Combined list for display
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
          : a.timestamp?.seconds
          ? a.timestamp.seconds * 1000
          : 0;
      const tB =
        b.timestamp instanceof Date
          ? b.timestamp.getTime()
          : b.timestamp?.seconds
          ? b.timestamp.seconds * 1000
          : 0;
      return tA - tB;
    });
    return combined;
  }, [messages, pendingMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!db || !newMessage.trim() || !session?.user?.id || !conversationId)
      return;

    const text = newMessage.trim();
    const piiCheck = containsBlockedPii(text);
    if (piiCheck.blocked && piiCheck.reason) {
      setError(getBlockedMessage(piiCheck.reason));
      return;
    }
    setError(null);

    const tempId = `temp-${Date.now()}`;
    setPendingMessages((prev) => [
      ...prev,
      {
        tempId,
        text,
        senderId: session.user.id,
        senderType: counterpart.role === "business" ? "business" : "customer",
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");

    try {
      const messagesRef = collection(
        db!,
        collectionPath,
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text,
        message: text,
        senderId: session.user.id,
        senderName: session.user.name || "User",
        senderType: counterpart.role === "business" ? "business" : "customer",
        recipientId: counterpart.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      const convRef = doc(db!, collectionPath, conversationId);
      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadCount: 1, // Will be reset by listener if sender is other person
      });

      // FCM
      await fetch("/api/fcm/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: counterpart.id,
          senderName: session.user.name || "User",
          message: text,
          orderId,
          conversationId,
          collectionPath,
        }),
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error sending message. Please try again.");
      setPendingMessages((prev) => prev.filter((p) => p.tempId !== tempId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 top-16 z-[1000] flex w-full flex-col overflow-hidden border-l-0 border-gray-100 bg-[var(--bg-primary)] shadow-2xl transition-all duration-300 ease-in-out dark:border-gray-800 sm:w-[28rem] sm:rounded-l-[30px] sm:border-l">
      <div className="bg-[var(--bg-primary)]/80 z-10 flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 backdrop-blur-xl dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="-ml-2 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="relative flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm ring-2 ring-emerald-500/20 dark:ring-emerald-400/10">
              {counterpart.avatar &&
              counterpart.avatar !== "/images/ProfileImage.png" ? (
                <img
                  src={counterpart.avatar}
                  alt={counterpart.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold uppercase text-white">
                  {counterpart.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
              {counterpart.name}
            </h3>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {collectionPath === "business_conversations"
                ? "Business Contact"
                : "Your Shopper"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth px-4 py-6">
        {displayMessages.map((message) => (
          <CustomerMessage
            key={"tempId" in message ? message.tempId : message.id}
            message={message}
            isCurrentUser={message.senderId === session?.user?.id}
            counterpartName={counterpart.name}
            statusLabel={"tempId" in message ? "Sending..." : "Sent"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[var(--bg-primary)]/80 border-t border-gray-100 p-4 backdrop-blur-xl dark:border-gray-800 sm:p-5">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              reportTyping();
            }}
            onBlur={clearTyping}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="w-full resize-none rounded-[20px] bg-gray-100/80 px-5 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-500 transition-all focus:bg-gray-200/80 focus:outline-none dark:bg-gray-900/80 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800"
            rows={1}
            style={{ minHeight: "52px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <svg
              className="ml-1 h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 px-4 py-2 dark:bg-red-900/30">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CustomerChatDrawer;

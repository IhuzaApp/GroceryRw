import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Avatar,
  Input,
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
      className={`mb-3 flex gap-2 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0">
          <Avatar color="green" circle size="sm" />
        </div>
      )}
      <div
        className={`flex max-w-[82%] flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isCurrentUser
              ? "bg-emerald-500 !text-white dark:bg-emerald-600 [&_*]:!text-white [&_svg]:!text-white"
              : "bg-white text-gray-900 shadow-gray-200/50 dark:bg-gray-700 dark:text-gray-100 dark:shadow-none"
          }`}
        >
          {!isCurrentUser && (
            <div className="mb-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {counterpartName}
            </div>
          )}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {messageContent}
          </div>
        </div>
        {isCurrentUser && statusLabel && (
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {statusLabel}
          </span>
        )}
      </div>
      {isCurrentUser && (
        <div className="flex-shrink-0">
          <Avatar color="green" circle size="sm" />
        </div>
      )}
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
        getDoc(convRef).then(snap => {
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
      const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0);
      const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0);
      return tA - tB;
    });
    return combined;
  }, [messages, pendingMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!db || !newMessage.trim() || !session?.user?.id || !conversationId) return;

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
      const messagesRef = collection(db!, collectionPath, conversationId, "messages");
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
    <div className="fixed right-0 top-16 z-[1000] flex h-[calc(100vh-4rem)] w-[28rem] flex-col overflow-hidden rounded-l-2xl border-l border-gray-200 bg-[var(--bg-primary)] shadow-2xl dark:border-gray-700">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-[var(--bg-primary)] px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <Avatar src={counterpart.avatar} alt={counterpart.name} circle size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-[var(--text-primary)]">{counterpart.name}</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {collectionPath === "business_conversations" ? "Business Contact" : "Your Shopper"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
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

      <div className="border-t border-gray-200 bg-[var(--bg-primary)] p-4 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); reportTyping(); }}
            onBlur={clearTyping}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="w-full resize-none rounded-xl bg-gray-100 px-4 py-2.5 text-sm dark:bg-gray-700"
            rows={1}
          />
          <button type="submit" disabled={!newMessage.trim()} className="rounded-full bg-emerald-500 p-2.5 text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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

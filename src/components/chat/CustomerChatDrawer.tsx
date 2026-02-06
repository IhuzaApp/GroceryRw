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
  recipientId?: string;
  timestamp: any;
  read?: boolean;
}

// Pending (optimistic) message before Firebase confirms
interface PendingMessage {
  tempId: string;
  text: string;
  senderId: string;
  senderType: "customer" | "shopper";
  timestamp: Date;
}

// Message component for customers
interface MessageProps {
  message: Message | PendingMessage;
  isCurrentUser: boolean;
  shopperName: string;
  statusLabel?: "Sending..." | "Sent" | null;
}

const CustomerMessage: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  shopperName,
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
              {shopperName}
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
  orderId: string;
  shopper: {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const CustomerChatDrawer: React.FC<CustomerChatDrawerProps> = ({
  orderId,
  shopper,
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { otherTypingName, reportTyping, clearTyping } = useChatTypingIndicator({
    conversationId,
    currentUserId: session?.user?.id ?? "",
    currentUserName: session?.user?.name ?? "Customer",
    enabled: !!conversationId && !!session?.user?.id && isOpen,
  });

  // Clear typing when drawer closes
  useEffect(() => {
    if (!isOpen) clearTyping();
  }, [isOpen, clearTyping]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get or create conversation
  const getOrCreateConversation = async () => {
    if (!orderId || !session?.user?.id || !shopper?.id) return;

    try {
      console.log("🔍 [Customer Chat] Creating conversation with:", {
        orderId,
        customerId: session.user.id,
        shopperId: shopper.id,
      });

      // Check if conversation exists
      const conversationsRef = collection(db, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderId));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Conversation exists
        const conversationDoc = querySnapshot.docs[0];
        console.log(
          "🔍 [Customer Chat] Found existing conversation:",
          conversationDoc.id
        );
        setConversationId(conversationDoc.id);
      } else {
        // Create new conversation
        const newConversation = {
          orderId,
          customerId: session.user.id,
          shopperId: shopper.id,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        };

        console.log(
          "🔍 [Customer Chat] Creating new conversation:",
          newConversation
        );
        const docRef = await addDoc(conversationsRef, newConversation);
        console.log("🔍 [Customer Chat] Created conversation:", docRef.id);
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

    console.log(
      "🔍 [Customer Chat] Setting up message listener for conversation:",
      conversationId
    );

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

        // Check for new unread messages from shopper and play sound
        const previousMessageCount = messages.length;
        const newMessages = messagesList.slice(previousMessageCount);
        const newUnreadShopperMessages = newMessages.filter(
          (msg) =>
            msg.senderType === "shopper" &&
            msg.senderId !== session?.user?.id &&
            !msg.read
        );

        if (newUnreadShopperMessages.length > 0) {
          soundNotification.play();
        }

        setMessages(messagesList);

        // Mark messages as read if they were sent to the current user (customer)
        messagesList.forEach(async (msg) => {
          if (msg.senderType === "shopper" && !msg.read) {
            const messageRef = doc(
              db,
              "chat_conversations",
              conversationId,
              "messages",
              msg.id
            );
            await updateDoc(messageRef, { read: true });

            const convRef = doc(db, "chat_conversations", conversationId);
            await updateDoc(convRef, {
              unreadCount: 0,
            });
          }
        });

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
    if (isOpen && orderId && shopper?.id) {
      getOrCreateConversation();
    }
  }, [isOpen, orderId, shopper?.id]);

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

  // Handle sending a new message (optimistic: show immediately, then confirm)
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
        senderType: "customer",
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");
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
        senderId: session.user.id,
        senderName: session.user.name || "Customer",
        senderType: "customer",
        recipientId: shopper.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadCount: 1,
      });

      try {
        await fetch("/api/fcm/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: shopper.id,
            senderName: session.user.name || "Customer",
            message: text,
            orderId,
            conversationId,
          }),
        });
      } catch {
        // FCM non-critical
      }
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
    <div className="fixed right-0 top-16 z-[1000] flex h-[calc(100vh-4rem)] w-[28rem] flex-col overflow-hidden rounded-l-2xl border-l border-gray-200 bg-white shadow-2xl shadow-gray-300/30 transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/20">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Close chat"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative flex-shrink-0">
            <Avatar
              src={shopper.avatar}
              alt={shopper.name}
              circle
              size="md"
              className="ring-2 ring-emerald-500/20 dark:ring-emerald-400/30"
            />
            <span
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-800 dark:bg-emerald-400"
              title="Online"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-gray-900 dark:text-white">
              {shopper.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your Shopper
            </p>
          </div>
        </div>
        {shopper.phone && (
          <a
            href={`tel:${shopper.phone}`}
            className="flex-shrink-0 rounded-full bg-emerald-500 p-2.5 text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 !text-white [&_svg]:!text-white"
            aria-label="Call shopper"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1 .45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto bg-gray-50/80 px-4 py-4 dark:bg-gray-900/80">
          {displayMessages.length === 0 ? (
            <div className="flex h-full min-h-[200px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                  <svg
                    className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start chatting with your shopper
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Messages appear here
                </p>
              </div>
            </div>
          ) : (
            <>
              {otherTypingName && (
                <div className="mb-3 flex justify-start">
                  <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm dark:bg-gray-700 dark:text-gray-100">
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
                  <CustomerMessage
                    key={"tempId" in message ? message.tempId : message.id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    shopperName={shopper.name}
                    statusLabel={statusLabel}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3"
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
              placeholder="Type a message..."
              className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-400 dark:focus:bg-gray-600 dark:focus:ring-emerald-500/30"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex-shrink-0 rounded-full bg-emerald-500 p-2.5 text-white shadow-md transition-all duration-200 hover:bg-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none dark:focus:ring-offset-gray-800 !text-white [&_svg]:!text-white [&_*]:!text-white"
              aria-label="Send message"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex-shrink-0 border-t border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/30">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CustomerChatDrawer;

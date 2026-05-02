import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
import { db } from "../../lib/firebase";
import { Avatar } from "rsuite";
import { formatCurrency } from "../../lib/formatCurrency";
import {
  containsBlockedPii,
  getBlockedMessage,
  sanitizeMessageForDisplay,
} from "../../lib/chatPiiBlock";
import { useChatTypingIndicator } from "../../hooks/useChatTypingIndicator";
import { useTheme } from "../../context/ThemeContext";

// Helper to format time (e.g., "01:09 am", "08:24PM")
function formatTime(timestamp: any): string {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper to format date (e.g., "29 July 2024")
function formatDate(timestamp: any): string {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Helper to check if two timestamps are on the same day
function isSameDay(timestamp1: any, timestamp2: any): boolean {
  if (!timestamp1 || !timestamp2) return false;

  const date1 =
    timestamp1 instanceof Timestamp
      ? timestamp1.toDate()
      : new Date(timestamp1);
  const date2 =
    timestamp2 instanceof Timestamp
      ? timestamp2.toDate()
      : new Date(timestamp2);

  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// Helper to get date label for grouping
function getDateLabel(timestamp: any): string {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return "Today";
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

// Helper to group messages by date
function groupMessagesByDate(
  messages: any[]
): Array<{ date: string; messages: any[] }> {
  const groups: Record<string, any[]> = {};

  messages.forEach((message) => {
    const dateLabel = getDateLabel(message.timestamp);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(message);
  });

  return Object.entries(groups).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));
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
  senderType: "customer" | "shopper" | "business";
  recipientId: string;
  timestamp: any;
  read: boolean;
  product?: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

// Define conversation interface
interface Conversation {
  id: string;
  collectionPath: "chat_conversations" | "business_conversations";
  orderId?: string;
  customerId?: string;
  shopperId?: string;
  businessId?: string;
  rfqId?: string;
  counterpartId?: string;
  type?: "order" | "business";
  title?: string;
  counterpartName?: string;
  counterpartAvatar?: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  order?: any;
}

interface DesktopMessagePageProps {
  conversations: Conversation[];
  orders: Record<string, any>;
  loading: boolean;
  onConversationSelect: (orderId?: string, conversationId?: string) => void;
  selectedOrderId?: string;
  selectedConversationId?: string;
}

export default function DesktopMessagePage({
  conversations,
  orders,
  loading,
  onConversationSelect,
  selectedOrderId,
  selectedConversationId,
}: DesktopMessagePageProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [piiError, setPiiError] = useState<string | null>(null);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [loadingRfq, setLoadingRfq] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isBusinessChat =
    !!selectedConversation &&
    (!selectedConversation.orderId || selectedConversation.type === "business");
  const selectedOrder =
    selectedConversation && selectedConversation.orderId
      ? orders[selectedConversation.orderId as string]
      : null;

  const { otherTypingName, reportTyping, clearTyping } = useChatTypingIndicator(
    {
      conversationId,
      currentUserId: session?.user?.id ?? "",
      currentUserName: session?.user?.name ?? "Customer",
      enabled:
        !!conversationId && !!session?.user?.id && !!selectedConversation,
    }
  );

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;

    const order = conversation.orderId
      ? orders[conversation.orderId as string]
      : undefined;
    const customerName =
      order?.orderedBy?.name?.toLowerCase() ||
      order?.customer?.name?.toLowerCase() ||
      "";
    const messageText = conversation.lastMessage?.toLowerCase() || "";

    return (
      customerName.includes(searchQuery.toLowerCase()) ||
      messageText.includes(searchQuery.toLowerCase())
    );
  });

  // Set selected conversation when selectedOrderId or selectedConversationId changes
  useEffect(() => {
    if (selectedConversationId) {
      const conv = conversations.find((c) => c.id === selectedConversationId);
      if (conv) {
        setSelectedConversation(conv);
        return;
      }
    }

    if (selectedOrderId) {
      const conv = conversations.find((c) => c.orderId === selectedOrderId);
      if (conv) {
        setSelectedConversation(conv);
        return;
      }
    }

    if (filteredConversations.length > 0 && !selectedConversation) {
      setSelectedConversation(filteredConversations[0]);
    }
  }, [
    selectedOrderId,
    selectedConversationId,
    conversations,
    filteredConversations,
  ]);

  // Get conversation ID and shopper data when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Get conversation ID and shopper data
      const getConversationData = async () => {
        try {
          setConversationId(selectedConversation.id);

          // Mark as read logic preserved...
          const convRef = doc(
            db!,
            selectedConversation.collectionPath,
            selectedConversation.id
          );
          const convSnap = await getDoc(convRef);

          if (convSnap.exists() && convSnap.data().unreadCount > 0) {
            await updateDoc(convRef, { unreadCount: 0 });
          }

          // Fetch RFQ details if it's a business chat
          if (
            selectedConversation.collectionPath === "business_conversations" &&
            selectedConversation.rfqId
          ) {
            setLoadingRfq(true);
            try {
              const res = await fetch(
                `/api/queries/rfq-details-and-responses?rfq_id=${selectedConversation.rfqId}`
              );
              if (res.ok) {
                const data = await res.json();
                setSelectedRfq(data.rfq);
              }
            } catch (err) {
              console.error("Error fetching RFQ details:", err);
            } finally {
              setLoadingRfq(false);
            }
          } else {
            setSelectedRfq(null);
          }
        } catch (error) {
          console.error("Error getting conversation data:", error);
        }
      };
      getConversationData();
    } else {
      setConversationId(null);
      setMessages([]);
      setSelectedRfq(null);
    }
  }, [selectedConversation]);

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;

    const messagesRef = collection(
      db!,
      selectedConversation!.collectionPath,
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

        setMessages(messagesList);

        // Mark all unread messages as read
        const unreadMessages = messagesList.filter(
          (message) => message.senderType === "shopper" && !message.read
        );

        if (unreadMessages.length > 0) {
          // Mark messages as read (async operation)
          (async () => {
            for (const message of unreadMessages) {
              const messageRef = doc(
                db!,
                selectedConversation!.collectionPath,
                conversationId,
                "messages",
                message.id
              );
              await updateDoc(messageRef, { read: true });
            }

            // Update conversation unread count to 0
            const convRef = doc(
              db!,
              selectedConversation!.collectionPath,
              conversationId
            );
            await updateDoc(convRef, {
              unreadCount: 0,
            });
          })();
        }

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
      (error) => {
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
      !selectedConversation
    ) {
      return;
    }

    const text = newMessage.trim();
    const piiCheck = containsBlockedPii(text, {
      senderId: session.user.id,
      senderName: session.user.name || "User",
      conversationId: conversationId,
    });
    if (piiCheck.blocked && piiCheck.reason) {
      setPiiError(getBlockedMessage(piiCheck.reason));
      return;
    }
    setPiiError(null);

    try {
      setIsSending(true);

      const messagesRef = collection(
        db!,
        selectedConversation.collectionPath,
        conversationId,
        "messages"
      );
      const recipientId =
        selectedConversation.shopperId ||
        (selectedConversation as any).businessId ||
        selectedConversation.customerId;

      await addDoc(messagesRef, {
        text: newMessage.trim(),
        message: newMessage.trim(),
        senderId: session.user.id,
        senderName: session.user.name || "User",
        senderType:
          session.user.id === selectedConversation.customerId
            ? "customer"
            : session.user.id === selectedConversation.shopperId
            ? "shopper"
            : "business",
        recipientId,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation with last message
      const convRef = doc(
        db!,
        selectedConversation.collectionPath,
        conversationId
      );
      await updateDoc(convRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 1,
      });

      // Trigger FCM so recipient gets device + in-app notification (bell)
      try {
        const recipientId =
          selectedConversation.shopperId ||
          selectedConversation.counterpartId ||
          (selectedConversation as any).businessId ||
          selectedConversation.customerId;

        await fetch("/api/fcm/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId,
            senderName: session.user.name || "User",
            message: newMessage.trim(),
            orderId: selectedConversation.orderId || null,
            conversationId,
            collectionPath: selectedConversation.collectionPath,
          }),
        });
      } catch (fcmErr) {
        console.warn("FCM send (non-blocking):", fcmErr);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle conversation click
  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    onConversationSelect(conversation.orderId, conversation.id);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Left Column - Conversation List */}
      <div className="flex h-full w-80 flex-shrink-0 flex-col border-r border-gray-200 dark:border-white/10">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 !text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 [&_svg]:!text-white"
            >
              <svg
                className="h-5 w-5 text-white transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Messages
            </h1>
          </div>
          <button className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl bg-[var(--bg-secondary)] px-4 py-3 pl-11 text-sm text-[var(--text-primary)] placeholder-gray-500 transition-all focus:bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:bg-white/5 dark:placeholder-gray-400 dark:focus:bg-white/10"
            />
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

        {/* Conversation List */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--bg-secondary)] border-t-green-600 dark:border-white/5 dark:border-t-green-500"></div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Loading...
                </p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4">
              <div className="text-center">
                <div className="mb-3 text-4xl">💬</div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  No conversations found
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Try adjusting your search
                </p>
              </div>
            </div>
          ) : (
            filteredConversations.map((conversation, index) => {
              const isBusinessChat =
                conversation.type === "business" || !conversation.orderId;
              const order = conversation.orderId
                ? orders[conversation.orderId] || {}
                : {};

              const employeeId = order?.assignedTo?.shopper?.Employment_id;

              // Handle name display for business chats
              let fullName = "Business Chat";
              if (isBusinessChat) {
                fullName =
                  conversation.title ||
                  conversation.counterpartName ||
                  "Business Chat";
              } else {
                fullName =
                  order?.assignedTo?.shopper?.full_name ||
                  order?.assignedTo?.name ||
                  "Shopper";
              }

              const contactName =
                employeeId && !isBusinessChat
                  ? `00${employeeId} ${fullName}`
                  : fullName;

              const contactAvatar = isBusinessChat
                ? conversation.counterpartAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    fullName
                  )}&background=10b981&color=fff`
                : order?.assignedTo?.shopper?.profile_photo ||
                  order?.assignedTo?.profile_picture ||
                  "/images/ProfileImage.png";
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <React.Fragment key={conversation.id}>
                  <div
                    onClick={() => handleConversationClick(conversation)}
                    className={`group relative cursor-pointer px-5 py-4 transition-all duration-200 ${
                      isSelected
                        ? "bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:bg-gray-800/70 dark:ring-white/10"
                        : "hover:bg-white/40 dark:hover:bg-gray-800/40"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-green-600 dark:bg-green-500"></div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md ring-2 ring-white dark:ring-gray-700">
                          {contactAvatar &&
                          contactAvatar !== "/images/ProfileImage.png" ? (
                            <img
                              src={contactAvatar}
                              alt={contactName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <svg
                              className="h-7 w-7 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold !text-white shadow-lg ring-2 ring-white dark:ring-gray-800">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className={`truncate text-sm font-bold tracking-tight ${
                              isSelected
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {contactName}
                          </h3>
                          <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 line-clamp-1 text-xs leading-relaxed ${
                            conversation.unreadCount > 0
                              ? "font-semibold text-gray-900 dark:text-gray-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < filteredConversations.length - 1 && (
                    <div className="mx-4 h-px bg-gray-100 dark:bg-gray-700/50"></div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* Middle Column - Chat Window */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-8 py-5 dark:border-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg ring-2 ring-white dark:ring-gray-700">
                    {isBusinessChat ? (
                      <img
                        src={
                          selectedConversation.counterpartAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            selectedConversation.title ||
                              selectedConversation.counterpartName ||
                              "Business"
                          )}&background=10b981&color=fff`
                        }
                        alt={selectedConversation.title || "Business"}
                        className="h-full w-full object-cover"
                      />
                    ) : selectedOrder?.assignedTo?.shopper?.profile_photo ||
                      selectedOrder?.assignedTo?.profile_picture ? (
                      <img
                        src={
                          selectedOrder.assignedTo?.shopper?.profile_photo ||
                          selectedOrder.assignedTo?.profile_picture
                        }
                        alt={
                          selectedOrder.assignedTo?.shopper?.full_name ||
                          selectedOrder.assignedTo?.name ||
                          "Shopper"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        className="h-7 w-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-sm dark:border-gray-800"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                    {isBusinessChat ? (
                      selectedConversation.title ||
                      selectedConversation.counterpartName ||
                      "Business Chat"
                    ) : (
                      <>
                        {selectedOrder?.assignedTo?.shopper?.full_name ||
                          selectedOrder?.assignedTo?.name ||
                          "Shopper"}
                        {selectedOrder?.assignedTo?.shopper?.Employment_id && (
                          <span className="ml-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
                            #00{selectedOrder.assignedTo.shopper.Employment_id}
                          </span>
                        )}
                      </>
                    )}
                  </h2>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">
                    Online Now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-xl p-2.5 text-[var(--text-secondary)] transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </button>
                <button className="rounded-xl p-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </button>
                <button className="rounded-xl p-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {otherTypingName && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[var(--text-primary)] shadow-sm dark:bg-gray-700">
                        <span className="text-sm text-[var(--text-secondary)]">
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
                  {groupMessagesByDate(messages).map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                      {/* Date Separator */}
                      <div className="flex items-center gap-4 py-2">
                        <div className="flex-1 border-t border-gray-200 dark:border-white/10"></div>
                        <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                          {group.date}
                        </span>
                        <div className="flex-1 border-t border-gray-200 dark:border-white/10"></div>
                      </div>

                      {/* Messages for this date */}
                      <div className="flex flex-col gap-6">
                        {group.messages.map((message, index) => {
                          const isCurrentUser =
                            message.senderId === session?.user?.id;

                          return (
                            <React.Fragment key={message.id}>
                              <div
                                className={`flex items-end gap-3 ${
                                  isCurrentUser
                                    ? "flex-row-reverse"
                                    : "flex-row"
                                }`}
                              >
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md ring-2 ring-white dark:ring-gray-700">
                                  {isCurrentUser ? (
                                    session?.user?.image ? (
                                      <img
                                        src={session.user.image}
                                        alt={session?.user?.name || "You"}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-[10px] font-bold uppercase text-white">
                                        {(session?.user?.name || "Y").charAt(0)}
                                      </span>
                                    )
                                  ) : selectedOrder?.assignedTo?.shopper
                                      ?.profile_photo ||
                                    selectedOrder?.assignedTo
                                      ?.profile_picture ? (
                                    <img
                                      src={
                                        selectedOrder.assignedTo?.shopper
                                          ?.profile_photo ||
                                        selectedOrder.assignedTo
                                          ?.profile_picture
                                      }
                                      alt="Shopper"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : isBusinessChat ? (
                                    <img
                                      src={
                                        selectedConversation.counterpartAvatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                          selectedConversation.title ||
                                            selectedConversation.counterpartName ||
                                            "Business"
                                        )}&background=10b981&color=fff`
                                      }
                                      alt="Business"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <svg
                                      className="h-5 w-5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div
                                  className={`flex max-w-[70%] flex-col ${
                                    isCurrentUser ? "items-end" : "items-start"
                                  }`}
                                >
                                  <div
                                    className={`group relative rounded-[20px] px-5 py-3.5 transition-all duration-200 hover:shadow-sm ${
                                      isCurrentUser
                                        ? "rounded-br-none border-2 border-green-500/20 bg-green-500/5 font-medium text-green-700 dark:text-green-400"
                                        : "rounded-bl-none border-2 border-gray-200/50 bg-[var(--bg-secondary)] text-[var(--text-primary)] backdrop-blur-sm dark:border-white/5"
                                    }`}
                                  >
                                    {message.product ? (
                                      <div className="mb-3 flex overflow-hidden rounded-xl bg-black/5 p-2 dark:bg-white/5">
                                        <img
                                          src={message.product.image}
                                          alt={message.product.name}
                                          className="h-14 w-14 rounded-lg object-cover shadow-sm"
                                        />
                                        <div className="ml-3 min-w-0 flex-1">
                                          <p className="truncate text-sm font-bold opacity-90">
                                            {message.product.name}
                                          </p>
                                          <p className="text-xs font-semibold opacity-70">
                                            {formatCurrency(
                                              message.product.price
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    ) : null}
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                      {sanitizeMessageForDisplay(
                                        message.text || message.message || ""
                                      )}
                                    </p>
                                  </div>
                                  <div
                                    className={`mt-1.5 flex items-center gap-1.5 px-1 ${
                                      isCurrentUser
                                        ? "flex-row-reverse"
                                        : "flex-row"
                                    }`}
                                  >
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                      {formatTime(message.timestamp)}
                                    </span>
                                    {isCurrentUser && (
                                      <svg
                                        className="h-3.5 w-3.5 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* PII block error */}
            {piiError && (
              <div className="flex-shrink-0 border-t border-red-200 bg-red-50 px-6 py-2 dark:border-red-800 dark:bg-red-900/30">
                <p className="text-xs text-red-600 dark:text-red-400">
                  {piiError}
                </p>
              </div>
            )}
            {/* Message Input */}
            <div className="mb-4 flex-shrink-0 px-8 pb-6 pt-2">
              <form
                onSubmit={handleSendMessage}
                className="relative mx-auto flex max-w-4xl items-center gap-3"
              >
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-green-400"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-green-400"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      reportTyping();
                    }}
                    onBlur={clearTyping}
                    placeholder="Write a message..."
                    className="h-12 w-full rounded-2xl border-none bg-white/40 px-6 pr-12 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800/40 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-700/60"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-all hover:text-green-600 dark:hover:text-green-400"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                    </svg>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:focus:ring-offset-gray-800"
                  aria-label="Send message"
                >
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-[var(--bg-primary)]">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/10 dark:to-emerald-500/10">
                <svg
                  className="h-12 w-12 text-green-600 dark:text-green-400"
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
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Select a conversation
              </h3>
              <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
                Choose a chat from the list to start messaging and view order
                details
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-full w-96 flex-shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-[var(--bg-primary)] dark:border-white/10">
        {selectedConversation && (selectedOrder || selectedRfq) ? (
          <>
            {/* Header */}
            <div className="flex-shrink-0 bg-white px-8 py-6 shadow-sm dark:bg-gray-800/50">
              <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {selectedOrder ? "Order Details" : "Quote Details"}
              </h2>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {selectedOrder ? (
                <>
                  {/* Company Info / Vehicle Info Card */}
                  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                        {selectedOrder.Order_Items?.[0]?.product?.image ? (
                          <img
                            src={selectedOrder.Order_Items[0].product.image}
                            alt="Vehicle"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                          {selectedOrder.Order_Items?.[0]?.product?.ProductName
                            ?.name ||
                            selectedOrder.shop?.name ||
                            "Store"}
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                          ID: #
                          {formatOrderID(
                            selectedOrder.OrderID || selectedOrder.id
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="my-5 h-px bg-gray-100 dark:bg-gray-700/50"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Status
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                          selectedOrder.status === "completed" ||
                          selectedOrder.status === "PAID"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : selectedOrder.status === "in_progress" ||
                              selectedOrder.status === "ACCEPTED"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : selectedOrder.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
                        {selectedOrder.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Rental Duration Card (if vehicle) */}
                  {selectedOrder.pickup_date && (
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">
                        Rental Duration
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Pickup
                          </p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {new Date(
                              selectedOrder.pickup_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Return
                          </p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {new Date(
                              selectedOrder.return_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Counterpart Details Card (Shopper or Owner) */}
                  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                    <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">
                      {selectedOrder.assignedTo?.shopper?.Employment_id ===
                      "VEHICLE"
                        ? "Owner Details"
                        : "Shopper Details"}
                    </h4>
                    {selectedOrder.assignedTo && (
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md ring-2 ring-white dark:ring-gray-700">
                          {selectedOrder.assignedTo?.shopper?.profile_photo ||
                          selectedOrder.assignedTo?.profile_picture ? (
                            <img
                              src={
                                selectedOrder.assignedTo?.shopper
                                  ?.profile_photo ||
                                selectedOrder.assignedTo?.profile_picture
                              }
                              alt="Counterpart"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <svg
                              className="h-7 w-7 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {selectedOrder.assignedTo?.shopper?.Employment_id &&
                              selectedOrder.assignedTo.shopper.Employment_id !==
                                "VEHICLE" && (
                                <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                                  #00
                                  {
                                    selectedOrder.assignedTo.shopper
                                      .Employment_id
                                  }
                                </span>
                              )}
                          </div>
                          <h5 className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-white">
                            {selectedOrder.assignedTo?.shopper?.full_name ||
                              selectedOrder.assignedTo?.name ||
                              "Partner"}
                          </h5>
                          <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            {selectedOrder.assignedTo?.email ||
                              "No contact info"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Details Card */}
                  {selectedOrder.orderedBy && (
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">
                        Customer Details
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md ring-2 ring-white dark:ring-gray-700">
                          {selectedOrder.orderedBy.profile_picture ? (
                            <img
                              src={selectedOrder.orderedBy.profile_picture}
                              alt="Customer"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-lg font-black text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                              {selectedOrder.orderedBy.name
                                ?.charAt(0)
                                .toUpperCase() || "C"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                            {selectedOrder.orderedBy.name || "Customer"}
                          </h5>
                          {selectedOrder.orderedBy.phone && (
                            <a
                              href={`tel:${selectedOrder.orderedBy.phone}`}
                              className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {selectedOrder.orderedBy.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirmation Action Button */}
                  {selectedOrder.orderType === "vehicle" &&
                    selectedOrder.status === "PENDING" &&
                    (selectedOrder.assignedTo?.id === session?.user?.id ||
                      selectedOrder.assignedTo?.shopper?.id ===
                        session?.user?.id) && (
                      <div className="pt-2">
                        <button
                          disabled={isConfirming}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Are you sure you want to confirm this booking?"
                              )
                            )
                              return;
                            setIsConfirming(true);
                            try {
                              const res = await fetch(
                                "/api/mutations/update-vehicle-booking-status",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    bookingId: selectedOrder.id,
                                    status: "ACCEPTED",
                                  }),
                                }
                              );
                              const data = await res.json();
                              if (data.success) {
                                window.location.reload();
                              } else {
                                alert(
                                  data.error || "Failed to confirm booking"
                                );
                                setIsConfirming(false);
                              }
                            } catch (error) {
                              console.error("Error confirming booking:", error);
                              alert("An error occurred. Please try again.");
                              setIsConfirming(false);
                            }
                          }}
                          className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-[0.98] ${
                            isConfirming
                              ? "cursor-not-allowed opacity-70"
                              : "hover:scale-[1.02] hover:shadow-green-500/25"
                          }`}
                        >
                          <span className="relative z-10">
                            {isConfirming ? "Confirming..." : "Confirm Booking"}
                          </span>
                          {!isConfirming && (
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                          )}
                        </button>
                      </div>
                    )}
                </>
              ) : selectedRfq ? (
                <div className="space-y-6">
                  {/* Quote Header Card */}
                  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                        <svg
                          className="h-8 w-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                          {selectedRfq.title || "Business Inquiry"}
                        </h3>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          RFQ: #{selectedRfq.id?.split("-")[0].toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="my-5 h-px bg-gray-100 dark:bg-gray-700/50"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Category
                        </p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {selectedRfq.category || "General"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Urgency
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            selectedRfq.urgency === "high"
                              ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                              : selectedRfq.urgency === "medium"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                          }`}
                        >
                          {selectedRfq.urgency || "normal"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Budget & Requirements Card */}
                  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                        Details
                      </h4>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Budget
                        </p>
                        <p className="text-sm font-black text-green-600 dark:text-green-400">
                          {selectedRfq.budget_range || "Open"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/50">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Requirements
                      </p>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                        {selectedRfq.requirements ||
                          "No specific requirements provided."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                <svg
                  className="h-10 w-10 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                No order selected
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Select a conversation to view
                <br />
                order details and information
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

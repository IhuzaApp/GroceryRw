import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
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
  senderId: string;
  senderType: "customer" | "shopper";
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
  orderId: string;
  customerId: string;
  shopperId: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  order?: any;
}

interface DesktopMessagePageProps {
  conversations: Conversation[];
  orders: Record<string, any>;
  loading: boolean;
  onConversationSelect: (orderId: string) => void;
  selectedOrderId?: string;
}

export default function DesktopMessagePage({
  conversations,
  orders,
  loading,
  onConversationSelect,
  selectedOrderId,
}: DesktopMessagePageProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;

    const order = orders[conversation.orderId];
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

  // Set selected conversation when selectedOrderId changes
  useEffect(() => {
    if (selectedOrderId) {
      const conv = conversations.find((c) => c.orderId === selectedOrderId);
      if (conv) {
        setSelectedConversation(conv);
      }
    } else if (filteredConversations.length > 0 && !selectedConversation) {
      setSelectedConversation(filteredConversations[0]);
    }
  }, [selectedOrderId, conversations, filteredConversations]);

  // Get conversation ID and shopper data when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Get conversation ID and shopper data
      const getConversationData = async () => {
        try {
          const conversationsRef = collection(db, "chat_conversations");
          const q = query(
            conversationsRef,
            where("orderId", "==", selectedConversation.orderId)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const conversationDoc = querySnapshot.docs[0];
            const conversationData = conversationDoc.data();
            
            console.log("📊 Conversation Data:", conversationData);
            console.log("👤 Shopper ID:", conversationData.shopperId);
            
            setConversationId(conversationDoc.id);
            
            // Fetch shopper details from Firestore users collection
            if (conversationData.shopperId) {
              try {
                const shopperRef = doc(db, "users", conversationData.shopperId);
                const shopperDoc = await getDoc(shopperRef);
                
                if (shopperDoc.exists()) {
                  const shopperData = shopperDoc.data();
                  console.log("🧑‍💼 Shopper Data from Firebase:", shopperData);
                  
                  // Fetch additional shopper profile from API
                  try {
                    const response = await fetch(`/api/queries/shopper-profile?user_id=${conversationData.shopperId}`);
                    if (response.ok) {
                      const profileData = await response.json();
                      console.log("📸 Shopper Profile from API:", profileData);
                    }
                  } catch (apiError) {
                    console.error("Error fetching shopper profile from API:", apiError);
                  }
                }
              } catch (shopperError) {
                console.error("Error fetching shopper from Firebase:", shopperError);
              }
            }
          }
        } catch (error) {
          console.error("Error getting conversation ID:", error);
        }
      };
      getConversationData();
    } else {
      setConversationId(null);
      setMessages([]);
    }
  }, [selectedConversation]);

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;

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

    try {
      setIsSending(true);

      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        message: newMessage.trim(),
        senderId: session.user.id,
        senderName: session.user.name || "Customer",
        senderType: "customer",
        recipientId: selectedConversation.shopperId,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation with last message
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 1,
      });

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
    onConversationSelect(conversation.orderId);
  };

  const selectedOrder = selectedConversation
    ? orders[selectedConversation.orderId]
    : null;

  return (
    <div className="flex h-full w-full gap-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Left Column - Conversation List */}
      <div className="flex h-full w-80 flex-shrink-0 flex-col bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
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
              placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-gray-100 px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-500 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-600"
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
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600 dark:border-gray-700 dark:border-t-green-500"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
                </p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4">
              <div className="text-center">
                <div className="mb-3 text-4xl">💬</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  No conversations found
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Try adjusting your search
                </p>
              </div>
            </div>
          ) : (
            filteredConversations.map((conversation, index) => {
              const order = orders[conversation.orderId] || {};
              
              // Debug logging
              if (index === 0) {
                console.log("🔍 First Conversation:", conversation);
                console.log("📦 First Order:", order);
                console.log("👤 Assigned To (Shoppers):", order?.assignedTo);
                console.log("👤 Shopper Data:", order?.assignedTo?.shopper);
              }
              
              const employeeId = order?.assignedTo?.shopper?.Employment_id;
              const fullName = order?.assignedTo?.shopper?.full_name ||
                order?.assignedTo?.name || 
                "Shopper";
              const contactName = employeeId ? `00${employeeId} ${fullName}` : fullName;
              const contactAvatar =
                order?.assignedTo?.shopper?.profile_photo ||
                order?.assignedTo?.profile_picture ||
                "/images/ProfileImage.png";
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <React.Fragment key={conversation.id}>
                <div
                  onClick={() => handleConversationClick(conversation)}
                    className={`group relative cursor-pointer px-4 py-3.5 transition-all ${
                    isSelected
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                    {isSelected && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-green-600 dark:bg-green-500"></div>
                    )}
                    <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
                      {contactAvatar &&
                      contactAvatar !== "/images/ProfileImage.png" ? (
                        <img
                          src={contactAvatar}
                          alt={contactName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                              className="h-6 w-6 text-white"
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
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white shadow-lg">
                            {conversation.unreadCount}
                          </div>
                        )}
                  </div>
                  <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3
                            className={`truncate text-sm font-semibold ${
                              isSelected
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                        {contactName}
                      </h3>
                          <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                        <p
                          className={`mt-1 truncate text-xs ${
                            conversation.unreadCount > 0
                              ? "font-medium text-gray-700 dark:text-gray-300"
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
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-gray-800">
        {selectedConversation && selectedOrder ? (
          <>
            {/* Chat Header */}
            <div className="flex flex-shrink-0 items-center justify-between bg-white px-6 py-4 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                  {selectedOrder.assignedTo?.shopper?.profile_photo ||
                  selectedOrder.assignedTo?.profile_picture ? (
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
                      className="h-6 w-6 text-white"
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
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedOrder.assignedTo?.shopper?.Employment_id && (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        00{selectedOrder.assignedTo.shopper.Employment_id}
                      </span>
                    )}
                    {selectedOrder.assignedTo?.shopper?.full_name ||
                      selectedOrder.assignedTo?.name ||
                      "Shopper"}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                    Active now
                </div>
              </div>
                </div>
              <div className="flex items-center gap-2">
                <button className="rounded-xl p-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
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
            <div
              ref={messagesContainerRef}
              className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-6 py-4 dark:bg-gray-900"
            >
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser =
                      message.senderId === session?.user?.id;
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const showDateSeparator =
                      !prevMessage ||
                      !isSameDay(message.timestamp, prevMessage.timestamp);

                    return (
                      <React.Fragment key={message.id}>
                        {showDateSeparator && (
                          <div className="flex items-center gap-4 py-2">
                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(message.timestamp)}
                            </span>
                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                          </div>
                        )}
                        <div
                          className={`flex items-end gap-2.5 ${
                            isCurrentUser ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                            {isCurrentUser ? (
                              session?.user?.image ? (
                                <img
                                  src={session.user.image}
                                  alt={session?.user?.name || "You"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <svg
                                  className="h-4 w-4 text-white"
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
                              )
                            ) : selectedOrder.assignedTo?.shopper?.profile_photo ||
                              selectedOrder.assignedTo?.profile_picture ? (
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
                                className="h-4 w-4 text-white"
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
                            className={`flex max-w-md flex-col ${
                              isCurrentUser ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-sm ${
                                isCurrentUser
                                  ? "rounded-br-md bg-gradient-to-br from-green-600 to-green-700 text-white"
                                  : "rounded-bl-md bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                              }`}
                            >
                              {message.product ? (
                                <div className="flex gap-3">
                                  <img
                                    src={message.product.image}
                                    alt={message.product.name}
                                    className="h-16 w-16 rounded-lg object-cover"
                                  />
                                  <div>
                                    <p
                                      className={`text-sm font-medium ${
                                        isCurrentUser
                                          ? "text-white"
                                          : "text-gray-900 dark:text-white"
                                      }`}
                                    >
                                      {message.product.name}
                                    </p>
                                    <p
                                      className={`mt-1 text-sm font-semibold ${
                                        isCurrentUser
                                          ? "text-white"
                                          : "text-green-500"
                                      }`}
                                    >
                                      Rp{" "}
                                      {message.product.price.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed">
                                  {message.text || message.message || ""}
                                </p>
                              )}
                            </div>
                            <div
                              className={`mt-1.5 flex items-center gap-1.5 px-2 ${
                                isCurrentUser ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(message.timestamp)}
                              </span>
                              {isCurrentUser && (
                                <svg
                                  className="h-4 w-4 text-green-600 dark:text-green-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
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
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] ">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3"
              >
                <button
                  type="button"
                  className="flex-shrink-0 rounded-xl p-2.5 text-gray-500 transition-all hover:bg-green-50 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                >
                  <svg
                    width="20"
                    height="20"
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
                  className="flex-shrink-0 rounded-xl p-2.5 text-gray-500 transition-all hover:bg-green-50 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 pr-12 text-sm text-gray-900 placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 transition-all hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                  >
                    <svg
                      width="18"
                      height="18"
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
                  disabled={isSending || !newMessage.trim()}
                  className="flex-shrink-0 rounded-full bg-gradient-to-br from-green-600 to-green-700 p-3 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:focus:ring-offset-gray-800"
                  aria-label="Send message"
                >
                  {isSending ? (
                    <svg
                      className="h-5 w-5 animate-spin"
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
                  ) : (
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
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
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Select a conversation
              </h3>
              <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                Choose a chat from the list to start messaging and view order details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Order Details */}
      <div className="flex h-full w-96 flex-shrink-0 flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {selectedConversation && selectedOrder ? (
          <>
            {/* Order Header */}
            <div className="flex-shrink-0 bg-white px-6 py-5 shadow-sm dark:bg-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Order Details
              </h2>
            </div>

            {/* Order Content */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Company/Team Info Card */}
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedOrder.shop?.name || "Store"}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Order #{formatOrderID(selectedOrder.OrderID || selectedOrder.id)}
                    </p>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="my-4 h-px bg-gray-100 dark:bg-gray-700"></div>
                
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedOrder.status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : selectedOrder.status === "in_progress"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : selectedOrder.status === "pending"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                    <span className="inline-block h-2 w-2 rounded-full bg-current"></span>
                    {selectedOrder.status && typeof selectedOrder.status === 'string'
                      ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)
                      : "Pending"}
                  </span>
                </div>
              </div>

              {/* Members Card */}
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Shopper Details
                  </h4>
                </div>
                
                {selectedOrder.assignedTo && (
                  <div className="space-y-4">
                    {/* Shopper Profile */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
                        {selectedOrder.assignedTo?.shopper?.profile_photo ||
                        selectedOrder.assignedTo?.profile_picture ? (
                          <img
                            src={
                              selectedOrder.assignedTo?.shopper?.profile_photo ||
                              selectedOrder.assignedTo?.profile_picture
                            }
                            alt="Shopper"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-6 w-6 text-white"
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {selectedOrder.assignedTo?.shopper?.Employment_id && (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              00{selectedOrder.assignedTo.shopper.Employment_id}
                            </span>
                          )}
                        </div>
                        <h5 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedOrder.assignedTo?.shopper?.full_name ||
                            selectedOrder.assignedTo?.name ||
                            "Shopper"}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedOrder.assignedTo?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-all hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        Contact
                      </button>
                      <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
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
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Report
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shared Files Card */}
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Order Items
                  </h4>
                  <button className="text-xs font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                    View all
                  </button>
                </div>
                <div className="space-y-2.5">
                  {selectedOrder.items?.slice(0, 3).map((item: any, index: number) => (
                    <div
                      key={index}
                      className="group flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-6 w-6 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                          {item.name || "Product"}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info Card */}
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Delivery Info
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        Delivery Address
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        {selectedOrder.delivery_address || "Not provided"}
                      </p>
                    </div>
                  </div>
                  
                  {selectedOrder.shop?.address && (
                    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
                        <svg
                          className="h-5 w-5 text-green-600 dark:text-green-400"
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
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          Shop Location
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                          {selectedOrder.shop.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                Select a conversation to view<br />order details and information
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

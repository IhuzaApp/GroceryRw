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

// Helper to format time (e.g., "01:09 am", "08:24PM")
function formatTime(timestamp: any): string {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp
      ? timestamp.toDate()
      : new Date(timestamp);

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
    timestamp instanceof Timestamp
      ? timestamp.toDate()
      : new Date(timestamp);

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
      const conv = conversations.find(
        (c) => c.orderId === selectedOrderId
      );
      if (conv) {
        setSelectedConversation(conv);
      }
    } else if (filteredConversations.length > 0 && !selectedConversation) {
      setSelectedConversation(filteredConversations[0]);
    }
  }, [selectedOrderId, conversations, filteredConversations]);

  // Get conversation ID when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Get conversation ID
      const getConversationId = async () => {
        try {
          const conversationsRef = collection(db, "chat_conversations");
          const q = query(
            conversationsRef,
            where("orderId", "==", selectedConversation.orderId)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setConversationId(querySnapshot.docs[0].id);
          }
        } catch (error) {
          console.error("Error getting conversation ID:", error);
        }
      };
      getConversationId();
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
    <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
      {/* Left Column - Conversation List */}
      <div className="w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full flex-shrink-0">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Customer Message</h1>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:border-green-500 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-green-500"
              />
              <svg
                className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
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
            <button className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No conversations found</p>
              </div>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const order = orders[conversation.orderId] || {};
              // For customer messages page, show shopper info in the list
              const contactName =
                order?.assignedTo?.name ||
                order?.shopper?.name ||
                "Shopper";
              const contactAvatar =
                order?.assignedTo?.profile_picture ||
                order?.shopper?.avatar ||
                "/images/ProfileImage.png";
              const isSelected =
                selectedConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`flex cursor-pointer items-start gap-3 border-b border-gray-100 dark:border-gray-700 px-6 py-4 transition-colors ${
                    isSelected
                      ? "bg-gray-50 dark:bg-gray-700/50"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={contactAvatar}
                      alt={contactName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {contactName}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column - Chat Window */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-full overflow-hidden min-w-0">
        {selectedConversation && selectedOrder ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedOrder.assignedTo?.profile_picture ||
                    selectedOrder.shopper?.avatar ||
                    "/images/ProfileImage.png"
                  }
                  alt={
                    selectedOrder.assignedTo?.name ||
                    selectedOrder.shopper?.name ||
                    "Shopper"
                  }
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedOrder.assignedTo?.name ||
                      selectedOrder.shopper?.name ||
                      "Shopper"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedOrder.shop?.address ||
                      selectedOrder.delivery_address ||
                      "Location not available"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order #{formatOrderID(selectedOrder.OrderID || selectedOrder.id)}
                </div>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 px-6 py-4 min-h-0"
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
                          className={`flex items-start gap-3 ${
                            isCurrentUser ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <img
                            src={
                              isCurrentUser
                                ? session?.user?.image ||
                                  "/images/userProfile.png"
                                : selectedOrder.assignedTo?.profile_picture ||
                                  selectedOrder.shopper?.avatar ||
                                  "/images/ProfileImage.png"
                            }
                            alt={
                              isCurrentUser
                                ? session?.user?.name || "You"
                                : selectedOrder.assignedTo?.name ||
                                  selectedOrder.shopper?.name ||
                                  "Shopper"
                            }
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div
                            className={`flex flex-col ${
                              isCurrentUser ? "items-end" : "items-start"
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {isCurrentUser
                                  ? session?.user?.name || "You"
                                  : selectedOrder.assignedTo?.name ||
                                    selectedOrder.shopper?.name ||
                                    "Shopper"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <div
                              className={`max-w-md rounded-2xl px-4 py-2.5 ${
                                isCurrentUser
                                  ? "bg-white dark:bg-gray-800"
                                  : "bg-white dark:bg-gray-800"
                              } shadow-sm`}
                            >
                              {message.product ? (
                                <div className="flex gap-3">
                                  <img
                                    src={message.product.image}
                                    alt={message.product.name}
                                    className="h-15 w-15 rounded object-cover"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {message.product.name}
                                    </p>
                                    <p className="text-sm font-semibold text-green-500">
                                      Rp {message.product.price.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {message.text || message.message || ""}
                                </p>
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
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:border-green-500 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-green-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600 dark:hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

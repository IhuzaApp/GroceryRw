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
    <div className="flex h-full w-full overflow-hidden rounded-lg bg-gray-50 shadow-sm dark:bg-gray-900">
      {/* Left Column - Conversation List */}
      <div className="flex h-full w-96 flex-shrink-0  flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Client Messages
          </h1>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
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
        <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500"
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
            <button className="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600">
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
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No conversations found
                </p>
              </div>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const order = orders[conversation.orderId] || {};
              // For customer messages page, show shopper info in the list
              const contactName =
                order?.assignedTo?.name || order?.shopper?.name || "Shopper";
              const contactAvatar =
                order?.assignedTo?.profile_picture ||
                order?.shopper?.avatar ||
                "/images/ProfileImage.png";
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`flex cursor-pointer items-start gap-3 border-b border-gray-100 px-6 py-4 transition-colors dark:border-gray-700 ${
                    isSelected
                      ? "bg-gray-50 dark:bg-gray-700/50"
                      : "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      {contactAvatar &&
                      contactAvatar !== "/images/ProfileImage.png" ? (
                        <img
                          src={contactAvatar}
                          alt={contactName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-6 w-6 text-gray-500 dark:text-gray-400"
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
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {contactName}
                      </h3>
                      <div className="flex flex-shrink-0 items-center gap-2">
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
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {selectedConversation && selectedOrder ? (
          <>
            {/* Chat Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  {selectedOrder.assignedTo?.profile_picture ||
                  selectedOrder.shopper?.avatar ? (
                    <img
                      src={
                        selectedOrder.assignedTo?.profile_picture ||
                        selectedOrder.shopper?.avatar
                      }
                      alt={
                        selectedOrder.assignedTo?.name ||
                        selectedOrder.shopper?.name ||
                        "Shopper"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-6 w-6 text-gray-500 dark:text-gray-400"
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
                  Order #
                  {formatOrderID(selectedOrder.OrderID || selectedOrder.id)}
                </div>
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
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
              className="min-h-0 flex-1  overflow-y-auto px-6 py-4"
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
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            {isCurrentUser ? (
                              session?.user?.image ? (
                                <img
                                  src={session.user.image}
                                  alt={session?.user?.name || "You"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <svg
                                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
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
                            ) : selectedOrder.assignedTo?.profile_picture ||
                              selectedOrder.shopper?.avatar ? (
                              <img
                                src={
                                  selectedOrder.assignedTo?.profile_picture ||
                                  selectedOrder.shopper?.avatar
                                }
                                alt={
                                  selectedOrder.assignedTo?.name ||
                                  selectedOrder.shopper?.name ||
                                  "Shopper"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg
                                className="h-5 w-5 text-gray-500 dark:text-gray-400"
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
                                  ? "bg-green-500 text-white shadow-md"
                                  : "bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                              }`}
                            >
                              {message.product ? (
                                <div className="flex gap-3">
                                  <img
                                    src={message.product.image}
                                    alt={message.product.name}
                                    className="h-15 w-15 rounded object-cover"
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
                                      className={`text-sm font-semibold ${
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
                                <p
                                  className={`text-sm ${
                                    isCurrentUser
                                      ? "text-white"
                                      : "text-gray-900 dark:text-white"
                                  }`}
                                >
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
            <div className="flex-shrink-0 border-t border-gray-200 px-6  py-4 dark:border-gray-700">
              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-3"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full rounded-full border border-gray-300 bg-gray-50 px-5 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:bg-gray-600 dark:focus:ring-green-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="flex-shrink-0 rounded-full bg-green-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-green-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-500 disabled:hover:shadow-lg dark:focus:ring-offset-gray-800"
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

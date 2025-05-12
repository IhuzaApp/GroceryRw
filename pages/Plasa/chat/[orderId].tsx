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
import { db, storage } from "../../../src/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { formatCurrency } from "../../../src/lib/formatCurrency";

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
  image?: string;
}

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

export default function ChatPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<{
    id: string;
    name: string;
    avatar: string;
    lastSeen: string;
  } | null>(null);
  const [order, setOrder] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat and fetch customer data
  useEffect(() => {
    if (!orderId || !user?.id) return;

    const fetchOrderAndCustomer = async () => {
      setIsLoading(true);
      try {
        // Fetch order details
        const res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
        const data = await res.json();

        if (data.order) {
          setOrder(data.order);

          // Set customer data
          setCustomerData({
            id: data.order.user_id,
            name: data.order.user_name || "Customer",
          avatar: "/placeholder.svg?height=80&width=80",
          lastSeen: "Online now",
          });

          // Get or create conversation
          await getOrCreateConversation(data.order.id, data.order.user_id);
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

      setMessages(messagesList);

      // Mark messages as read if they were sent to the current user
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
    });

    return () => unsubscribe();
  }, [conversationId, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id || !conversationId || !customerData?.id)
      return;

    try {
      setIsSending(true);

      // Add new message to Firestore
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text: message.trim(),
        message: message.trim(),
        senderId: user.id,
        senderName: user.name || "Shopper",
        senderType: "shopper",
        recipientId: customerData.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation with last message
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
      });

      // Clear input
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files ||
      !e.target.files[0] ||
      !user?.id ||
      !conversationId ||
      !customerData?.id
    )
      return;

    try {
      setUploadingImage(true);
      const file = e.target.files[0];

      // Upload image to Firebase Storage
      const storageRef = ref(
        storage,
        `chat_images/${orderId}/${Date.now()}_${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add message with image
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text: "", // Use text field for consistency
        message: "", // Also include message field for compatibility
        senderId: user.id,
        senderName: user.name || "Shopper",
        senderType: "shopper",
        recipientId: customerData.id,
        timestamp: serverTimestamp(),
        read: false,
        image: downloadURL,
      });

      // Update conversation
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: "📷 Image",
        lastMessageTime: serverTimestamp(),
      });

      setShowAttachmentOptions(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Group messages by date for better display
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    let currentGroup: Message[] = [];

    messages.forEach((message) => {
      const messageDate = formatMessageDate(message.timestamp);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (!customerData && isLoading) {
    return (
      <ShopperLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader size="lg" content="Loading conversation..." />
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div className="p-4 h-[calc(100vh-80px)]">
        {isLoading ? (
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : !customerData ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 p-4 rounded-md">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 mt-2">Error fetching customer data</p>
              <Button
                appearance="primary"
                color="red"
                className="mt-4"
                onClick={() => router.push("/Plasa")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : !user ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Sign in Required</h2>
              <p className="text-blue-600 mb-6">Please sign in to view messages.</p>
              <Link href="/login" passHref>
                <Button appearance="primary" color="blue">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-1xl mx-auto w-full h-full flex flex-col">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col h-full">
              {/* Order info */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-600 mr-3">
                    {customerData?.name?.substring(0, 2).toUpperCase() || 'CU'}
                  </div>
                  <div>
                    <h2 className="font-medium">
                      {customerData?.name || 'Customer'} - Order #{formatOrderID(order?.OrderID || orderId)}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500">
                      <span
                        className={`
                        px-2 py-0.5 rounded-full text-xs mr-2
                        ${
                          order?.status === 'shopping' ? 'bg-orange-100 text-orange-800' : 
                          order?.status === 'on_the_way' ? 'bg-blue-100 text-blue-800' : 
                          order?.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }
                      `}
                      >
                        {order?.status === 'shopping' ? 'Shopping' : 
                         order?.status === 'packing' ? 'Packing' : 
                         order?.status === 'on_the_way' ? 'On the way' : 
                         order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1) || 'Unknown'}
                      </span>
                      <span>{formatCurrency(order?.total || 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    appearance="ghost" 
                    className="flex items-center justify-center h-8 w-8 p-0"
                    onClick={() => router.push(`/Plasa/orders/${orderId}`)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M4 6h16M4 12h16M4 18h7"></path>
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Messages - make this area scrollable */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-100" ref={messagesEndRef}>
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-gray-500 py-20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mb-3 h-12 w-12"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p>No messages yet</p>
                    <p className="text-sm">
                      Start the conversation with {customerData?.name || 'the customer'}
                    </p>
                  </div>
                ) : (
                  messageGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                      <div className="flex justify-center">
                        <div className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                          {group.date}
                        </div>
                      </div>

                      {group.messages.map((msg) => {
                        const isShopperMessage = msg.senderType === "shopper";
                        const messageText = msg.text || msg.message || "";

                        return (
                          <div
                            key={msg.id}
                            className={`flex items-start gap-3 ${
                              isShopperMessage ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div
                              className={`
                                h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center
                                ${
                                  isShopperMessage
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }
                              `}
                            >
                              {isShopperMessage
                                ? user?.name?.substring(0, 2).toUpperCase() || "SH"
                                : customerData?.name?.substring(0, 2).toUpperCase() || "CU"}
                            </div>

                            <div
                              className={`
                                rounded-lg p-3 max-w-[85%]
                                ${
                                  isShopperMessage
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 text-gray-800"
                                }
                              `}
                            >
                              {messageText && <p className="text-sm">{messageText}</p>}
                              {msg.image && (
                                <div className="mt-2">
                                <Avatar color="blue" circle  size="xs"/>
                                </div>
                              )}
                              <span
                                className={`
                                  text-xs mt-1 block
                                  ${
                                    isShopperMessage ? "text-green-200" : "text-gray-500"
                                  }
                                `}
                              >
                                {formatMessageTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Quick Replies */}
              <div className="overflow-x-auto whitespace-nowrap border-t bg-white p-2 shrink-0">
                <div className="flex gap-2">
                  <Button
                    appearance="ghost"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setMessage("I found it")}
                  >
                    I found it
                  </Button>
                  <Button
                    appearance="ghost"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setMessage("They're out of stock")}
                  >
                    They're out of stock
                  </Button>
                  <Button
                    appearance="ghost"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setMessage("Would you like an alternative?")}
                  >
                    Alternative?
                  </Button>
                </div>
              </div>

              {/* Message input - fixed at bottom */}
              <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    appearance="subtle"
                    className="rounded-full h-10 w-10 flex items-center justify-center p-0"
                    onClick={handleAttachmentClick}
                    disabled={isSending || uploadingImage || order?.status === "delivered"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  </Button>

                  {/* Attachment Options Popup */}
                  {showAttachmentOptions && (
                    <div className="absolute bottom-16 left-4 z-10 rounded-lg bg-white p-2 shadow-lg">
                      <div className="flex flex-col gap-2">
                        <button
                          className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 text-blue-500"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>Gallery</span>
                        </button>
                        <button
                          className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
                          onClick={() => alert("Camera functionality would open here")}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 text-red-500"
                          >
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          <span>Camera</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  <input
                    type="text"
                    placeholder={
                      order?.status === "delivered"
                        ? "Chat is closed for delivered orders"
                        : "Type your message..."
                    }
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending || uploadingImage || order?.status === "delivered"}
                  />

                  <Button
                    appearance={message.trim() && order?.status !== "delivered" ? "primary" : "subtle"}
                    className={`rounded-full h-10 w-10 p-0 flex items-center justify-center ${
                      message.trim() && order?.status !== "delivered" ? "bg-green-500 text-white" : "text-gray-400"
                    }`}
                    onClick={handleSendMessage}
                    disabled={
                      (!message.trim() && !uploadingImage) ||
                      isSending ||
                      order?.status === "delivered"
                    }
                  >
                    {isSending || uploadingImage ? (
                      <Loader size="sm" />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M22 2L11 13" />
                        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    )}
                  </Button>
                </div>
                {order?.status === "delivered" && (
                  <div className="mt-2 text-center text-xs text-gray-500">
                    This order has been delivered. The chat is now closed.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}
